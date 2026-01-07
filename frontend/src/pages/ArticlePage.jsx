Python

@app.route('/backend_api/api/articles/<int:article_id>', methods=['GET'])
@app.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article_detail(article_id):
    try:
        db = get_db()
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        
        if not article:
            return jsonify({"message": "Artikel tidak ditemukan"}), 404
            
        return jsonify({
            "id": article.id,
            "title": article.title,
            "content": article.content,
            "image_url": article.image_url,
            "created_at": article.created_at,
            "reading_time": article.reading_time
        })
    except Exception as e:
        return jsonify({"message": str(e)}), 500
2. Buat File Baru: ArticlePage.jsx
