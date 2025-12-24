from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load variabel dari file .env
load_dotenv()

# Ambil URL database dari .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback jika .env gagal terbaca (hardcode sesuai request Anda sebagai cadangan)
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "mysql+pymysql://prow9975_adminjates_db:jates1110@localhost/prow9975_jates9_db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True, 
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()