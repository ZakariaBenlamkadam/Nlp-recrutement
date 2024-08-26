from flask import Flask, request, jsonify
from flask_cors import CORS
from pdfminer.high_level import extract_text
from groq import Groq
import json
import re

app = Flask(__name__)
CORS(app)  # Allow CORS for all routes

client = Groq(api_key="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")

columns = [
    'Name', 'Contact Information', 'Address', 'Education',
    'Work Experience', 'Skills', 'Certifications',
    'Languages', 'Projects', 'Hobbies'
]

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_information(cv_text):
    prompt_content = f"""
    You are tasked with extracting information from the following CV. Please extract the following details and store them in a structured format:
    1. Name
    2. Contact Information (email, phone number, etc.)
    3. Address
    4. Education (degrees, institutions, graduation years)
    5. Work Experience (job titles, companies, durations)
    6. Skills (technical and soft skills)
    7. Certifications (professional certifications and courses)
    8. Languages (languages spoken and proficiency levels)
    9. Projects (significant projects completed)
    10. Hobbies (personal interests and hobbies)

    If any of these items are not present in the CV, please set them to None in the structure.

    CV:
    {cv_text}

    Output the extracted information in a JSON format with the following structure:
    {{
        "Name": "",
        "Contact Information": [],
        "Address": "",
        "Education": [],
        "Work Experience": [],
        "Skills": [],
        "Certifications": "",
        "Languages": [],
        "Projects": "",
        "Hobbies": []
    }}
    """

    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt_content}],
        model="llama3-8b-8192",
    )

    response_text = chat_completion.choices[0].message.content

    try:
        # Use regex to extract the JSON content
        match = re.search(r'\{.*\}', response_text, re.DOTALL)  
        if match:
            # Parse the JSON string directly into a dictionary
            extracted_info = json.loads(match.group())
        else:
            print("Failed to parse the output. Here is the raw content:")
            print(response_text)
            extracted_info = {col: None for col in columns}
    except json.JSONDecodeError:
        print("Failed to parse the output. Here is the raw content:")
        print(response_text)
        extracted_info = {col: None for col in columns}

    return extracted_info  # No need for jsonify here

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith('.pdf'):
        file_path = "uploaded_resume.pdf"
        file.save(file_path)
        cv_text = extract_text_from_pdf(file_path)
        extracted_info = extract_information(cv_text)
        return jsonify(extracted_info)

    return extracted_info

if __name__ == '__main__':
    app.run(debug=True)
