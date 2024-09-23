from flask import Flask, request, redirect, url_for, jsonify
from flask import  render_template,  redirect, url_for, current_app, session, flash


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
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
import time
import re
import secrets
import sqlite3
from flask_login import LoginManager, UserMixin, login_required, login_user, current_user
import bcrypt


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})
# Initialize LangChain Groq model
llm = "llama-3.1-70b-versatile"
model = ChatGroq(
    model_name=llm,
    temperature=0,
    groq_api_key='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'
)


app.secret_key = secrets.token_hex()
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
app.app_context().push()


class User(UserMixin):
    def __init__(self, id, username, phone, email, password):   
        self.id = id
        self.username = username
        self.phone = phone
        self.email = email
        self.password = password

def get_user_by_id(user_id):
    conn = sqlite3.connect('database3.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (int(user_id),))
    user_data = cursor.fetchone()
    conn.close()
    if user_data:
        return User(user_data[0], user_data[1], user_data[2], user_data[3], user_data[4])
    return None

@login_manager.user_loader
def load_user(user_id):
    return get_user_by_id(user_id)






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

    print(f"Creating collection with name: {collection_name}")
    
    chroma_collection = chroma_client.create_collection(collection_name)
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex(nodes, embed_model=embed_model, storage_context=storage_context)
    print(f"Collection {collection_name} created and indexed.")

# Function to calculate cosine similarity
def calcul_cosine_similarity(chroma_client, resumes_collection_name, jobs_collection_name):
    try:
        resumes_collection = chroma_client.get_collection(resumes_collection_name)
        jobs_collection = chroma_client.get_collection(jobs_collection_name)
    except Exception as e:
        print(f"Error accessing collections: {e}")
        raise e

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



def retry_request(func, *args, **kwargs):
    max_retries = 3
    delay = 1  # Start with a 1-second delay

    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if 'Rate limit exceeded' in str(e):
                print(f"Rate limit exceeded, retrying in {delay} seconds...")
                time.sleep(delay)
                delay *= 2  # Exponential backoff
            else:
                raise e
    raise Exception("Max retries exceeded")

def extract_skills_from_resume(resume_text):
    prompt = f"""
    Extract the skills and technologies mentioned in the following CV:
    {resume_text}

    Provide a list of skills and technologies, separated by commas.
    """
    try:
        prompt_temp = PromptTemplate(input_variables=["resume_text"], template=prompt)
        chain = prompt_temp | model
        skills_raw = retry_request(chain.invoke, {'resume_text': resume_text}).content.strip()
        skills = [skill.strip() for skill in skills_raw.split(',') if skill.strip()]
        return skills
    except Exception as e:
        print(f"Error extracting skills: {e}")
        return []

def generate_questions_from_skill(category, skill):
    prompt = f"""
    Generate 5 interview questions for the category {category} based on the skill: {skill}.

    Please follow this structure:
    - Question: question content
    - Difficulty: question difficulty. Easy/Medium/Hard
    - Category: question category
    """
    try:
        prompt_temp = PromptTemplate(input_variables=["category", "skill"], template=prompt)
        chain = prompt_temp | model
        questions_raw = retry_request(chain.invoke, {'skill': skill, 'category': category}).content.strip()
        questions = []
        for line in questions_raw.split('\n'):
            if "Question:" in line:
                question = line.replace("Question:", "").strip()
            elif "Difficulty:" in line:
                difficulty = line.replace("Difficulty:", "").strip()
                questions.append({'text': question, 'difficulty': difficulty, 'category': category})
        return questions
    except Exception as e:
        print(f"Error generating questions: {e}")
        return []  

# Initialize the model outside of the endpoint to avoid reloading it on every request
llm = "llama-3.1-70b-versatile"
model = ChatGroq(model_name=llm, temperature=0, groq_api_key='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')



def extract_skills_from_resume2(resume_text):
    prompt = f"""
    Extract the skills and technologies mentioned in the following CV:
    {resume_text}

    Provide a list of skills and technologies, separated by commas.
    """
    try:
        prompt_temp = PromptTemplate(input_variables=["resume_text"], template=prompt)
        chain = prompt_temp | model
        skills_raw = chain.invoke({'resume_text': resume_text}).content.strip()
        skills = [skill.strip() for skill in skills_raw.split(',') if skill.strip()]
        return skills
    except Exception as e:
        print(f"Error extracting skills: {e}")
        return []
def generate_questions_from_skill2(category, skill):
    prompt = f"""
    Generate 5 interview questions for the category {category} based on the skill: {skill}.

    Please provide the questions in the following format:
    Question: [question content]
    Difficulty: [question difficulty - Easy/Medium/Hard]
    Category: [question category]

    Ensure there is no extra formatting or symbols before the difficulty level or question content.
    """
    try:
        prompt_temp = PromptTemplate(input_variables=["category", "skill"], template=prompt)
        chain = prompt_temp | model
        questions_raw = chain.invoke({'skill': skill, 'category': category}).content.strip()
        questions = []
        question = None
        for line in questions_raw.split('\n'):
            if line.startswith("Question:"):
                question = line.replace("Question:", "").strip()
            elif line.startswith("Difficulty:"):
                difficulty = line.replace("Difficulty:", "").strip()
                if question:
                    questions.append({'text': question, 'difficulty': difficulty, 'category': category})
                    question = None
        return questions
    except Exception as e:
        print(f"Error generating questions: {e}")
        return []
def retry_request(func, *args, **kwargs):
    max_retries = 3
    delay = 2  # Initial delay in seconds
    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(delay)
                delay *= 2  # Exponential backoff
            else:
                raise e
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

    print(f"Creating collection with name: {collection_name}")
    
    chroma_collection = chroma_client.create_collection(collection_name)
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex(nodes, embed_model=embed_model, storage_context=storage_context)
    print(f"Collection {collection_name} created and indexed.")

def extract_skills_and_projects_from_resume(resume_text):
    prompt = f"""
    Please provide:
    1. A list of **general skills and technologies** that are not specifically tied to any project.
    2. For each project:
       - The project name.
       - A brief summary of what the user did in the project.
       - A list of **skills and technologies** used specifically for the project (these should not be included in the general skills list).

    Ensure there is no overlap between the general skills list and the project-specific skills list.

    resume : {resume_text}

    Format the output as (don't add any additional text):

    General Skills: [comma-separated list of general skills and technologies]
    Projects:
    1. Project Name: [name]
       Summary: [brief summary of the user's role or achievements in the project]
       Skills Used: [comma-separated list of skills and technologies used in this project]
    """

    try:
        prompt_temp = PromptTemplate(input_variables=["resume_text"], template=prompt)
        chain = prompt_temp | model
        extracted_info = chain.invoke({'resume_text': resume_text}).content.strip()

        # Process the raw output into the desired format
        result = {"general_skills": [], "projects": {}}

        # Splitting the sections
        sections = extracted_info.split("Projects:")
        general_skills = sections[0].replace("General Skills:", "").strip().split(",")
        result["general_skills"] = [skill.strip() for skill in general_skills if skill.strip()]

        # Extracting projects
        projects = sections[1].split("\n\n")
        project_counter = 1
        for project in projects:
            if "Project Name" in project:
                name_line = [line for line in project.split("\n") if "Project Name" in line][0]
                summary_line = [line for line in project.split("\n") if "Summary" in line][0]
                skills_line = [line for line in project.split("\n") if "Skills Used" in line][0]

                project_name = name_line.replace("Project Name:", "").strip()
                project_summary = summary_line.replace("Summary:", "").strip()
                project_skills = skills_line.replace("Skills Used:", "").strip().split(",")
                project_skills = [skill.strip() for skill in project_skills if skill.strip()]

                result["projects"][f"project{project_counter}"] = {
                    "project_name": project_name,
                    "summary": project_summary,
                    "skills_used": project_skills
                }
                project_counter += 1

        return result
    except Exception as e:
        print(f"Error extracting skills and projects: {e}")
        return {}

def generate_questions_from_skill_project(category, skill_or_project, skill):
    if not skill:
        num_questions = 5
        x = "project"
    else:
        num_questions = 3
        x = "skill"

    prompt = f"""
    Act like a recruiter conducting an interview (don't ask for the code). Based on the {x}: {skill_or_project}, generate {num_questions} interview questions.

    Please provide the questions in the following format:
    Question: [question content]
    Difficulty: [question difficulty - Easy/Medium/Hard]
    Category: [question category]

    Ensure there is no extra formatting or symbols before the difficulty level or question content.
    """

    try:
        prompt_temp = PromptTemplate(input_variables=["category", "skill_or_project"], template=prompt)
        chain = prompt_temp | model
        questions_raw = chain.invoke({'skill_or_project': skill_or_project, 'category': category}).content.strip()

        questions = []
        question = None
        for line in questions_raw.split('\n'):
            if line.startswith("Question:"):
                question = line.replace("Question:", "").strip()
            elif line.startswith("Difficulty:"):
                difficulty = line.replace("Difficulty:", "").strip()
                if question:
                    questions.append({'text': question, 'difficulty': difficulty, 'category': category})
                    question = None
        return questions
    except Exception as e:
        print(f"Error generating questions: {e}")
        return []

def generate_feedback_from_llm(question_text, user_answer):
    prompt = f"""
    You are an interviewer providing brief and concise feedback to my answer. (don't ask questions in the feedback)
    Keep the feedback to the point and also give an indicator score (0-10) on whether my answer is sufficient to move to a higher difficulty level or if it requires a change.

    Follow these guidelines for the indicator score:
    - 0-4 : Decrease the difficulty level if possible.
    - 5-6 : Keep the difficulty level the same.
    - 7-10 : Increase the difficulty level if possible.

    Question: {question_text}
    Answer: {user_answer}

    output format
    Feedback :
    Indicator: 0-10
    """
    try:
        prompt_temp = PromptTemplate(input_variables=["question_text", "user_answer"], template=prompt)
        chain = prompt_temp | model
        response = chain.invoke({'question_text': question_text, 'user_answer': user_answer})
        feedback_raw = response.content.strip()
        feedback_lines = feedback_raw.split('\n')

        feedback = ""
        indicator = 6  # Default indicator value

        for line in feedback_lines:
            if "Indicator:" in line:
                indicator = int(line.split(":")[1].strip())
            else:
                feedback += line + "\n"

        return feedback.strip(), indicator
    except Exception as e:
        return "Error generating feedback. No feedback available.", 6

@app.route('/extract', methods=['POST'])
def extract_skills_and_projects():
    data = request.json
    resume_text = data.get('resume_text', '')
    result = extract_skills_and_projects_from_resume(resume_text)
    return jsonify(result)

@app.route('/questions', methods=['POST'])
def generate_questions1():
    data = request.json
    category = data.get('category', 'Data Science')
    skill_or_project = data.get('skill_or_project', '')
    skill = data.get('skill', True)
    questions = generate_questions_from_skill_project(category, skill_or_project, skill)
    return jsonify(questions)

@app.route('/feedback', methods=['POST'])
def generate_feedback():
    data = request.json
    question_text = data.get('question_text', '')
    user_answer = data.get('user_answer', '')
    feedback, indicator = generate_feedback_from_llm(question_text, user_answer)
    return jsonify({"feedback": feedback, "indicator": indicator})

@app.route('/login', methods=['POST'])
def login():
    error = None
    if request.method == 'POST':
        data = request.json
        email = data.get('email')
        password = data.get('password')

        conn = sqlite3.connect('database3.db')
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            user_data = cursor.fetchone()
            if user_data:
                hashed_password = user_data[4]  # Assuming password is stored at index 4
                if bcrypt.checkpw(password.encode('utf-8'), hashed_password):
                    user = User(user_data[0], user_data[1], user_data[2], user_data[3], user_data[4])
                    login_user(user)
                    return {'success': True, 'redirect': '/'}
                else:
                    error = 'Incorrect password'
            else:
                error = 'User not found'
        finally:
            cursor.close()
            conn.close()

    return {'success': False, 'error': error}

@app.route('/register', methods=['POST'])
def register():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        phone = request.form['phone']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        
        valid_phone, phone_msg = validate_phone(phone)
        valid_password, password_msg = validate_password(password)
        valid_email, email_msg = validate_email(email)

        if not valid_phone:
            error = phone_msg
        elif not valid_email:
            error = email_msg
        elif not valid_password:
            error = password_msg
        elif password != confirm_password:
            error = 'The password and confirmation password do not match.'
        else:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            conn = sqlite3.connect('database3.db')
            cursor = conn.cursor()
            cursor.execute('INSERT INTO users (username, phone, email, password) VALUES (?, ?, ?, ?)', 
                           (username, phone, email, hashed_password))
            conn.commit()
            conn.close()
            return jsonify({'success': True})

    return jsonify({'success': False, 'error': error})
@app.route('/dashboard')
@login_required
def dashboard():
    return f'Bonjour, {current_user.username}'

@app.route('/index')  # Ensure there is a route for the root path
def index():
    return 'Welcome to the home page'

def validate_email(email):
    conn = sqlite3.connect('database3.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    if user:
        return False, 'Email already exists. Try to log in!'   
    return True, ''

def validate_phone(phone):
    if not phone.startswith('+'):
        return False, 'Phone number must start with "+ international code".'
    digits_only = phone[1:]  # Exclude "+" to keep only digits
    if not digits_only.isdigit():
        return False, 'Phone number must contain only digits.'
    if len(digits_only) < 9 or len(digits_only) > 14:
        return False, 'Phone number must contain between 9 and 14 digits.'
    
    conn = sqlite3.connect('database3.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))
    user = cursor.fetchone()
    conn.close()
    if user:
        return False, 'Phone number already exists. Please use a different one!'
    
    return True, ''

def validate_password(password):
    if len(password) < 8:
        return False, 'Password must be longer than 8 characters'
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain at least one number'
    return True, ''

def create_tables():
    conn = sqlite3.connect('database3.db')
    c = conn.cursor()
    with current_app.open_resource("schema.sql") as f:
        c.executescript(f.read().decode("utf8"))
    conn.commit()
    conn.close()


@app.route('/generate-question', methods=['POST'])
def handle_generate_question():
    data = request.json
    resume_text = data.get('resume_text', '')
    category = data.get('category', 'Data Science')  

    skills = extract_skills_from_resume2(resume_text)
    
    all_questions = []
    for skill in skills:
        questions = generate_questions_from_skill2(category, skill)
        all_questions.extend(questions)
    
    return jsonify({
        'skills': skills,
        'questions': all_questions
    })


@app.route('/generate-job-questions', methods=['POST'])
def generate_job_questions():
    data = request.json
    job_description = data.get('job_description')
    
    # Your existing prompt and model logic
    prompt = """Identify topics that can be used for interview questions based on this job description:

    {job_description}

    Please respect the following structure:
    [TOPIC_1, TOPIC_2, TOPIC_3]"""

    prompt_template = PromptTemplate(input_variables=["job_description"], template=prompt)
    chain = prompt_template | model

    try:
        # Generate topics from the job description
        content = retry_request(chain.invoke, {'job_description': job_description }).content.strip()
    except Exception as e:
        return jsonify({'error': str(e)}), 503

    topics = [topic.strip() for topic in content[content.index('[')+1:content.index(']')].split(',')]

    category = "Data Science"

    questions = []
    question_prompt = """
    Generate 5 questions for the category {category} Topic: {topic}

    Please keep the questions varied and don't maintain the same meaning.

    Please conform with the following structure:
    [question_content, difficulty_level]
    [question_content, difficulty_level]
    [question_content, difficulty_level]
    """

    question_prompt_template = PromptTemplate(input_variables=["category", "topic"], template=question_prompt)
    question_chain = question_prompt_template | model

    for topic in topics:
        try:
            questions_raw = retry_request(question_chain.invoke, {'topic': topic, 'category': category }).content.strip()
        except Exception as e:
            return jsonify({'error': str(e)}), 503
        
        # Process each question
        loc_questions = []
        for line in questions_raw.split('\n'):
            if '[' in line and ']' in line:
                try:
                    question_data = line[line.index('[')+1: line.index(']')].replace('"', '').split(',')
                    if len(question_data) == 2:  # Ensure both question and difficulty level are present
                        loc_questions.append(question_data)
                except ValueError:
                    continue  # Skip malformed questions
        
        questions += loc_questions

    return jsonify({'questions': questions})



@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        results = data.get('results', [])

        all_questions = []
        category = "Data Science"  

        for result in results:
            resume_text = result.get('cv_text', '')
            skills = extract_skills_from_resume(resume_text)
            for skill in skills:
                questions = generate_questions_from_skill(category, skill)
                all_questions.extend(questions)

        return jsonify(all_questions)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
    

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
        resumes_collection_name = generate_unique_collection_name("resumes_collection")
        jobs_collection_name = generate_unique_collection_name("jobs_collection")

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

@app.route('/generate-resume-questions', methods=['POST'])
def generate_questions2():
    try:
        data = request.json
        resume_text = data.get('resume_text', '')
        if not resume_text:
            return jsonify({'error': 'Missing resume text'}), 400

        # Extract skills from the resume
        skills = extract_skills_from_resume(resume_text)

        all_questions = []
        category = "Data Science"  # Adjust this if necessary

        for skill in skills:
            # Generate questions for each skill
            questions = generate_questions_from_skill(category, skill)
            all_questions.extend(questions)

        return jsonify({'skills': skills, 'questions': all_questions})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
