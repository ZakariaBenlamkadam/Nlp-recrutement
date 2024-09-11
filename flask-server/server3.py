from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import chromadb
from llama_index.core import VectorStoreIndex
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.schema import IndexNode
import json
import re
import string
from datetime import datetime
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Initialize question generation pipeline
qg_pipeline = pipeline('question-generation', model="valhalla/t5-small-e2e-qg")

# Text cleaning function
def clear_fun(text):
    text = text.lower()
    text = re.sub('\[.*?\]', ' ', text)
    text = re.sub("\\W"," ",text)
    text = re.sub('https?://\S+|www\.\S+', ' ', text)
    text = re.sub('<.*?>+', ' ', text)
    text = re.sub('[%s]' % re.escape(string.punctuation), ' ', text)
    text = re.sub('\n', ' ', text)
    text = re.sub('\w*\d\w*', ' ', text)
    return text

# Function to generate a unique collection name
def generate_unique_collection_name(base_name):
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"{base_name}_{timestamp}"

# Function to chunk and embed text
def embedding_chuncking(df, chroma_client, collection_name, model_name="sentence-transformers/all-mpnet-base-v2"):
    splitter = SentenceSplitter(chunk_size=1024, chunk_overlap=70)
    nodes = []
    for i, row in df.iterrows():
        splt = splitter.split_text(row['text'])
        for j, doc in enumerate(splt):
            new_node = IndexNode(
                        text=doc,
                        index_id=str(i),
                        metadata={'order_id': str(j)}
                    )
            nodes.append(new_node)

    embed_model = HuggingFaceEmbedding(model_name=model_name)
    chroma_collection = chroma_client.create_collection(collection_name)
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex(nodes, embed_model=embed_model, storage_context=storage_context)

# Function to generate interview questions
def generate_questions(resume_text):
    return qg_pipeline(resume_text)

# Function to calculate cosine similarity
def calcul_cosine_similarity(chroma_client, resumes_collection_name, jobs_collection_name):
    resumes_collection = chroma_client.get_collection(resumes_collection_name)
    jobs_collection = chroma_client.get_collection(jobs_collection_name)

    resumes_data = resumes_collection.get(include=['embeddings', 'metadatas', 'documents'])
    jobs_embeddings = jobs_collection.get(include=['embeddings'])

    resumes_embeddings = np.array(resumes_data['embeddings'])
    resumes_metadatas = resumes_data['metadatas']
    resumes_documents = resumes_data['documents']
    jobs_vectors = np.array(jobs_embeddings['embeddings'])

    results = []

    for job_idx in range(len(jobs_vectors)):
        job_embedding = jobs_vectors[job_idx]
        for cv_id, (embedding, resume_text) in enumerate(zip(resumes_embeddings, resumes_documents)):
            similarity_cosine = cosine_similarity([embedding], [job_embedding])[0][0]
            questions = generate_questions(resume_text)
            results.append({
                'cv_id': cv_id,
                'similarity_cosine': similarity_cosine,
                'cv_text': resume_text,
                'questions': questions
            })

    df_results = pd.DataFrame(results)
    return df_results.sort_values(by='similarity_cosine', ascending=False)

@app.route('/upload', methods=['POST'])
def upload_files():
    try:
        resumes_file = request.files['resumes']
        job_description_text = request.form.get('job_description')

        if not resumes_file or not job_description_text:
            return jsonify({'error': 'Missing file or job description'}), 400

        resumes_df = pd.read_csv(resumes_file)
        resumes_df['Resume'] = resumes_df['Resume'].apply(clear_fun)
        resumes_df = resumes_df.rename(columns={'Resume': 'text'})

        job_description_df = pd.DataFrame({
            'Job Title': ['Data Scientist'],
            'text': [clear_fun(job_description_text)]
        })

        chroma_client = chromadb.EphemeralClient()
        resumes_collection_name = generate_unique_collection_name("resumes_collection")
        jobs_collection_name = generate_unique_collection_name("jobs_collection")

        embedding_chuncking(resumes_df, chroma_client, resumes_collection_name)
        embedding_chuncking(job_description_df, chroma_client, jobs_collection_name)

        df_with_scores = calcul_cosine_similarity(chroma_client, resumes_collection_name, jobs_collection_name)
        return df_with_scores.to_json(orient='records')

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
