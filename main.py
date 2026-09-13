import os
import json
from datetime import datetime
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

# تحميل متغيرات البيئة من ملف .env
load_dotenv()

app = FastAPI(title="AI Request Management API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# تهيئة عميل Gemini API
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

class RequestCreate(BaseModel):
    description: str

class RequestSave(BaseModel):
    description: str
    category: str
    priority: str

class RequestItem(BaseModel):
    id: int
    description: str
    category: str
    priority: str
    created_at: str

fake_db: List[dict] = []
counter = 1

@app.post("/api/analyze")
def analyze_issue(data: RequestCreate):
    if not client:
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY is missing in backend environment variables."
        )

    prompt = f"""
    أنت مساعد ذكي مخصص لتصنيف تذاكر الدعم والشكاوى.
    قم بتحليل المشكلة التالية وحدد التصنيف والأولوية المناسبة لها.

    المشكلة: "{data.description}"

    المطلوب منك إرجاع نتيجة JSON فقط بالبنية التالية دون أي كود إضافي:
    {{
        "suggested_category": "التصنيف المقترح (مثال: تقني / برمجي، مالي / اشتراكات، خدمة العملاء، استفسار عام)",
        "suggested_priority": "الأولوية المقترحة (عالي، متوسط، منخفض)"
    }}
    """

    try:
        # استدعاء نموذج Gemini للحصول على رد JSON مصمم
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        result = json.loads(response.text)
        return {
            "suggested_category": result.get("suggested_category", "عام"),
            "suggested_priority": result.get("suggested_priority", "متوسط"),
            "description": data.description
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

@app.post("/api/requests", response_model=RequestItem)
def create_request(item: RequestSave):
    global counter
    new_req = {
        "id": counter,
        "description": item.description,
        "category": item.category,
        "priority": item.priority,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }
    fake_db.append(new_req)
    counter += 1
    return new_req

@app.get("/api/requests", response_model=List[RequestItem])
def get_requests():
    return fake_db