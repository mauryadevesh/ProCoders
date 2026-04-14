import copy
import os
from datetime import datetime, timezone

try:
    from pymongo import MongoClient
    from pymongo.errors import PyMongoError
except Exception:  # pragma: no cover - fallback when pymongo is unavailable
    MongoClient = None
    PyMongoError = Exception


class DatabaseStore:
    def __init__(self):
        self.enabled = False
        self._users = {}
        self._profiles = {}
        self._sessions = {}

        self._users_collection = None
        self._profiles_collection = None
        self._sessions_collection = None

        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        mongo_db_name = os.getenv("MONGO_DB_NAME", "adaptive_learning")

        if not MongoClient:
            return

        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            client.admin.command("ping")

            database = client[mongo_db_name]
            self._users_collection = database["users"]
            self._profiles_collection = database["profiles"]
            self._sessions_collection = database["sessions"]

            self._users_collection.create_index("username", unique=True)
            self._profiles_collection.create_index("user_id", unique=True)
            self._sessions_collection.create_index("user_id", unique=True)

            self.enabled = True
        except Exception:
            self.enabled = False

    @staticmethod
    def _now_iso():
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _clone(data):
        return copy.deepcopy(data)

    @staticmethod
    def _strip_internal_id(document):
        if not document:
            return None

        clean_document = dict(document)
        clean_document.pop("_id", None)
        return clean_document

    def get_user(self, username):
        if self.enabled:
            try:
                document = self._users_collection.find_one({"username": username})
                return self._strip_internal_id(document)
            except PyMongoError:
                return None

        return self._clone(self._users.get(username))

    def create_user(self, user_document):
        username = user_document["username"]
        if self.get_user(username):
            return False

        document = {
            **user_document,
            "created_at": self._now_iso(),
            "updated_at": self._now_iso(),
        }

        if self.enabled:
            try:
                self._users_collection.insert_one(document)
                return True
            except PyMongoError:
                return False

        self._users[username] = self._clone(document)
        return True

    def get_profile(self, user_id):
        if self.enabled:
            try:
                document = self._profiles_collection.find_one({"user_id": user_id})
                return self._strip_internal_id(document)
            except PyMongoError:
                return None

        return self._clone(self._profiles.get(user_id))

    def save_profile(self, user_id, profile_document):
        document = {
            **profile_document,
            "user_id": user_id,
            "updated_at": self._now_iso(),
        }

        if self.enabled:
            try:
                self._profiles_collection.replace_one(
                    {"user_id": user_id},
                    document,
                    upsert=True,
                )
                return
            except PyMongoError:
                return

        self._profiles[user_id] = self._clone(document)

    def get_session(self, user_id):
        if self.enabled:
            try:
                document = self._sessions_collection.find_one({"user_id": user_id})
                return self._strip_internal_id(document)
            except PyMongoError:
                return None

        return self._clone(self._sessions.get(user_id))

    def save_session(self, user_id, session_document):
        document = {
            **session_document,
            "user_id": user_id,
            "updated_at": self._now_iso(),
        }

        if self.enabled:
            try:
                self._sessions_collection.replace_one(
                    {"user_id": user_id},
                    document,
                    upsert=True,
                )
                return
            except PyMongoError:
                return

        self._sessions[user_id] = self._clone(document)

    def delete_session(self, user_id):
        if self.enabled:
            try:
                self._sessions_collection.delete_one({"user_id": user_id})
                return
            except PyMongoError:
                return

        self._sessions.pop(user_id, None)


store = DatabaseStore()
