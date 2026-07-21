from fastapi import FastAPI
import sqlite3

app = FastAPI()

def get_db_connection():
    conn = sqlite3.connect("database/supply_chain.db")
    conn.row_factory = sqlite3.Row  # lets us return rows as dictionaries
    return conn

@app.get("/")
def root():
    return {"message": "SupplyPrescript API is running"}

@app.get("/shipments")
def get_shipments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shipments LIMIT 20;")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]