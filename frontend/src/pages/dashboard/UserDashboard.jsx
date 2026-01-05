from flask import Flask, request, jsonify, g, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt
import datetime
import os
import sys
import random
import string
import uuid
import requests 
import json
import threading # [PENTING] Untuk background process agar tidak lemot
from dotenv import load_dotenv 
from sqlalchemy import func

# Load Env
load_dotenv()
sys.path.append(os.getcwd())

# Import Database & Models
from database import engine, SessionLocal
import models 

# ==========================================
# 1. KONFIGURASI
# ==========================================
WATZAP_API_KEY = 'HHHI0XGX5GAV9COH'
WATZAP_NUMBER_KEY_MAIN = 'Hyw8OdnzTHwbi88t' 
WATZAP_NUMBER_KEY_OTP = 'lAaoF727veffmfRm'

# [PENTING] URL AppScript (Pastikan Deploy sebagai Web App -> Execute as Me -> Access: Anyone)
# Ganti URL ini dengan URL Deployment AppScript terbaru Anda jika berubah
APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbz8yJaOliingOSPDVdkgl09H8BgACQj3H_VgDri1-d2rSblp58K6GvKw-Fg1bFG7jGj/exec"

# --- GROQ AI SETUP ---
AI_MODEL = "llama-3.3-70b-versatile"
client = None
try:
    from openai import OpenAI
    try:
        client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url="https://api.groq.com/openai/v1"
        )
        print("INFO: Groq AI Connected", flush=True)
    except Exception as e:
        print(f"Warning: Fitur AI Error: {e}", flush=True)
        client = None
except ImportError:
    print("Warning: Library OpenAI belum terinstall.", flush=True)

# --- SETUP PATH FRONTEND & UPLOADS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_FOLDER = os.path.abspath(os.path.join(BASE_DIR, '..'))
UPLOAD_FOLDER = os.path.join(STATIC_FOLDER, 'uploads')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'kuncirahasia123')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- OTP STORAGE (Reset saat restart) ---
otp_storage = {}

# --- DATABASE SETUP ---
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database Error: {e}", flush=True)

def get_db():
    if 'db' not in g:
        g.db = SessionLocal()
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        try: db.close()
        except: pass

# ==========================================
# 2. HELPER FUNCTIONS (OPTIMIZED)
# ==========================================

def format_phone_number(phone):
    phone = str(phone).strip()
    if phone.startswith('0'): return '62' + phone[1:]
    elif phone.startswith('+62'): return phone[1:]
    return phone

def _send_wa_background(url, payload):
    """Kirim WA di background agar server tidak freeze"""
    try:
        # Timeout 15 detik agar thread mati sendiri jika Watzap down
        requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=15)
        print(f"[WA SENT] {payload['phone_no']}", flush=True)
    except Exception as e:
        print(f"[WA ERROR] {e}", flush=True)

def send_whatsapp_main(phone_number, message_text):
    try:
        formatted_phone = format_phone_number(phone_number)
        url = "https://api.watzap.id/v1/send_message"
        payload = {
            "api_key": WATZAP_API_KEY, 
            "number_key": WATZAP_NUMBER_KEY_MAIN, 
            "phone_no": formatted_phone, 
            "message": message_text
        }
        # Gunakan Threading
        threading.Thread(target=_send_wa_background, args=(url, payload)).start()
        return True
    except: return False

def send_whatsapp_otp_message(phone_number, otp_code):
    try:
        formatted_phone = format_phone_number(phone_number)
        message = f"Kode Verifikasi Jates9: *{otp_code}*\n\nJANGAN BERIKAN kode ini kepada siapa pun.\nBerlaku 5 menit."
        url = "https://api.watzap.id/v1/send_message"
        payload = {
            "api_key": WATZAP_API_KEY, 
            "number_key": WATZAP_NUMBER_KEY_OTP,
            "phone_no": formatted_phone, 
            "message": message
        }
        print(f"[OTP] Mengirim ke {formatted_phone}...", flush=True)
        threading.Thread(target=_send_wa_background, args=(url, payload)).start()
        return True
    except: return False

def send_whatsapp_welcome(phone_number, user_name, challenge_title):
    try:
        formatted_phone = format_phone_number(phone_number)
        msg = f"Selamat Datang di Jates9, Kak *{user_name}*! 👋\n\nPendaftaran Berhasil! Anda telah resmi memilih:\n🏆 *{challenge_title}*\n\n🚀 *MULAI SEKARANG:* \n👉 https://jagatetapsehat.com/dashboard\n\nSemangat hidup sehat! 💪"
        url = "https://api.watzap.id/v1/send_message"
        payload = {"api_key": WATZAP_API_KEY, "number_key": WATZAP_NUMBER_KEY_MAIN, "phone_no": formatted_phone, "message": msg}
        threading.Thread(target=_send_wa_background, args=(url, payload)).start()
    except: pass

def _sync_sheet_background(url, payload):
    """Kirim data ke Google Sheet di background"""
    try:
        requests.post(url, json=payload, timeout=10)
        print("[SHEET] Sync Berhasil", flush=True)
    except Exception as e:
        print(f"[SHEET ERROR] {e}", flush=True)

def sync_to_sheet(user, challenge_id=None, action="sync_challenge", extra_data=None):
    try:
        payload = {
            "action": action, 
            "nama": user.name,
            "whatsapp": user.phone_number,
            "challenge_id": challenge_id if challenge_id else user.challenge_id,
            "kategori": user.group or "Sehat",
            "hari": user.challenge_day or 1
        }
        if extra_data: payload.update(extra_data)
        threading.Thread(target=_sync_sheet_background, args=(APPSCRIPT_URL, payload)).start()
    except: pass

def generate_unique_code(db):
    while True:
        chars = string.ascii_uppercase + string.digits
        code = ''.join(random.choices(chars, k=6))
        exists = db.query(models.User).filter(models.User.referral_code == code).first()
        if not exists: return code

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'token' in request.args: token = request.args.get('token')
        if 'Authorization' in request.headers:
            auth = request.headers['Authorization']
            if "Bearer " in auth: token = auth.split(" ")[1]
        if not token: return jsonify({'message': 'Token missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            db = get_db()
            user = db.query(models.User).filter(models.User.id == data['user_id']).first()
            if not user: return jsonify({'message': 'User invalid'}), 401
        except: return jsonify({'message': 'Token invalid'}), 401
        return f(user, *args, **kwargs)
    return decorated

# ==========================================
# 3. AUTH ROUTES
# ==========================================

@app.route('/backend_api/api/auth/request-otp', methods=['POST'])
@app.route('/api/auth/request-otp', methods=['POST'])
def request_otp():
    try:
        data = request.get_json(); phone = data.get('phone_number')
        if not phone: return jsonify({'message': 'Nomor WA wajib diisi'}), 400
        
        if get_db().query(models.User).filter(models.User.phone_number == phone).first(): 
            return jsonify({'message': 'Nomor sudah terdaftar'}), 409
            
        otp_code = ''.join(random.choices(string.digits, k=6))
        otp_storage[phone] = { "code": otp_code, "expires": datetime.datetime.now() + datetime.timedelta(minutes=5) }
        
        print(f"[DEBUG] OTP Gen: {otp_code} for {phone}", flush=True) 
        
        if send_whatsapp_otp_message(phone, otp_code): 
            return jsonify({'success': True, 'message': 'OTP Terkirim'}), 200
        else: 
            return jsonify({'message': 'Gagal kirim WA'}), 500
    except Exception as e: return jsonify({'message': str(e)}), 500

@app.route('/backend_api/api/auth/verify-otp', methods=['POST'])
@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json(); phone = data.get('phone_number'); user_otp = data.get('otp')
        record = otp_storage.get(phone)
        if not record: return jsonify({'message': 'Minta OTP dulu'}), 400
        if datetime.datetime.now() > record['expires']: del otp_storage[phone]; return jsonify({'message': 'OTP Kadaluarsa'}), 400
        if record['code'] == user_otp: del otp_storage[phone]; return jsonify({'success': True}), 200
        return jsonify({'message': 'OTP Salah'}), 400
    except Exception as e: return jsonify({'message': str(e)}), 500

@app.route('/backend_api/api/auth/register', methods=['POST'])
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json(); db = get_db()
        if db.query(models.User).filter_by(phone_number=data.get('phone_number')).first(): return jsonify({'message': 'Nomor sudah terdaftar'}), 409
        referred_by_code = None
        if data.get('referral_code'):
            upline = db.query(models.User).filter_by(referral_code=data.get('referral_code')).first()
            if upline: referred_by_code = upline.referral_code
        new_user = models.User(name=data.get('name'), phone_number=data.get('phone_number'), password=generate_password_hash(data.get('password')), role='user', referral_code=generate_unique_code(db), referred_by=referred_by_code, badge="Pejuang Tangguh")
        db.add(new_user); db.commit()
        token = jwt.encode({'user_id': new_user.id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'message': 'Sukses', 'token': token, 'user': {'id': new_user.id, 'name': new_user.name}}), 201
    except Exception as e: return jsonify({'message': str(e)}), 500

@app.route('/backend_api/api/auth/login', methods=['POST'])
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json(); db = get_db()
        user = db.query(models.User).filter_by(phone_number=data.get('phone_number')).first()
        if not user or not check_password_hash(user.password, data.get('password')): return jsonify({'message': 'Salah WA/Password'}), 401
        token = jwt.encode({'user_id': user.id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'role': user.role, 'badge': user.badge}})
    except Exception as e: return jsonify({'message': str(e)}), 500

@app.route('/backend_api/api/auth/me', methods=['GET'])
@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({'user': {'id': current_user.id, 'name': current_user.name, 'phone': current_user.phone_number, 'role': current_user.role, 'badge': current_user.badge, 'group': current_user.group, 'referral_code': current_user.referral_code, 'challenge_id': current_user.challenge_id}})

# ==========================================
# 4. ADMIN FEATURES
# ==========================================

@app.route('/backend_api/api/admin/campaign/matrix/<int:challenge_id>', methods=['GET'])
@app.route('/api/admin/campaign/matrix/<int:challenge_id>', methods=['GET'])
@token_required
def get_campaign_matrix(current_user, challenge_id):
    if getattr(current_user, 'role', 'user') != 'admin': return jsonify({"message": "Unauthorized"}), 403
    db = get_db()
    campaigns = db.query(models.DailyCampaign).filter_by(challenge_id=challenge_id).order_by(models.DailyCampaign.day_sequence.asc()).all()
    result = []
    for c in campaigns:
        result.append({
            "day_sequence": c.day_sequence,
            "challenge_a": c.challenge_a, "challenge_b": c.challenge_b, "challenge_c": c.challenge_c,
            "fact_a": c.fact_a, "fact_b": c.fact_b, "fact_c": c.fact_c,
            "soft_sell_a": c.soft_sell_a, "soft_sell_b": c.soft_sell_b, "soft_sell_c": c.soft_sell_c
        })
    return jsonify(result)

@app.route('/backend_api/api/admin/campaign/matrix/save', methods=['POST'])
@app.route('/api/admin/campaign/matrix/save', methods=['POST'])
@token_required
def save_campaign_matrix(current_user):
    if getattr(current_user, 'role', 'user') != 'admin': return jsonify({"message": "Unauthorized"}), 403
    try:
        data = request.get_json(); challenge_id = data.get('challenge_id'); rows = data.get('data', [])
        db = get_db()
        for row in rows:
            day = row.get('day_sequence')
            campaign = db.query(models.DailyCampaign).filter_by(challenge_id=challenge_id, day_sequence=day).first()
            if not campaign:
                campaign = models.DailyCampaign(challenge_id=challenge_id, day_sequence=day); db.add(campaign)
            campaign.challenge_a = row.get('challenge_a'); campaign.challenge_b = row.get('challenge_b'); campaign.challenge_c = row.get('challenge_c')
            campaign.fact_a = row.get('fact_a'); campaign.fact_b = row.get('fact_b'); campaign.fact_c = row.get('fact_c')
            campaign.soft_sell_a = row.get('soft_sell_a'); campaign.soft_sell_b = row.get('soft_sell_b'); campaign.soft_sell_c = row.get('soft_sell_c')
        db.commit()
        return jsonify({"success": True})
    except Exception as e: return jsonify({"message": str(e)}), 500

# ==========================================
# 5. USER FEATURES (DASHBOARD & CHECKIN)
# ==========================================

@app.route('/backend_api/api/dashboard/user/overview', methods=['GET'])
@app.route('/api/dashboard/user/overview', methods=['GET'])
@token_required
def dashboard_overview(current_user):
    try:
        db = get_db(); total_referrals = 0
        if current_user.referral_code: total_referrals = db.query(models.User).filter(models.User.referred_by == current_user.referral_code).count()
        total_comm = db.query(func.sum(models.Commission.amount)).filter_by(user_id=current_user.id, status="approved").scalar() or 0.0
        total_checks = db.query(models.ChallengeLog).filter_by(user_id=current_user.id).count()
        return jsonify({
            "user": { "name": current_user.name, "group": current_user.group, "badge": current_user.badge, "challenge_day": current_user.challenge_day or 1, "referral_code": current_user.referral_code, "challenge_id": current_user.challenge_id },
            "financial": { "total_referrals": total_referrals, "commission_approved": total_comm, "total_checkins": total_checks }
        })
    except Exception as e: return jsonify({"message": str(e)}), 500

@app.route('/backend_api/api/daily-content', methods=['GET'])
@app.route('/api/daily-content', methods=['GET'])
@token_required
def get_daily_content(current_user):
    try:
        day = current_user.challenge_day or 1
        challenge_id = current_user.challenge_id
        group = current_user.group or 'Sehat'
        content = { "task_message": "Tetap semangat!", "fact_message": "Jaga pola makan.", "promo_message": "", "tasks": ["Minum Jates9 Pagi", "Minum Jates9 Malam"] }

        # --- LOGIKA BARU: CEK STATUS DATABASE HARI INI ---
        db = get_db()
        today_log = db.query(models.ChallengeLog).filter(
            models.ChallengeLog.user_id == current_user.id,
            models.ChallengeLog.day_number == day,
            func.date(models.ChallengeLog.timestamp) == datetime.date.today()
        ).first()
        
        # Kirim status (completed/pending/skipped/None) ke frontend
        today_status = today_log.status if today_log else None 
        # ------------------------------------------------

        if challenge_id:
            try:
                # [UPDATE] Menambahkan parameter 'kategori' untuk dikirim ke AppScript
                response = requests.get(APPSCRIPT_URL, params={
                    "action": "get_tasks", 
                    "challenge_id": challenge_id, 
                    "hari": day,
                    "kategori": group 
                }, timeout=5)
                
                if response.status_code == 200:
                    sheet_data = response.json()
                    if sheet_data.get('found'):
                        tugas_raw = sheet_data.get('Tugas', [])
                        if isinstance(tugas_raw, str): tugas_raw = [tugas_raw]
                        content['tasks'] = tugas_raw
                        content['fact_message'] = sheet_data.get('Fakta', content['fact_message'])
                        content['promo_message'] = sheet_data.get('Promo', "")
                        content['task_message'] = sheet_data.get('Pesan', sheet_data.get('message', content['task_message']))
                        
                        # Return dengan today_status
                        return jsonify({ 
                            "success": True, 
                            "day": day, 
                            "group": group, 
                            "source": "sheet", 
                            "message": content['task_message'], 
                            "fact": content['fact_message'], 
                            "promo": content['promo_message'], 
                            "tasks": content['tasks'],
                            "today_status": today_status 
                        })
            except Exception as e: print(f"[Sheet Fail] {e}", flush=True)

            # Fallback ke Database Lokal jika AppScript Gagal
            db = get_db()
            campaign = db.query(models.DailyCampaign).filter_by(challenge_id=challenge_id, day_sequence=day).first()
            if campaign:
                if group == 'A': 
                    content['task_message'] = campaign.challenge_a or content['task_message']
                    content['fact_message'] = campaign.fact_a or content['fact_message']
                    content['promo_message'] = campaign.soft_sell_a or ""
                elif group == 'B': 
                    content['task_message'] = campaign.challenge_b or content['task_message']
                    content['fact_message'] = campaign.fact_b or content['fact_message']
                    content['promo_message'] = campaign.soft_sell_b or ""
                elif group == 'C': 
                    content['task_message'] = campaign.challenge_c or content['task_message']
                    content['fact_message'] = campaign.fact_c or content['fact_message']
                    content['promo_message'] = campaign.soft_sell_c or ""
                else: 
                    content['task_message'] = campaign.challenge_a or content['task_message']
                    content['fact_message'] = campaign.fact_a or content['fact_message']
        
        # Return fallback dengan today_status
        return jsonify({ 
            "success": True, 
            "day": day, 
            "group": group, 
            "source": "db_or_default", 
            "message": content['task_message'], 
            "fact": content['fact_message'], 
            "promo": content['promo_message'], 
            "tasks": content['tasks'],
            "today_status": today_status 
        })
    except Exception as e: return jsonify({"message": str(e)}), 500

# [PENTING] LOGIKA CHECKIN TERBARU (STATUS PENDING/COMPLETED/SKIPPED)
@app.route('/backend_api/api/checkin', methods=['POST'])
@app.route('/api/checkin', methods=['POST'])
@token_required
def daily_checkin(current_user):
    try:
        data = request.get_json()
        journal = data.get('journal', '')
        status = data.get('status', 'completed') # 'completed', 'pending', 'skipped'
        db = get_db()
        
        if not current_user.challenge_id: return jsonify({"message": "Pilih challenge dulu"}), 400
        
        # Cek apakah sudah pernah check-in hari ini?
        today_log = db.query(models.ChallengeLog).filter(
            models.ChallengeLog.user_id == current_user.id,
            models.ChallengeLog.day_number == current_user.challenge_day,
            func.date(models.ChallengeLog.timestamp) == datetime.date.today()
        ).first()

        # Jika sudah selesai/skip hari ini, tolak request
        if today_log and today_log.status in ['completed', 'skipped']:
            return jsonify({"success": False, "message": "Status hari ini sudah final."}), 400

        # KONDISI 1: PENDING (Belum selesai, tunda)
        if status == 'pending':
            if today_log: # Update existing pending log
                today_log.notes = journal
                today_log.status = "pending" # Pastikan status tetap pending
                today_log.timestamp = datetime.datetime.utcnow()
            else:
                new_log = models.ChallengeLog(user_id=current_user.id, challenge_id=current_user.challenge_id, day_number=current_user.challenge_day, notes=journal, status="pending", timestamp=datetime.datetime.utcnow())
                db.add(new_log)
            db.commit()
            
            # PENTING: Jangan sync ke Sheet agar Reminder Malam tetap jalan (karena belum absen resmi)
            return jsonify({"success": True, "message": "Pending tercatat.", "is_pending": True})

        # KONDISI 2: COMPLETED (Sudah selesai)
        elif status == 'completed':
            if today_log:
                today_log.status = "completed"
                today_log.notes = journal
                today_log.timestamp = datetime.datetime.utcnow()
            else:
                new_log = models.ChallengeLog(user_id=current_user.id, challenge_id=current_user.challenge_id, day_number=current_user.challenge_day, notes=journal, status="completed", timestamp=datetime.datetime.utcnow())
                db.add(new_log)
            
            # Naik Hari
            user = db.query(models.User).filter_by(id=current_user.id).first()
            user.challenge_day = (user.challenge_day or 1) + 1
            db.commit()
            
            # Sync to AppScript (hanya jika completed)
            sync_to_sheet(user, action="checkin_user", extra_data={"journal": journal})
            return jsonify({"success": True, "message": "Check-in Berhasil!"})

        # KONDISI 3: SKIPPED (Dilewatkan oleh sistem/user)
        elif status == 'skipped':
            if today_log:
                today_log.status = "skipped"
                today_log.timestamp = datetime.datetime.utcnow()
            else:
                new_log = models.ChallengeLog(
                    user_id=current_user.id, 
                    challenge_id=current_user.challenge_id, 
                    day_number=current_user.challenge_day, 
                    notes="Dilewatkan", 
                    status="skipped", 
                    timestamp=datetime.datetime.utcnow()
                )
                db.add(new_log)
            
            # Naik Hari (Meski gagal/skip, hari tetap lanjut)
            user = db.query(models.User).filter_by(id=current_user.id).first()
            user.challenge_day = (user.challenge_day or 1) + 1
            db.commit()
            
            return jsonify({"success": True, "message": "Hari dilewatkan."})

    except Exception as e: db.rollback(); return jsonify({"message": str(e)}), 500

@app.route('/backend_api/api/evaluation/submit', methods=['POST'])
@app.route('/api/evaluation/submit', methods=['POST'])
@token_required
def submit_evaluation(current_user):
    return jsonify({"success": True, "message": "Evaluasi berhasil dikirim."})

# ==========================================
# 6. FRIENDS & CHALLENGES
# ==========================================

@app.route('/backend_api/api/friends/lookup', methods=['POST'])
@app.route('/api/friends/lookup', methods=['POST'])
@token_required
def lookup_friend(current_user):
    try:
        data = request.get_json(); ref_code = data.get('referral_code')
        if not ref_code: return jsonify({'success': False, 'message': 'Kode wajib'}), 400
        friend = get_db().query(models.User).filter(models.User.referral_code == ref_code).first()
        if not friend: return jsonify({'success': False, 'message': 'Teman tidak ditemukan'}), 404
        if friend.id == current_user.id: return jsonify({'success': False, 'message': 'Kode Anda sendiri'}), 400
        friend_challenge = "Belum ada challenge"
        if friend.challenge_id:
            ch = get_db().query(models.Challenge).filter(models.Challenge.id == friend.challenge_id).first()
            if ch: friend_challenge = ch.title
        friend_checks = get_db().query(models.ChallengeLog).filter(models.ChallengeLog.user_id == friend.id).count()
        return jsonify({'success': True, 'friend': {'name': friend.name, 'badge': friend.badge, 'group': friend.group, 'challenge_title': friend_challenge, 'total_checkins': friend_checks, 'challenge_day': friend.challenge_day or 1}})
    except Exception as e: return jsonify({'message': str(e)}), 500

@app.route('/backend_api/api/friends/list', methods=['GET'])
@app.route('/api/friends/list', methods=['GET'])
@token_required
def get_friend_list(current_user):
    try:
        db = get_db(); friends_data = []
        if current_user.referred_by:
            upline = db.query(models.User).filter(models.User.referral_code == current_user.referred_by).first()
            if upline: friends_data.append({'name': upline.name, 'badge': upline.badge, 'referral_code': upline.referral_code, 'relation': 'Mentor'})
        downlines = db.query(models.User).filter(models.User.referred_by == current_user.referral_code).all()
        for d in downlines: friends_data.append({'name': d.name, 'badge': d.badge, 'referral_code': d.referral_code, 'relation': 'Teman'})
        return jsonify({'success': True, 'friends': friends_data})
    except Exception as e: return jsonify({'message': str(e)}), 500

@app.route('/backend_api/api/challenges', methods=['GET'])
@app.route('/api/challenges', methods=['GET'])
def get_all_challenges():
    db = get_db(); challenges = db.query(models.Challenge).filter(models.Challenge.is_active == True).all()
    return jsonify([{"id": c.id, "title": c.title, "description": c.description} for c in challenges])

@app.route('/backend_api/api/user/select-challenge', methods=['POST'])
@app.route('/api/user/select-challenge', methods=['POST'])
@token_required
def select_challenge(current_user):
    try:
        data = request.get_json(); db = get_db()
        user = db.query(models.User).filter_by(id=current_user.id).first()
        user.challenge_id = data.get('challenge_id')
        user.challenge_day = 1 
        ch = db.query(models.Challenge).filter_by(id=data.get('challenge_id')).first()
        db.commit()
        sync_to_sheet(user, action="sync_challenge")
        try: send_whatsapp_welcome(user.phone_number, user.name, ch.title if ch else "Challenge")
        except: pass
        return jsonify({'success': True})
    except Exception as e: return jsonify({'message': str(e)}), 500

@app.route('/backend_api/api/admin/quiz/generate-challenge-auto', methods=['POST'])
@app.route('/api/admin/quiz/generate-challenge-auto', methods=['POST'])
@token_required
def admin_generate_challenge_auto(current_user):
    if getattr(current_user, 'role', 'user') != 'admin': return jsonify({"message": "Unauthorized"}), 403
    try:
        data = request.get_json(); title = data.get('title')
        prompt = f"Buat program '{title}' JSON murni: {{'description':'','categories':{{'A':'','B':'','C':''}},'questions':[{{'text':'','options':[{{'text':'','category':'A'}}]}}]}}"
        gpt_resp = client.chat.completions.create(model=AI_MODEL, messages=[{"role": "user", "content": prompt}], response_format={"type": "json_object"})
        raw_content = gpt_resp.choices[0].message.content.strip()
        start_idx = raw_content.find('{'); end_idx = raw_content.rfind('}') + 1
        ai_data = json.loads(raw_content[start_idx:end_idx])
        db = get_db()
        new_c = models.Challenge(title=title, description=ai_data['description'], is_active=True)
        db.add(new_c); db.flush()
        for idx, q in enumerate(ai_data['questions']):
            db.add(models.QuizQuestion(challenge_id=new_c.id, question_text=q['text'], options=q['options'], sequence=idx+1))
        for d in range(1, 31): db.add(models.DailyCampaign(challenge_id=new_c.id, day_sequence=d))
        db.commit(); return jsonify({"success": True})
    except Exception as e: return jsonify({"message": str(e)}), 500

@app.route('/backend_api/api/admin/quiz/delete-challenge/<int:challenge_id>', methods=['DELETE'])
@app.route('/api/admin/quiz/delete-challenge/<int:challenge_id>', methods=['DELETE'])
@token_required
def delete_challenge(current_user, challenge_id):
    if getattr(current_user, 'role', 'user') != 'admin': return jsonify({"message": "Unauthorized"}), 403
    try:
        db = get_db(); db.query(models.QuizQuestion).filter_by(challenge_id=challenge_id).delete()
        db.query(models.Challenge).filter_by(id=challenge_id).delete(); db.commit()
        return jsonify({"success": True})
    except Exception as e: db.rollback(); return jsonify({"message": str(e)}), 500

@app.route('/backend_api/api/admin/stats', methods=['GET'])
@app.route('/api/admin/stats', methods=['GET'])
@token_required
def admin_stats(current_user):
    db = get_db(); return jsonify({"total_users": db.query(models.User).count(), "total_revenue": db.query(func.sum(models.ProductPurchase.amount)).filter_by(status="paid").scalar() or 0.0})

@app.route('/backend_api/api/admin/users', methods=['GET'])
@app.route('/api/admin/users', methods=['GET'])
@token_required
def admin_users_list(current_user):
    if getattr(current_user, 'role', 'user') != 'admin': return jsonify({"message": "Unauthorized"}), 403
    db = get_db(); users = db.query(models.User).all()
    return jsonify([{"id": u.id, "name": u.name, "phone": u.phone_number, "role": u.role, "badge": u.badge} for u in users])

@app.route('/backend_api/api/quiz/questions/<int:challenge_id>', methods=['GET'])
@app.route('/api/quiz/questions/<int:challenge_id>', methods=['GET'])
def get_quiz_questions(challenge_id):
    db = get_db(); questions = db.query(models.QuizQuestion).filter(models.QuizQuestion.challenge_id == challenge_id).order_by(models.QuizQuestion.sequence.asc()).all()
    return jsonify([{"id": q.id, "question_text": q.question_text, "options": q.options} for q in questions])

@app.route('/backend_api/api/quiz/submit', methods=['POST'])
@app.route('/api/quiz/submit', methods=['POST'])
@token_required
def submit_quiz_result(current_user):
    try:
        data = request.get_json(); db = get_db()
        user = db.query(models.User).filter(models.User.id == current_user.id).first()
        user.group = data.get('health_type', 'Sehat')
        score = data.get('score', 0); answers = data.get('answers', [])
        new_result = models.QuizResult(user_id=current_user.id, score=score, answers=answers, health_type=user.group, created_at=datetime.datetime.utcnow())
        db.add(new_result); db.commit()
        return jsonify({"success": True})
    except Exception as e: db.rollback(); return jsonify({"success": False, "message": str(e)}), 500

@app.route('/backend_api/api/chat/send', methods=['POST'])
@app.route('/api/chat/send', methods=['POST'])
@token_required
def send_chat(current_user):
    if not client: return jsonify({"success": False, "response": "AI Error"}), 200
    try:
        data = request.get_json(); gpt_resp = client.chat.completions.create(model=AI_MODEL, messages=[{"role": "system", "content": "Kamu Dokter AI Jates9."}, {"role": "user", "content": data.get('message')}])
        return jsonify({"success": True, "response": gpt_resp.choices[0].message.content})
    except Exception as e: return jsonify({"success": False, "response": str(e)}), 500

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith('api') or path.startswith('backend_api'): return jsonify({"message": "API route not found"}), 404
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)): return send_from_directory(app.static_folder, path)
    if os.path.exists(os.path.join(app.static_folder, 'index.html')): return send_from_directory(app.static_folder, 'index.html')
    return "Frontend Build Not Found.", 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)
