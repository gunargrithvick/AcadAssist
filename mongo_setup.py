from pymongo import MongoClient
import os

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = os.environ.get('MONGO_DB', 'acadassist_db')

def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]

def log_message(sender, text):
    db = get_db()
    col = db['conversations']
    col.insert_one({'sender': sender, 'text': text})
