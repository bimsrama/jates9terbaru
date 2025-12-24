from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import ChatSession, ChatMessage, User
from schemas import ChatRequest, ChatResponse
from openai import OpenAI
import uuid
import os
import logging
from datetime import datetime

# Setup Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Inisialisasi Client OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# System Prompt: Mengatur kepribadian AI Jates9
SYSTEM_PROMPT = """
Kamu adalah asisten kesehatan AI yang ramah dan profesional untuk aplikasi 'Jates9'. 
Tugasmu adalah membantu pengguna terkait kesehatan pencernaan, maag, gerd, dan memberikan rekomendasi pola hidup sehat.
Kamu juga tahu tentang produk: 
- 'Jates9 Premium' (untuk maag/gerd/pencernaan berat)
- 'Jates9 Family' (untuk kesehatan umum sekeluarga).
Jawablah dengan singkat, padat, suportif, dan menggunakan Bahasa Indonesia yang natural.
Jika pertanyaan di luar topik kesehatan, arahkan kembali dengan sopan ke topik kesehatan.
"""

@router.post("/send", response_model=ChatResponse)
def send_chat(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id
    
    # 1. Handle Session ID
    if not session_id:
        session_id = str(uuid.uuid4())
        # Coba hubungkan dengan user jika user_id dikirim
        user_id_int = int(request.user_id) if (request.user_id and request.user_id.isdigit()) else None
        new_session = ChatSession(id=session_id, user_id=user_id_int)
        db.add(new_session)
        db.commit()
    else:
        # Validasi session ada di DB
        existing_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not existing_session:
            # Jika session ID dikirim tapi tidak ada di DB, buat baru dengan ID tersebut
            user_id_int = int(request.user_id) if (request.user_id and request.user_id.isdigit()) else None
            new_session = ChatSession(id=session_id, user_id=user_id_int)
            db.add(new_session)
            db.commit()

    # 2. Simpan Pesan User ke SQL
    user_msg = ChatMessage(session_id=session_id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()

    try:
        # 3. Ambil Riwayat Chat Sebelumnya (Context Window)
        # Kita ambil 10 pesan terakhir agar AI "ingat" percakapan
        history_msgs = db.query(ChatMessage)\
            .filter(ChatMessage.session_id == session_id)\
            .order_by(ChatMessage.timestamp.asc())\
            .limit(10)\
            .all()

        # Format pesan untuk OpenAI API
        messages_payload = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        for msg in history_msgs:
            # Pastikan role valid (user/assistant)
            role = "assistant" if msg.role == "assistant" else "user"
            messages_payload.append({"role": role, "content": msg.content})

        # Tambahkan pesan saat ini jika belum masuk query (biasanya sudah masuk krn commit di atas)
        # Tapi query limit 10 mungkin memotongnya jika chat sangat panjang.
        # Payload OpenAI sudah siap.

        # 4. Panggil OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # Atau gpt-4o jika punya akses
            messages=messages_payload,
            temperature=0.7,
            max_tokens=300
        )

        bot_reply_text = response.choices[0].message.content

    except Exception as e:
        logger.error(f"OpenAI Error: {e}")
        bot_reply_text = "Maaf, sistem sedang sibuk. Mohon coba lagi nanti."
        # Opsional: Bisa fallback ke logika if-else sederhana jika OpenAI error/habis kuota

    # 5. Simpan Balasan AI ke SQL
    bot_msg = ChatMessage(session_id=session_id, role="assistant", content=bot_reply_text)
    db.add(bot_msg)
    db.commit()

    return {
        "success": True, 
        "response": bot_reply_text, 
        "session_id": session_id
    }