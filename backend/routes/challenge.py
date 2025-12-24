from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, ChallengeLog
from schemas import CheckinSchema
from datetime import datetime

router = APIRouter(prefix="/api/challenge", tags=["challenge"])

@router.post("/checkin/{user_id}")
def daily_checkin(user_id: int, checkin_data: CheckinSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Cek apakah hari ini sudah checkin
    # (Logic sederhana: cek apakah ada log di hari yg sama untuk user ini)
    # Untuk simplifikasi tutorial, kita cek berdasarkan 'day' challenge
    existing_log = db.query(ChallengeLog).filter(
        ChallengeLog.user_id == user_id,
        ChallengeLog.day == checkin_data.day
    ).first()

    if existing_log:
        # Update log yang ada
        existing_log.details = {
            "morning": checkin_data.morning_done, 
            "noon": checkin_data.noon_done, 
            "evening": checkin_data.evening_done
        }
        existing_log.comfort_level = checkin_data.comfort_level
        existing_log.completed_at = datetime.utcnow()
    else:
        # Buat log baru
        new_log = ChallengeLog(
            user_id=user_id,
            day=checkin_data.day,
            task=checkin_data.task,
            details={
                "morning": checkin_data.morning_done, 
                "noon": checkin_data.noon_done, 
                "evening": checkin_data.evening_done
            },
            comfort_level=checkin_data.comfort_level,
            completed_at=datetime.utcnow()
        )
        db.add(new_log)
        
        # Update progress user
        if user.challenge_day < checkin_data.day:
            user.challenge_day = checkin_data.day
            
    db.commit()
    
    return {"success": True, "message": "Check-in berhasil", "day": checkin_data.day}