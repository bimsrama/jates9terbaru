from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv # <--- Tambahkan ini
import os

# Load .env di awal
load_dotenv()

from database import engine, Base
from routes import auth, dashboard, challenge, chat, quiz

# Buat tabel otomatis jika belum ada
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Jates9 Backend SQL + OpenAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(challenge.router)
app.include_router(chat.router)
app.include_router(quiz.router)

@app.get("/health")
def health_check():
    # Cek DB connection sederhana
    db_status = "connected"
    try:
        connection = engine.connect()
        connection.close()
    except Exception:
        db_status = "disconnected"
        
    return {
        "status": "ok", 
        "database": db_status, 
        "openai": "enabled" if os.getenv("OPENAI_API_KEY") else "disabled"
    }

@app.get("/")
def root():
    return {"message": "Jates9 Backend API is running"}