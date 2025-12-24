from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, UserResponse
from passlib.context import CryptContext
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Cek apakah user sudah ada
    existing_user = db.query(User).filter(User.phone_number == user_data.phone_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Nomor HP sudah terdaftar")

    hashed_pw = get_password_hash(user_data.password)
    
    new_user = User(
        full_name=user_data.name,
        phone_number=user_data.phone_number,
        password=hashed_pw,
        role="user",
        created_at=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == user_data.phone_number).first()
    
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Nomor HP atau Password salah")
    
    return {
        "success": True,
        "user_id": user.id,
        "name": user.full_name,
        "role": user.role,
        "token": f"mock-token-{user.id}" # Di production gunakan JWT
    }