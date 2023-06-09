import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL"
    ) or "sqlite:///" + os.path.join(basedir, "app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "SUPER_SECRET_KEY"
    JWT_ACCESS_LIFESPAN = {"minutes": 60}
    RESULT_LIMIT = 200
    CATEGORIES = ["entertainment", "sport", "accommodation", "healthcare", "other"]
