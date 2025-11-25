from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
import os
from openai import OpenAI

# ===========================
# Initialize FastAPI App
# ===========================
app = FastAPI(
    title="AI Writer API",
    description="Multi-format AI writing engine (essays, reports, summaries, articles, explanations, audits, and social posts).",
    version="1.1.0"
)

# ===========================
# CORS CONFIG
# ===========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-essay-generator-eight.vercel.app",
        "https://*.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================
# OpenAI Client
# ===========================
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ===========================
# Writing Type Enum
# ===========================
class WritingType(str, Enum):
    essay = "essay"
    report = "report"
    summary = "summary"
    explanation = "explanation"
    audit = "audit"
    article = "article"
    social_post = "social_post"

# ===========================
# Models
# ===========================
class EssayRequest(BaseModel):
    topic: str
    length: Optional[str] = "medium"       # short, medium, long
    tone: Optional[str] = "academic"       # academic, casual, persuasive, etc.
    writing_type: WritingType = WritingType.essay  # NEW

class EssayResponse(BaseModel):
    essay: str
    word_count: int
    sources: List[str]
    writing_type: WritingType


# ===========================
# Prompt Builder
# ===========================
def build_prompt(req: EssayRequest) -> str:
    base_context = f"Topic: {req.topic}\nWriting type: {req.writing_type}\nTone: {req.tone}\nLength: {req.length}"

    length_guide = """
Length Guide:
- short: 150–300 words
- medium: 400–700 words
- long: 800–1200 words
"""

    if req.writing_type == WritingType.essay:
        return f"""
You are an expert academic writer.

Write a well-structured essay.

{base_context}
{length_guide}

Requirements:
- Strong thesis introduction
- 2–4 body paragraphs with topic sentences
- Logical transitions
- Strong conclusion
"""

    if req.writing_type == WritingType.report:
        return f"""
You are a professional report writer.

Write a formal report.

{base_context}
{length_guide}

Sections needed:
- Introduction
- Background / Context
- Analysis / Findings
- Recommendations
- Conclusion
"""

    if req.writing_type == WritingType.summary:
        return f"""
You are an expert summarizer.

Write a clear, simple summary.

{base_context}

Requirements:
- Keep it 150–250 words
- Only important ideas
- No unnecessary details
"""

    if req.writing_type == WritingType.explanation:
        return f"""
Explain the topic clearly like a teacher explaining to a smart beginner.

{base_context}
{length_guide}

Requirements:
- Use simple language
- Use analogies
- Break down concepts step-by-step
"""

    if req.writing_type == WritingType.audit:
        return f"""
You are an experienced auditor.

Write an audit-style narrative.

{base_context}
{length_guide}

Requirements:
- Define audit scope and objectives
- Identify risks, controls, gaps
- Provide findings + recommendations
- Clear, formal tone
"""

    if req.writing_type == WritingType.article:
        return f"""
You are a professional online article writer.

Write an informative article.

{base_context}
{length_guide}

Requirements:
- Strong opening hook
- Engaging, structured content
- 2–3 subheadings
- Smooth flow
"""

    if req.writing_type == WritingType.social_post:
        return f"""
You are a social media content creator.

Write a short, engaging social post.

{base_context}

Requirements:
- 50–150 words
- Hook in first line
- 1–3 emojis
- Add 3–6 hashtags
"""

    # fallback
    return f"Write content about: {req.topic}"


# ===========================
# Root & Health
# ===========================
@app.get("/")
async def root():
    return {
        "message": "Backend is online",
        "title": "AI Writer API",
        "description": "Supports essays, reports, summaries, explanations, audits, articles, and social posts.",
        "endpoint": "/start-writing",
        "supported_types": [t.value for t in WritingType],
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "api": "operational"}


# ===========================
# Main Generate Endpoint
# ===========================
@app.post("/generate-essay", response_model=EssayResponse)
async def generate_essay(request: EssayRequest):
    try:
        prompt = build_prompt(request)

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are an expert multi-format writer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        essay_text = response.choices[0].message.content or ""
        word_count = len(essay_text.split())

        sources = [
            "Reference Source 1 (example)",
            "Reference Source 2 (example)"
        ]

        return EssayResponse(
            essay=essay_text,
            word_count=word_count,
            sources=sources,
            writing_type=request.writing_type
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
