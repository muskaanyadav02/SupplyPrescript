from fastapi import FastAPI
import sqlite3
import random

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


    

@app.get("/predict/{shipment_id}")
def predict_delay(shipment_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shipments WHERE id = ?", (shipment_id,))
    shipment = cursor.fetchone()

    if shipment is None:
        conn.close()
        return {"error": "Shipment not found"}

    # MOCK prediction — replace with real XGBoost model later
    probability = round(random.uniform(0.3, 0.95), 2)
    predicted_delay_days = round(random.uniform(2, 14), 1)
    model_version = "mock_v0"

    cursor.execute("""
        INSERT INTO disruption_predictions (shipment_id, probability, predicted_delay_days, model_version)
        VALUES (?, ?, ?, ?)
    """, (shipment_id, probability, predicted_delay_days, model_version))
    conn.commit()

    prediction_id = cursor.lastrowid
    conn.close()

    return {
        "prediction_id": prediction_id,
        "shipment_id": shipment_id,
        "probability": probability,
        "predicted_delay_days": predicted_delay_days,
        "model_version": model_version
    }