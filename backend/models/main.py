import os
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.core import config
from backend.core.logging_config import setup_logging
from backend.routers import datasets, training, inference 

from dotenv import load_dotenv

load_dotenv()  # take environment variables

# Setup logging and create necessary directories on startup
setup_logging()
config.create_directories()

app = FastAPI(title="Model Finetuning and Inference Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=config.STATIC_DIR), name="static")

app.include_router(datasets.router)
app.include_router(training.router)
app.include_router(inference.router)

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def index():
    frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "index.html")
    if os.path.exists(frontend_path):
        with open(frontend_path, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    return HTMLResponse("<h1>Frontend not found</h1>")
