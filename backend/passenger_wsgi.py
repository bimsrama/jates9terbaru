import sys, os

# Menambahkan direktori saat ini ke path python
INTERP = os.path.expanduser("/var/www/u1234567/data/env/bin/python") # Baris ini biasanya otomatis disesuaikan hosting, tapi biarkan standar import di bawah
if sys.executable != INTERP: os.execl(INTERP, INTERP, *sys.argv)

from main import app as application
# Pastikan 'main' adalah nama file python utama Anda (main.py)
# Pastikan 'app' adalah nama variabel Flask di dalam main.py
