from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

# --- Konfigurasi Dasar (Agar bisa membaca data dari SQL) ---
class OrbBase(BaseModel):
    class Config:
        from_attributes = True  # PENTING: Dulu namanya orm_mode

# ==========================================
# USER SCHEMAS (Login & Register)
# ==========================================
class UserBase(OrbBase):
    phone_number: str
    name: str

class UserCreate(UserBase):
    password: str  # Password hanya dibutuhkan saat register

class UserLogin(BaseModel):
    phone_number: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    health_type: Optional[str] = None
    challenge_enrolled: bool
    challenge_day: int
    created_at: datetime

# ==========================================
# CHAT SCHEMAS (Chatbot)
# ==========================================
class ChatRequest(BaseModel):
    user_id: Optional[str] = None # Opsional karena bisa diambil dari token
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    response: str
    session_id: str

# ==========================================
# DASHBOARD SCHEMAS (Checkin & Keuangan)
# ==========================================

# 1. Validasi Input Check-in Harian
class CheckinSchema(BaseModel):
    day: int
    task: str
    comfort_level: int = 5
    morning_done: bool = False
    noon_done: bool = False
    evening_done: bool = False

# 2. Validasi Input Penarikan Dana (Withdrawal)
class WithdrawalSchema(BaseModel):
    amount: float
    bank_name: str
    account_number: str
    account_name: str

# 3. Validasi Input Broadcast Admin
class BroadcastSchema(BaseModel):
    target_group: str  # Contoh: "all", "A", "B", "C"
    message: str
    
    # ... (Import yang sudah ada)
from typing import Optional, Dict, Any # Pastikan Dict dan Any diimport

# ... (Class UserBase dll biarkan saja)

# TAMBAHKAN INI (Schema untuk Input Kuis dari Frontend)
class QuizAnswer(BaseModel):
    phone_number: str
    name: str
    answers: Dict[str, Any]  # Menerima object JSON jawaban
    score: int
    health_type: str
    timestamp: Optional[datetime] = None
