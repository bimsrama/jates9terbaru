import os
import requests
import logging

logger = logging.getLogger(__name__)

# URL API Watzap
WA_API_URL = "https://api.watzap.id/v1/send_message"

def send_whatsapp_message(target_phone: str, message: str):
    """
    Kirim pesan WhatsApp menggunakan Watzap.id
    """
    # 1. Ambil Key (Prioritas: Environment Variable, Fallback: Hardcoded)
    # Ganti string di parameter kedua dengan Key Asli Anda jika env gagal terbaca
    api_key = os.getenv("WHATSAPP_API_KEY", "HHHI0XGX5GAV9COH")
    number_key = os.getenv("WHATSAPP_NUMBER_KEY", "Hyw8OdnzTHwbi88t")

    if not api_key or not number_key:
        logger.warning("❌ GAGAL WA: API Key atau Number Key belum disetting.")
        return False
    
    # 2. Format nomor HP (08xx -> 628xx)
    clean_phone = str(target_phone).strip().replace("-", "").replace(" ", "")
    if clean_phone.startswith("0"):
        clean_phone = "62" + clean_phone[1:]
    elif clean_phone.startswith("+62"):
        clean_phone = clean_phone[1:]
    
    try:
        payload = {
            "api_key": api_key,
            "number_key": number_key,
            "phone_no": clean_phone,
            "message": message
        }
        
        headers = {"Content-Type": "application/json"}

        # 3. Kirim Request
        response = requests.post(WA_API_URL, json=payload, headers=headers)
        
        # 4. Cek Response
        if response.status_code == 200:
            resp_json = response.json()
            if resp_json.get("status") == "200":
                logger.info(f"✅ WA Terkirim ke {clean_phone}")
                return True
            else:
                logger.error(f"❌ Watzap Error: {resp_json.get('message')}")
                return False
        else:
            logger.error(f"❌ HTTP Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error koneksi WA: {str(e)}")
        return False
