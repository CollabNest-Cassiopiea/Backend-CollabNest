import re  # Regular expressions
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
import joblib
import random


# Expanded skills pool with 100+ technical skills
SKILLS_POOL = [
    "Python", "JavaScript", "Java", "C++", "Rust", "Go", "SQL", "TypeScript",
    "Machine Learning", "Deep Learning", "Computer Vision", "NLP",
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "OpenCV",
    "Data Analysis", "Data Visualization", "Big Data", "Hadoop", "Spark",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "DevOps",
    "Blockchain", "Smart Contracts", "Solidity", "Cryptography",
    "Web Development", "React", "Angular", "Vue", "Node.js", "Django",
    "Flask", "REST API", "GraphQL", "Microservices", "MongoDB", "PostgreSQL",
    "UI/UX Design", "Figma", "Adobe XD", "Prototyping", "Agile", "Scrum",
    "Embedded Systems", "IoT", "Robotics", "AR/VR", "Game Development",
    "Cybersecurity", "Network Security", "Ethical Hacking", "Penetration Testing",
    "Mathematics", "Statistics", "Linear Algebra", "Calculus", "Probability",
    "Cloud Computing", "Serverless", "Lambda", "EC2", "S3", "Redis",
    "Natural Language Processing", "Sentiment Analysis", "Topic Modeling",
    "Reinforcement Learning", "Neural Networks", "GANs", "Transfer Learning",
    "Data Engineering", "ETL", "Data Warehousing", "Data Pipelines",
    "Mobile Development", "Swift", "Kotlin", "React Native", "Flutter",
    "Test-Driven Development", "Unit Testing", "Integration Testing",
    "Performance Optimization", "Algorithms", "Data Structures"
]

def process_skills(skill_str):
    """Consistent skill processing across all data"""
    print(f"🔧 Processing skills: {skill_str}")  # Debug print
    skills = [s.strip().lower() for s in re.split(r',\s*', str(skill_str)) if s.strip()]
    print(f"🔧 Processed skills: {skills}")  # Debug print
    return skills

def generate_realistic_projects(num_projects=1000):
    """Fixed project generation with proper tech_stack handling"""
    print("🔨 Generating projects...")  # Debug print
    projects = []
    for pid in range(1, num_projects + 1):
        domain = random.choice(["AI/ML", "Web Dev", "Data Science", "Cloud", "Security"])
        skills = []
        
        # Domain-specific skill clusters
        if domain == "AI/ML":
            skills = random.sample([
                "Python", "Machine Learning", "Deep Learning", "TensorFlow",
                "PyTorch", "NLP", "Computer Vision", "Mathematics"
            ], 4)
        elif domain == "Web Dev":
            skills = random.sample([
                "JavaScript", "React", "Node.js", "REST API",
                "MongoDB", "Django", "AWS", "Docker"
            ], 4)
        elif domain == "Data Science":
            skills = random.sample([
                "Python", "Data Analysis", "Pandas", "NumPy",
                "SQL", "Data Visualization", "Big Data"
            ], 4)
        elif domain == "Cloud":
            skills = random.sample([
                "AWS", "Docker", "Kubernetes", "CI/CD",
                "Terraform", "Serverless", "Azure"
            ], 4)
        else:  # Security
            skills = random.sample([
                "Cybersecurity", "Cryptography", "Network Security",
                "Ethical Hacking", "Penetration Testing", "Blockchain"
            ], 4)
        
        # Add random supplementary skills
        skills += random.sample(SKILLS_POOL, 1)
        
        projects.append({
            "project_id": pid,
            "title": f"{domain} Project {pid}",
            "tech_stack": ", ".join(skills)
        })
    print(f"🔨 Generated {len(projects)} projects.")  # Debug print
    return pd.DataFrame(projects)

def generate_students(num_students=5000):
    """Fixed student generation with consistent skill handling"""
    print("🔨 Generating students...")  # Debug print
    students = []
    for sid in range(1, num_students + 1):
        focus = random.choice(["AI/ML", "Web Dev", "Data Science", "Cloud", "Security"])
        skills = []
        
        if focus == "AI/ML":
            skills = random.sample([
                "Python", "Machine Learning", "Mathematics",
                "Deep Learning", "TensorFlow"
            ], 3)
        elif focus == "Web Dev":
            skills = random.sample([
                "JavaScript", "React", "Node.js", "HTML/CSS", "REST API"
            ], 3)
        elif focus == "Data Science":
            skills = random.sample([
                "Python", "Data Analysis", "Pandas", "SQL", "Data Visualization"
            ], 3)
        elif focus == "Cloud":
            skills = random.sample([
                "AWS", "Docker", "Linux", "Networking", "CI/CD"
            ], 3)
        else:  # Security
            skills = random.sample([
                "Cybersecurity", "Cryptography", "Network Security", "Linux", "Python"
            ], 3)
        
        # Add random supplementary skills
        skills += random.sample(SKILLS_POOL, 2)
        
        students.append({
            "student_id": sid,
            "skills": ", ".join(skills)
        })
    print(f"🔨 Generated {len(students)} students.")  # Debug print
    return pd.DataFrame(students)

# Data generation and processing
print("🚀 Starting data generation...")
projects_df = generate_realistic_projects(1000)
students_df = generate_students(5000)

# Process skills consistently
print("🧹 Cleaning and processing skills...")
projects_df['tech_stack'] = projects_df['tech_stack'].apply(process_skills)
students_df['skills'] = students_df['skills'].apply(process_skills)

# Debug: Print first few rows of processed data
print("📊 Processed Projects DataFrame:")
print(projects_df.head())
print("📊 Processed Students DataFrame:")
print(students_df.head())

# Create and fit MultiLabelBinarizer
print("🔧 Fitting MultiLabelBinarizer...")
mlb = MultiLabelBinarizer()
all_skills = projects_df['tech_stack'].tolist() + students_df['skills'].tolist()
mlb.fit(all_skills)

# Debug: Print the classes (skills) learned by the MultiLabelBinarizer
print("🔧 MultiLabelBinarizer classes (skills):")
print(mlb.classes_)

# Transform data
print("🔧 Transforming data...")
X_projects = mlb.transform(projects_df['tech_stack'])
X_students = mlb.transform(students_df['skills'])

# Debug: Print shapes of transformed data
print(f"🔧 Transformed Projects shape: {X_projects.shape}")
print(f"🔧 Transformed Students shape: {X_students.shape}")

# Calculate similarity matrix
print("🔧 Calculating similarity matrix...")
similarity_scores = cosine_similarity(X_students, X_projects)

# Debug: Print shape of similarity matrix
print(f"🔧 Similarity matrix shape: {similarity_scores.shape}")

# Save artifacts
print("💾 Saving artifacts...")
joblib.dump(mlb, "skills_binarizer.pkl")
projects_df.to_parquet("projects.parquet")
students_df.to_parquet("students.parquet")

print("✅ All done!")