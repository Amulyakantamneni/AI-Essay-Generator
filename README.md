# AI Writer — Multi-Format Intelligent Writing System (Full-Stack · Next.js + FastAPI + OpenAI)
An advanced end-to-end AI writing platform capable of generating essays, reports, summaries, explanations, audits, articles, and social media posts — all using multi-agent workflow orchestration, intelligent prompt-routing, and clean full-stack architecture.
This project showcases modern AI engineering practices including:

•	Next.js 15 App Router Frontend
•	FastAPI Backend with Orchestrated Multi-Tool Agent
•	OpenAI GPT-4o + GPT-4o-mini Models
•	Cross-Tool Writing Engine (Essay, Report, Audit, Summary, etc.)
•	Agent-based Prompt Routing Logic
•	Modern React UI with TailwindCSS
•	Production-ready Deployment (Vercel + Render)

⭐ Live Demo

👉 https://amulya-ai.vercel.app

Backend hosted on Render, frontend on Vercel.

Table of Contents

Features
Tech Stack
Backend Workflow
Frontend Structure
Multi-Agent Workflow
Deployment Guide
Running Locally
Future Enhancements
Screenshots

✨ Features
Multi-Format Writing Tools

Supports 6 distinct writing types:

1.	Essay
2.	Report
3.	Summary
4.	Explanation
5.	Article
6.	Social Media Post

🔹 Multi-Agent Orchestration

•	The backend contains an intelligent router-agent that:
•	Identifies requested writing mode
•	Chooses the correct system-role prompt
•	Applies length & tone constraints
•	Generates structured responses
•	Sanitizes markdown/asterisks for clean output

🔹 Modern UI/UX

•	Premium, minimal, Notion-style interface
•	TailwindCSS + custom gradients + shadow layers
•	Interactive cards, animations, and smooth scroll

🔹 Production-Ready

•	Fully responsive UI
•	CORS-safe backend
•	Works across desktop & mobile
•	Vercel + Render cloud deployment



🧠 Tech Stack
Frontend
•	Next.js 15 App Router
•	React 19
•	TailwindCSS
•	Lucide Icons
•	Smooth scroll + responsive layout

Backend

•	FastAPI
•	Python 3.10+
•	Pydantic
•	MULTI-AGENT workflow
•	OpenAI SDK
•	AI Models
•	GPT-4o-mini
•	GPT-4o
•	System prompts dynamically generated

Hosting

Frontend → Vercel
Backend → Render
CORS configured

🤖 Multi-Agent Workflow

The backend uses a three-layer multi-agent pipeline:

🧩 1. Router Agent
Decides what type of writing tool is needed:
Essay Agent
Report Agent
Summary Agent


Explanation Agent
Article Agent
Social Post Agent

🧩 2. Format-Enforcer Agent

Ensures:

Length limit
Tone (Academic or Casual)
Structure (headings, intro, summary, etc.)

🧩 3. Output-Sanitizer Agent

Cleans:
Asterisks
Markdown
Improper spacing
Over-formatting
Creates final clean output for UI

⚙️ Deployment Guide
Frontend (Vercel)
1.	Connect GitHub repo
2.	Set root folder → Frontend/
3.	Add environment variable:
o	NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
4.	Deploy
________________________________________


Backend (Render)
1.	Create new Web Service
2.	Select repo
3.	Set root → Backend/
4.	Add:
o	OPENAI_API_KEY
5.	Start command:
6.	uvicorn main:app --host 0.0.0.0 --port $PORT
7.	Deploy
________________________________________
▶️ Instructions to Run Locally
Frontend
cd Frontend
npm install
npm run dev
Visit: http://localhost:3000
Backend
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
API: http://127.0.0.1:8000
________________________________________
🚀 Future Enhancements
•	🧩 Multi-agent conversational mode
•	🗂️ Document upload → auto-analysis
•	⛓️ LangChain or LlamaIndex pipeline
•	🔍 Semantic search for sources
•	🧵 Auto thread generation for Twitter
•	🔄 Rewrite, improve, humanize tools
•	🧠 Personality-based writing agents

