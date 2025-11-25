from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from openai import OpenAI

app = FastAPI(
    title="AI Essay Writer API",
    description="Multi-agent essay generation system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Defensive check for API key
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY is not set in environment.")
client = OpenAI(api_key=api_key)

class EssayRequest(BaseModel):
    topic: str
    length: Optional[str] = "medium"
    tone: Optional[str] = "academic"

class EssayResponse(BaseModel):
    essay: str
    word_count: int
    sources: list

@app.get("/")
async def root():
    return {
        "message": "Backend status: Online",
        "title": "AI Writer API",
        "description": "Your multi-agent essay engine is running successfully.",
        "frontend_url": "https://ai-essay-generator-eight.vercel.app",
        "endpoint": "POST /generate-essay"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "api": "operational"}

@app.post("/generate-essay", response_model=EssayResponse)
async def generate_essay(request: EssayRequest):
    try:
        writing_prompt = f"""
        Write a {request.length} {request.tone} essay about {request.topic}.

        Requirements:
        - Clear introduction with thesis statement
        - Well-structured body paragraphs
        - Strong conclusion
        - Cite sources where applicable

        Length guide:
        - short: 300-500 words
        - medium: 500-800 words  
        - long: 800-1200 words
        """

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are an expert essay writer and researcher."},
                {"role": "user", "content": writing_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        essay_text = response.choices[0].message.content
        word_count = len(essay_text.split())
        sources = ["Academic Journal Reference 1", "Scholarly Article 2", "Research Paper 3"]

        return EssayResponse(
            essay=essay_text,
            word_count=word_count,
            sources=sources
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
