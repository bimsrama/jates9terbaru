from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, QuizResult
from schemas import QuizAnswer
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

@router.post("/submit", response_model=dict)
def submit_quiz(
    quiz_answer: QuizAnswer,
    db: Session = Depends(get_db)
):
    """Submit quiz answers and get personalized recommendation (SQL Version)"""
    try:
        # 1. Cek apakah user sudah ada berdasarkan No HP
        user = db.query(User).filter(User.phone_number == quiz_answer.phone_number).first()
        
        # Waktu submit
        submit_time = quiz_answer.timestamp or datetime.utcnow()

        if not user:
            # Jika user belum ada, buat user baru
            user = User(
                phone_number=quiz_answer.phone_number,
                full_name=quiz_answer.name,
                health_type=quiz_answer.health_type,
                health_score=quiz_answer.score,
                role="user",
                challenge_enrolled=False,
                created_at=submit_time
            )
            db.add(user)
            db.commit()
            db.refresh(user) # Refresh untuk dapatkan ID
        else:
            # Jika user sudah ada, update data kesehatannya
            user.full_name = quiz_answer.name
            user.health_type = quiz_answer.health_type
            user.health_score = quiz_answer.score
            db.commit()
            db.refresh(user)

        # 2. Generate Rekomendasi (Logic tetap sama)
        recommendations = {
            "A": "Program 30 Hari untuk Tipe A - Sembelit. Fokus pada serat dan hidrasi.",
            "B": "Program 30 Hari untuk Tipe B - Kembung. Fokus pada enzim pencernaan.",
            "C": "Program 30 Hari untuk Tipe C - Maag. Fokus pada penyembuhan lambung.",
            "ABC": "Program 30 Hari komprehensif untuk masalah pencernaan kompleks."
        }

        suggested_products = {
            "A": "jates9_premium",
            "B": "jates9_premium",
            "C": "jates9_premium",
            "ABC": "jates9_family"
        }

        recommendation = recommendations.get(quiz_answer.health_type, "Program 30 Hari umum")
        suggested_product = suggested_products.get(quiz_answer.health_type, "jates9_premium")

        # 3. Simpan Hasil Kuis ke Tabel QuizResult
        new_result = QuizResult(
            user_id=user.id,
            answers=quiz_answer.answers,
            score=quiz_answer.score,
            health_type=quiz_answer.health_type,
            recommendation=recommendation,
            suggested_product=suggested_product,
            created_at=submit_time
        )
        db.add(new_result)
        db.commit()

        # 4. Return Response (Format SAMA PERSIS dengan Frontend)
        return {
            "success": True,
            "user_id": str(user.id), # Frontend mungkin expect string
            "recommendation": recommendation,
            "suggested_product": suggested_product
        }

    except Exception as e:
        logger.error(f"Error submitting quiz: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/result/{user_id}", response_model=dict)
def get_quiz_result(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get quiz result for a specific user"""
    try:
        # Ambil hasil kuis terakhir user tersebut
        result = db.query(QuizResult).filter(QuizResult.user_id == user_id).order_by(QuizResult.created_at.desc()).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Quiz result not found")
        
        return {
            "score": result.score,
            "health_type": result.health_type,
            "timestamp": result.created_at,
            "recommendation": result.recommendation or ""
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting quiz result: {e}")
        raise HTTPException(status_code=500, detail=str(e))