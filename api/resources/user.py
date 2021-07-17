import logging
import json

from api import db
from api.utils.req_handling import *
from flask_restplus import Resource, fields
import api
import hashlib

user = api.api.namespace("users", description="User operations")

create_user_details = api.api.model(
    "User",
    {
        "username": fields.String(required=True, description="Username of the user"),
        "password": fields.String(
            required=True, description="The password of the user"
        ),
        "email": fields.String(required=True, description="Email address of the user"),
    },
)

get_user_details = api.api.model(
    "User",
    {
        "user_id": fields.Integer(required=True, description="The UserID"),
        "username": fields.String(required=True, description="Username of the user"),
        "email": fields.String(required=True, description="Email address of the user"),
    },
)


class UserModel(db.Model):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True)
    email = db.Column(db.Text, unique=True)
    password_hash = db.Column(db.Text)
    authenticated = db.Column(db.Boolean, default=False)

    # See: https://realpython.com/using-flask-login-for-user-management-with-flask/
    def is_active(self):
        """True, as all users are active."""
        return True

    def get_id(self):
        """Return the email address to satisfy Flask-Login's requirements."""
        return self.user_id

    def is_authenticated(self):
        """Return True if the user is authenticated."""
        return self.authenticated

    def is_anonymous(self):
        """False, as anonymous users aren't supported."""
        return False

    def __repr__(self):
        return json.dumps(self.to_dict())

    def to_dict(self):
        data = {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
        }
        return data


# See example: https://github.com/noirbizarre/flask-restplus/blob/master/examples/todo.py
@user.route("/<int:user_id>")
@user.param("user_id", "The user identifier")
@user.response(404, "User not found")
class User(Resource):
    @user.doc(description=f"UserID must be provided")
    @user.marshal_with(get_user_details)
    def get(self, user_id):
        logging.info(f"Getting user {user_id}")
        return UserModel.query.get_or_404(user_id).to_dict()

    # TODO: Delete a user
    # def delete(self, todo_id):
    #     del TODOS[todo_id]
    #     return '', 204

    # TODO: Update a user
    # def put(self, todo_id):
    #     args = parser.parse_args()
    #     task = {'task': args['task']}
    #     TODOS[todo_id] = task
    #     return task, 201


@user.route("")
@user.param("username", "The username to search")
class UserList(Resource):
    @user.doc(description=f"Creates a new User")
    @user.expect(create_user_details)
    @user.marshal_with(get_user_details)
    def post(self):
        logging.info("Registering a user")
        content = get_request_json()
        try:
            # Receive contents from request
            logging.info(content)
            username = content["username"]
            password = content["password"]
            email = content["email"]
            password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
            u = UserModel(
                username=username,
                email=email,
                password_hash=password_hash,
            )
            logging.info(u)
            db.session.add(u)
            db.session.commit()
            logging.info(f"UserID created: {u}")
            return UserModel.query.filter_by(user_id=u.user_id).first()

        except Exception as e:
            logging.error(e)
            api.api.abort(500, f"{e}")

    @user.doc(description=f"Returns a user by search")
    @user.expect(get_user_details)
    def get(self):
        keyword = request.args.get("username")
        logging.info(f"Searching for usernames like: {keyword}")
        search_return = UserModel.query.filter(
            UserModel.username.ilike(f"%{keyword}%")
        ).limit(api.config.Config.RESULT_LIMIT)
        search_users = [l.to_dict() for l in search_return]
        return {"users": search_users}
