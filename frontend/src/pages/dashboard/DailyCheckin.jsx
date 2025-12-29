# --- ROUTE TAMBAHAN: PROGRESS CHALLENGE ---
@app.route('/backend_api/api/challenge/progress/<int:user_id>', methods=['GET'])
@app.route('/api/challenge/progress/<int:user_id>', methods=['GET'])
@token_required
def challenge_progress(current_user, user_id):
    # Sementara return data dummy agar Checkin Page tidak error
    # Nanti logika aslinya ambil dari tabel ChallengeLog
    return jsonify({
        "current_day": 1,
        "challenge_id": "challenge_30_days",
        "status": "active"
    })

# --- ROUTE TAMBAHAN: SUBMIT CHECKIN ---
@app.route('/backend_api/api/dashboard/user/checkin', methods=['POST'])
@app.route('/api/dashboard/user/checkin', methods=['POST'])
@token_required
def submit_checkin(current_user):
    try:
        data = request.get_json()
        # Disini logika simpan ke database (ChallengeLog)
        # Untuk sekarang return sukses dulu agar frontend jalan
        return jsonify({"success": True, "message": "Check-in berhasil disimpan"})
    except Exception as e:
        return jsonify({"message": "Error", "detail": str(e)}), 500
