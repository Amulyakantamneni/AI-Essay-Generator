from typing import Dict, Any, List, Optional
from io import BytesIO
import base64
import textwrap  # for pretty wrapping

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

from openai import OpenAI

# ==============================
#  LLM CLIENT + HELPERS
# ==============================

# create a single global client
_openai_client = OpenAI()


def call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Call an OpenAI chat model with a system + user prompt.
    Make sure OPENAI_API_KEY is set in your environment.
    """
    resp = _openai_client.chat.completions.create(
        model="gpt-4.1-mini",  # you can change to another model you have access to
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
    )
    return resp.choices[0].message.content


def search_web(query: str, max_results: int = 5) -> List[str]:
    """
    TEMP: Fake web search by asking the LLM directly for key points.
    Later you can replace this with a real search API.
    """
    system_prompt = (
        "You act like a search engine summary. Given a query, "
        "you return several short bullet points with key facts."
    )
    user_prompt = (
        f"Query: {query}\n\n"
        "Return 5–7 short bullet points with key facts, each on a new line."
    )

    text = call_llm(system_prompt, user_prompt)
    # split by lines and treat each line as a 'snippet'
    snippets = [line.strip("•- ").strip() for line in text.splitlines() if line.strip()]
    return snippets[:max_results]


# =========
#  AGENTS
# =========

class Agent:
    def __init__(self, name: str, system_prompt: str):
        self.name = name
        self.system_prompt = system_prompt

    def run(self, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError


class SearchAgent(Agent):
    def run(self, topic: str, max_results: int = 5) -> Dict[str, Any]:
        snippets = search_web(topic, max_results=max_results)
        return {
            "agent": self.name,
            "snippets": snippets,
        }


class SummarizerAgent(Agent):
    def run(self, topic: str, snippets: List[str]) -> Dict[str, Any]:
        joined = "\n\n".join(snippets)
        user_prompt = (
            f"Topic: {topic}\n\n"
            f"Here are web snippets:\n{joined}\n\n"
            "Summarize this topic into a structured, clear overview with headings "
            "and bullet points. Avoid copying exact sentences; synthesize the information."
        )
        summary = call_llm(self.system_prompt, user_prompt)
        return {
            "agent": self.name,
            "summary": summary,
        }


class InsightAgent(Agent):
    def run(self, topic: str, summary: str) -> Dict[str, Any]:
        user_prompt = (
            f"Topic: {topic}\n\n"
            f"Summary:\n{summary}\n\n"
            "Generate deep insights about this topic, including:\n"
            "- Key implications\n"
            "- Trends\n"
            "- Opportunities and risks\n"
            "- Practical takeaways\n"
            "Return them as bullet points grouped under short section titles."
        )
        insights = call_llm(self.system_prompt, user_prompt)
        return {
            "agent": self.name,
            "insights": insights,
        }


class EssayAgent(Agent):
    def run(self, topic: str, summary: str, insights: str, word_length: Optional[int] = None) -> Dict[str, Any]:
        # Determine target length instruction
        if word_length:
            length_instruction = f"The essay should be approximately {word_length} words long."
        else:
            length_instruction = "Write a clear, coherent essay in 4–6 paragraphs."
        
        user_prompt = (
            f"Write a natural, human-sounding essay on the topic '{topic}'.\n\n"
            f"Here is a structured summary of the topic:\n{summary}\n\n"
            f"And here are some deeper insights:\n{insights}\n\n"
            f"{length_instruction}\n"
            "Requirements:\n"
            "- Use normal prose, not bullet points.\n"
            "- Do NOT use headings, lists, numbering, or Markdown.\n"
            "- Do NOT include asterisks (*) or dashes at the start of lines.\n"
            "- The essay should read like something a thoughtful human wrote.\n"
        )
        essay = call_llm(self.system_prompt, user_prompt)
        return {
            "agent": self.name,
            "essay": essay,
        }


class PdfAgent(Agent):
    def run(self, title: str, essay: str) -> Dict[str, Any]:
        """
        Generate a better-formatted PDF from the essay text and return base64.
        """
        # Clean bullet markers
        cleaned_lines = []
        for line in essay.splitlines():
            stripped = line.lstrip()
            if stripped.startswith(("*", "-", "•", "·")):
                stripped = stripped.lstrip("*-•· ").lstrip()
            cleaned_lines.append(stripped)
        cleaned_essay = "\n".join(cleaned_lines)

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=LETTER)
        width, height = LETTER

        # Margins
        left_margin = 1 * inch
        right_margin = width - 1 * inch
        top_margin = height - 1 * inch
        bottom_margin = 1 * inch
        
        # Start position
        y_position = top_margin
        
        # Title
        c.setFont("Times-Bold", 16)
        c.drawString(left_margin, y_position, title)
        y_position -= 30  # Space after title
        
        # Body text settings
        c.setFont("Times-Roman", 12)
        line_height = 16
        max_width = right_margin - left_margin
        
        paragraphs = cleaned_essay.split("\n\n")

        for para_index, para in enumerate(paragraphs):
            para = para.strip()
            if not para:
                continue
            
            # Word wrap based on actual width
            words = para.split()
            lines = []
            current_line = []
            
            for word in words:
                test_line = ' '.join(current_line + [word])
                text_width = c.stringWidth(test_line, "Times-Roman", 12)
                
                if text_width <= max_width:
                    current_line.append(word)
                else:
                    if current_line:
                        lines.append(' '.join(current_line))
                        current_line = [word]
                    else:
                        # Word is too long, add it anyway
                        lines.append(word)
            
            if current_line:
                lines.append(' '.join(current_line))
            
            # Draw each line
            for line in lines:
                # Check if we need a new page
                if y_position < bottom_margin + line_height:
                    c.showPage()
                    c.setFont("Times-Roman", 12)
                    y_position = top_margin
                
                c.drawString(left_margin, y_position, line)
                y_position -= line_height
            
            # Extra space between paragraphs
            y_position -= line_height * 0.5

        c.save()

        pdf_bytes = buffer.getvalue()
        buffer.close()
        pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")

        return {
            "agent": self.name,
            "pdf_base64": pdf_b64,
        }


# =====================
#  ORCHESTRATOR
# =====================

class EssayWorkflowOrchestrator:
    def __init__(self):
        self.search_agent = SearchAgent(
            name="search_agent",
            system_prompt="You help gather useful web information snippets."
        )
        self.summarizer_agent = SummarizerAgent(
            name="summarizer_agent",
            system_prompt="You are an expert summarizer who creates structured, clear overviews."
        )
        self.insight_agent = InsightAgent(
            name="insight_agent",
            system_prompt="You generate deep insights and implications from information."
        )
        self.essay_agent = EssayAgent(
            name="essay_agent",
            system_prompt="You are a skilled essay writer."
        )
        self.pdf_agent = PdfAgent(
            name="pdf_agent",
            system_prompt="You format essays into printable PDFs."
        )

    def run(self, topic: str, make_pdf: bool = False, word_length: Optional[int] = None) -> Dict[str, Any]:
        state: Dict[str, Any] = {"topic": topic}

        # 1) Search
        search_res = self.search_agent.run(topic=topic, max_results=5)
        state["snippets"] = search_res["snippets"]

        # 2) Summarize
        summary_res = self.summarizer_agent.run(
            topic=topic,
            snippets=state["snippets"]
        )
        state["summary"] = summary_res["summary"]

        # 3) Insights
        insight_res = self.insight_agent.run(
            topic=topic,
            summary=state["summary"]
        )
        state["insights"] = insight_res["insights"]

        # 4) Essay with word_length parameter
        essay_res = self.essay_agent.run(
            topic=topic,
            summary=state["summary"],
            insights=state["insights"],
            word_length=word_length
        )
        state["essay"] = essay_res["essay"]

        # 5) Optional PDF
        if make_pdf:
            pdf_res = self.pdf_agent.run(
                title=f"Essay on {topic}",
                essay=state["essay"]
            )
            state["pdf_base64"] = pdf_res["pdf_base64"]

        return state
    

# =====================
#  FASTAPI + FRONTEND
# =====================

app = FastAPI(title="Essay Generator")

# Allow frontend (Next.js) or other origins to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later you can restrict to your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Pydantic models for API
class EssayRequest(BaseModel):
    topic: str
    pdf: bool = False
    word_length: Optional[int] = None  # Add this line


class EssayResponse(BaseModel):
    topic: str
    summary: str
    insights: str
    essay: str
    pdf_base64: Optional[str] = None


orchestrator = EssayWorkflowOrchestrator()


# ---- Home page: optional local UI ----
@app.get("/", response_class=HTMLResponse)
def home():
    """
    Pretty status page for the backend.
    The real UI lives in the Next.js frontend.
    """
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>AI Essay Writer API · Amulya</title>
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                min-height: 100vh;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                background: radial-gradient(circle at top left, #f4ecdf, #f7f0ff, #e2ecff);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1f2933;
            }
            .card {
                background: rgba(255, 255, 255, 0.9);
                border-radius: 20px;
                box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
                padding: 28px 32px;
                max-width: 520px;
                width: 100%;
                border: 1px solid rgba(226, 232, 240, 0.8);
            }
            .pill {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 14px;
                border-radius: 999px;
                background: #eef2ff;
                color: #3730a3;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 16px;
            }
            .pill-dot {
                width: 8px;
                height: 8px;
                border-radius: 999px;
                background: #22c55e;
            }
            h1 {
                font-size: 26px;
                line-height: 1.3;
                color: #174693;
                margin-bottom: 8px;
            }
            p {
                font-size: 14px;
                color: #4b5563;
                margin-bottom: 10px;
            }
            .url-box {
                margin-top: 14px;
                padding: 10px 12px;
                border-radius: 12px;
                background: #f3f4ff;
                font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                font-size: 12px;
                color: #111827;
            }
            .label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                color: #6b7280;
                margin-top: 16px;
                margin-bottom: 4px;
            }
            .tag-row {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 10px;
            }
            .tag {
                font-size: 11px;
                padding: 4px 8px;
                border-radius: 999px;
                background: #e0ecff;
                color: #1d4ed8;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="pill">
                <span class="pill-dot"></span>
                Backend status: Online
            </div>

            <h1>AI Essay Writer API · Amulya</h1>
            <p>
                Your multi-agent essay engine is running successfully.  
                This backend powers the main React &amp; Tailwind UI.
            </p>

            <p class="label">Frontend URL</p>
            <div class="url-box">
                http://localhost:3000  &nbsp;→&nbsp; AI Essay Writer Interface
            </div>

            <p class="label">API Endpoint</p>
            <div class="url-box">
                POST /generate-essay
            </div>

            <div class="tag-row">
                <span class="tag">FastAPI</span>
                <span class="tag">Uvicorn</span>
                <span class="tag">OpenAI</span>
                <span class="tag">Multi-Agent Workflow</span>
            </div>
        </div>
    </body>
    </html>
    """

# ---- API endpoint for UI + external clients ----
@app.post("/generate-essay", response_model=EssayResponse)
def generate_essay(request: EssayRequest):
    result = orchestrator.run(
        topic=request.topic, 
        make_pdf=request.pdf,
        word_length=request.word_length  # Add this parameter
    )
    return EssayResponse(
        topic=result["topic"],
        summary=result["summary"],
        insights=result["insights"],
        essay=result["essay"],
        pdf_base64=result.get("pdf_base64"),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("pdf_essay_generator:app", host="0.0.0.0", port=8001) 
