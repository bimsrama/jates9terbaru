from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Mengambil password dari Environment Variable (agar aman) atau hardcode sementara untuk tes
# Format: mysql+pymysql://USER:PASSWORD@HOST/NAMA_DB
DATABASE_URL = "mysql+pymysql://prow9975_adminjates_db:jates1110@localhost/prow9975_jates9_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
