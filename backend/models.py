# ... (Import yang sudah ada tetap sama)
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# ... (Class User tetap sama, TAPI tambahkan relasi di bagian bawah class User)
class User(Base):
    # ... (kolom-kolom user yang sudah ada)
    # ...
    
    # TAMBAHKAN INI DI BAGIAN BAWAH CLASS USER (di bagian relasi)
    quiz_results = relationship("QuizResult", back_populates="user")

# ... (Class lainnya tetap sama)

# TAMBAHKAN CLASS BARU INI UNTUK MENYIMPAN HASIL KUIS
class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    answers = Column(JSON)  # Menyimpan jawaban dalam format JSON
    score = Column(Integer)
    health_type = Column(String(50))
    recommendation = Column(Text, nullable=True)
    suggested_product = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relasi balik ke User
    user = relationship("User", back_populates="quiz_results")