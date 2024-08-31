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

app = Flask(__name__)
CORS(app)
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

    cv_chunks = {}
    cv_texts = {}

    for i, metadata in enumerate(resumes_metadatas):
        node_content = json.loads(metadata['_node_content'])
        index_id = node_content['index_id']
        order_id = int(node_content["metadata"]["order_id"])

        if index_id not in cv_chunks:
            cv_chunks[index_id] = []
            cv_texts[index_id] = []
        cv_chunks[index_id].append((order_id, resumes_embeddings[i]))
        cv_texts[index_id].append((order_id, resumes_documents[i]))

    concatenated_texts = {}
    for index_id, chunks in cv_texts.items():
        sorted_chunks = sorted(chunks, key=lambda x: x[0])
        full_text = " ".join(chunk[1] for chunk in sorted_chunks)
        concatenated_texts[index_id] = full_text

    results = []

    for job_idx in range(len(jobs_vectors)):
        job_embedding = jobs_vectors[job_idx]
        for cv_id, chunks in cv_chunks.items():
            sorted_chunks = sorted(chunks, key=lambda x: x[0])
            chunks_vectors = np.array([chunk[1] for chunk in sorted_chunks])

            similarities_cosine = cosine_similarity(chunks_vectors, job_embedding.reshape(1, -1))
            similarities_cosine = np.where(similarities_cosine < 0, 0, similarities_cosine)
            max_similarity_cosine = similarities_cosine.max()

            results.append({
                'job_idx': job_idx,
                'cv_id': int(cv_id),
                'similarity_cosine': max_similarity_cosine,
                'cv_text': concatenated_texts[cv_id]
            })

    df_results = pd.DataFrame(results)
    df_with_scores = df_results.sort_values(by=['similarity_cosine'], ascending=False)
    return df_with_scores

@app.route('/upload', methods=['POST'])
def upload_files():
    print("Received a request")
    try:
        resumes_file = request.files['resumes']
        job_description_text = request.form.get('job_description')

        if not resumes_file or not job_description_text:
            print("Missing file or job description")
            return jsonify({'error': 'Missing file or job description'}), 400

        print("Processing resumes file")
        resumes_df = pd.read_csv(resumes_file)
        print("Resumes DataFrame created")

        resumes_df['Resume'] = resumes_df['Resume'].apply(clear_fun)
        resumes_df = resumes_df.rename(columns={'Resume': 'text'})

        job_description_df = pd.DataFrame({
            'Job Title': ['Data Scientist'],
            'text': [clear_fun(job_description_text)]
        })

        print("DataFrames prepared")
        chroma_client = chromadb.EphemeralClient()
        resumes_collection_name = "resumes_collection"
        jobs_collection_name = "jobs_collection"

        print("Embedding resumes")
        embedding_chuncking(resumes_df, chroma_client, resumes_collection_name)
        print("Embedding job descriptions")
        embedding_chuncking(job_description_df, chroma_client, jobs_collection_name)

        print("Calculating cosine similarity")
        df_with_scores = calcul_cosine_similarity(chroma_client, resumes_collection_name, jobs_collection_name)
        
        print("Returning results")
        return df_with_scores.to_json(orient='records')

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
