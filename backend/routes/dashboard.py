from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Commission, Purchase, QuizResult

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/{user_id}")
def get_dashboard_data(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Hitung total komisi
    total_commission = db.query(func.sum(Commission.amount)).filter(
        Commission.user_id == user_id, 
        Commission.status == "approved"
    ).scalar() or 0.0

    # Hitung total member yang diajak (Referral)
    total_members = db.query(User).filter(User.referred_by_id == user_id).count()

    # Ambil hasil kuis terakhir
    last_quiz = db.query(QuizResult).filter(QuizResult.user_id == user_id).order_by(QuizResult.created_at.desc()).first()
    
    health_status = {
        "type": last_quiz.health_type if last_quiz else "Belum Tes",
        "score": last_quiz.score if last_quiz else 0,
        "recommendation": last_quiz.recommendation if last_quiz else "Silakan ikuti kuis kesehatan"
    }

    return {
        "user": {
            "name": user.full_name,
            "role": user.role,
            "challenge_day": user.challenge_day
        },
        "stats": {
            "commission": total_commission,
            "total_members": total_members,
            "health_score": health_status["score"]
        },
        "health_summary": health_status
    }