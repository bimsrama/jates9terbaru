# Import models agar terbaca
import models 
from database import engine

# Ini akan membuat tabel otomatis jika belum ada di database SQL
models.Base.metadata.create_all(bind=engine)
