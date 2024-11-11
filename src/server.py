# server.py
from flask import Flask, jsonify
import psycopg2
import os

app = Flask(__name__)

# def get_db_connection():
#     conn = psycopg2.connect(
#         dbname=os.getenv("POSTGRES_DB"),
#         user=os.getenv("POSTGRES_USER"),
#         password=os.getenv("POSTGRES_PASSWORD"),
#         host="localhost",
#         port=5432
#     )
#     return conn

# @app.route('/')
# def index():
#     conn = get_db_connection()
#     cur = conn.cursor()
#     cur.execute("SELECT NOW();")
#     time = cur.fetchone()[0]
#     cur.close()
#     conn.close()
#     return jsonify({"time": time})

# if __name__ == "__main__":
#     app.run(host='0.0.0.0', port=5000)

@app.route("/")
def helloworld():
    return "<p>Hello World!</p>"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000)