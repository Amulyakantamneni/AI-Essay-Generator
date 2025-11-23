from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # ADD THIS LINE
from pydantic import BaseModel
from typing import Optional
import os
from openai import OpenAI

# Initialize FastAPI app
app = FastAPI(
    title="AI Essay Writer API",
    description="Multi-agent essay generation system",
    version="1.0.0"
)

# ADD CORS MIDDLEWARE - PUT THIS RIGHT AFTER app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-essay-generator-61h71xddw-amulyakantamnenis-projects.vercel.app",
        "https://*.vercel.app",  # Allow all Vercel preview deployments
        "http://localhost:3000",  # For local development
        "http://localhost:5173",  # For Vite local development
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Request model
class EssayRequest(BaseModel):
    topic: str
    length: Optional[str] = "medium"  # short, medium, long
    tone: Optional[str] = "academic"  # academic, casual, persuasive

# Response model
class EssayResponse(BaseModel):
    essay: str
    word_count: int
    sources: list

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Backend status: Online",
        "title": "AI Essay Writer API · Amulya",
        "description": "Your multi-agent essay engine is running successfully.",
        "frontend_url": "http://localhost:3000",
        "endpoint": "POST /generate-essay"
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "api": "operational"}

# Essay generation endpoint
@app.post("/generate-essay", response_model=EssayResponse)
async def generate_essay(request: EssayRequest):
    try:
        # Agent 1: Research Agent (simulated)
        research_prompt = f"Research key points about: {request.topic}"
        
        # Agent 2: Outline Agent
        outline_prompt = f"Create an outline for an essay about {request.topic} with {request.length} length"
        
        # Agent 3: Writing Agent
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
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are an expert essay writer and researcher."},
                {"role": "user", "content": writing_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        essay_text = response.choices[0].message.content
        word_count = len(essay_text.split())
        
        # Simulate sources (in production, extract from research)
        sources = [
            "Academic Journal Reference 1",
            "Scholarly Article 2",
            "Research Paper 3"
        ]
        
        return EssayResponse(
            essay=essay_text,
            word_count=word_count,
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn pdf_essay_generator:app --reload --host 0.0.0.0 --port 8000
