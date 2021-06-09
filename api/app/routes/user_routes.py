import logging

from app import app
from app import db
from app.models.user import User
from flask import jsonify, request

logging.basicConfig(level=logging.INFO)

@app.route('/users/<int:id>')
def users(id):
    logging.info(f"Getting user {id}")
    return jsonify(User.query.get_or_404(id).to_dict())

@app.route('/register_user', methods=["POST"])
def register_user():
    logging.info("Registering a user")
    content = request.json
    if request.method == 'POST':
        try:
            username = content["username"]
            email = content["email"]
            u = User(username=username, email=email)
            db.session.add(u)
            db.session.commit()
            id = u.id
            return jsonify(User.query.get_or_404(id).to_dict())
        except Exception as e:
            logging.error(e)
