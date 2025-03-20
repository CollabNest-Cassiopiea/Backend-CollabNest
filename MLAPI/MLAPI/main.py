from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np
import random
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
from typing import List

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the skills binarizer model
mlb = joblib.load("skills_binarizer.pkl")
available_skills = set(map(str.lower, mlb.classes_))  # Ensure lowercase matching
print("🔹 Available Skills in Model:", available_skills)  # Debugging

class SkillsRequest(BaseModel):
    skills: str  
    projects: List[dict]  

def recommend_projects(skills: str, projects: List[dict], top_n=5):
    if not projects:
        print("⚠️ No projects provided!")
        return []

    projects_df = pd.DataFrame(projects)

    if "tech_stack" not in projects_df.columns:
        print("⚠️ 'tech_stack' column missing in provided projects!")
        return []

    # Shuffle projects before processing
    projects_df = projects_df.sample(frac=1, random_state=None).reset_index(drop=True)

    skills_list = [s.strip().lower() for s in skills.split(",")]
    valid_skills = [s for s in skills_list if s in available_skills]

    if not valid_skills:
        print("⚠️ No matching skills found in the model!")
        return []

    print(f"🔹 User's Valid Skills: {valid_skills}")

    try:
        student_vector = mlb.transform([valid_skills])
    except Exception as e:
        print(f"❌ Error in transforming skills: {e}")
        return []
    try:
        project_vectors = mlb.transform(
            projects_df["tech_stack"].fillna("").astype(str).str.lower().str.split(", ")
        )
    except Exception as e:
        print(f"❌ Error in transforming project tech stacks: {e}")
        return []
    similarities = cosine_similarity(student_vector, project_vectors)
    sorted_indices = np.argsort(similarities[0])[::-1] 
    np.random.shuffle(sorted_indices)
    selected_indices = np.random.choice(sorted_indices, min(top_n, len(sorted_indices)), replace=False)
    recommended_projects = projects_df.iloc[selected_indices].to_dict(orient="records")
    print(f"✅ Recommended Projects: {recommended_projects}")
    return recommended_projects

@app.post("/recommend")
async def get_recommendations(request: SkillsRequest):
    try:
        print(f"📥 Received Skills: {request.skills}")
        print(f"📥 Received Projects: {len(request.projects)}")
        recommendations = recommend_projects(request.skills, request.projects)
        return {"success": True, "recommendations": recommendations}
    except Exception as e:
        print(f"❌ Error: {e}")
        return {"success": False, "error": str(e), "recommendations": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
