from fastapi import FastAPI
import sqlite3
import pickle
import pandas as pd

from pulp import (
    LpProblem,
    LpVariable,
    LpMinimize,
    lpSum,
    LpStatus,
    value
)
# -----------------------------
# Load ML Model
# -----------------------------
with open("../../models/xgboost_model.pkl", "rb") as f:
    xgb_model = pickle.load(f)

with open("../../models/feature_columns.pkl", "rb") as f:
    feature_columns = pickle.load(f)
app = FastAPI()


# -----------------------------
# Database Connection
# -----------------------------
def get_db_connection():
    conn = sqlite3.connect("database/supply_chain.db")
    conn.row_factory = sqlite3.Row
    return conn


# -----------------------------
# Home API
# -----------------------------
@app.get("/")
def root():
    return {
        "message": "SupplyPrescript API is running"
    }


# -----------------------------
# Shipments API
# -----------------------------
@app.get("/shipments")
def get_shipments():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM shipments
        LIMIT 20
    """)

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]


# -----------------------------
# Dashboard KPI API
# -----------------------------
@app.get("/dashboard/kpis")
def dashboard_kpis():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM shipments")
    total_shipments = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM shipments
        WHERE status='pending'
    """)
    pending_shipments = cursor.fetchone()[0]

    cursor.execute("""
        SELECT AVG(product_price)
        FROM shipments
    """)
    avg_price = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT SUM(benefit_per_order)
        FROM shipments
    """)
    total_profit = cursor.fetchone()[0] or 0

    conn.close()

    return {
        "total_shipments": total_shipments,
        "pending_shipments": pending_shipments,
        "average_price": round(avg_price, 2),
        "total_profit": round(total_profit, 2)
    }


# -----------------------------
# Prediction API
# -----------------------------
@app.get("/predict/{shipment_id}")
def predict_delay(shipment_id: int):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM shipments WHERE id=?",
        (shipment_id,)
    )

    shipment = cursor.fetchone()

    if shipment is None:
        conn.close()
        return {
            "error": "Shipment not found"
        }

    order_id = shipment["order_id"]

    cursor.execute(
        """
        SELECT *
        FROM supply_chain
        WHERE order_id=?
        LIMIT 1
        """,
        (order_id,)
    )

    raw_row = cursor.fetchone()

    if raw_row is None:
        conn.close()
        return {
            "error": "Original order not found"
        }

    raw_dict = dict(raw_row)

    columns_to_drop = [
        "late_delivery_risk",
        "customer_fname",
        "customer_lname",
        "customer_street",
        "product_image",
        "order_id",
        "customer_id",
        "order_customer_id",
        "order_item_id",
        "product_card_id"
    ]

    for col in columns_to_drop:
        raw_dict.pop(col, None)

    df = pd.DataFrame([raw_dict])

    df = pd.get_dummies(
        df,
        columns=df.select_dtypes(
            include=["object", "string"]
        ).columns,
        drop_first=True
    )

    df = df.reindex(
        columns=feature_columns,
        fill_value=0
    )

    probability = float(
        xgb_model.predict_proba(df)[0][1]
    )

    predicted_delay_days = round(
        7 + probability * 7,
        1
    )

    cursor.execute(
        """
        INSERT INTO disruption_predictions
        (
            shipment_id,
            probability,
            predicted_delay_days,
            model_version
        )
        VALUES
        (?, ?, ?, ?)
        """,
        (
            shipment_id,
            probability,
            predicted_delay_days,
            "xgboost_v1"
        )
    )

    conn.commit()

    prediction_id = cursor.lastrowid

    conn.close()

    return {
        "prediction_id": prediction_id,
        "shipment_id": shipment_id,
        "probability": round(probability, 3),
        "predicted_delay_days": predicted_delay_days,
        "model_version": "xgboost_v1"
    }
# -----------------------------
# -----------------------------
# Prescription API
# -----------------------------
@app.post("/prescribe/{prediction_id}")
def prescribe_options(prediction_id: int):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT dp.*, s.order_item_quantity,
               s.product_price,
               s.benefit_per_order
        FROM disruption_predictions dp
        JOIN shipments s
        ON dp.shipment_id = s.id
        WHERE dp.id = ?
    """, (prediction_id,))

    row = cursor.fetchone()

    if row is None:
        conn.close()
        return {"error": "Prediction not found"}

    quantity = row["order_item_quantity"] or 1
    price = row["product_price"] or 0
    benefit = row["benefit_per_order"] or 0
    delay_days = row["predicted_delay_days"] or 1

    BUDGET = 20000
    MAX_TIME = 21

    options = {
        "A": {
            "action": "Air Freight",
            "cost": round(price * quantity * 0.15, 2),
            "time_days": 2
        },
        "B": {
            "action": "Secondary Supplier",
            "cost": round(price * quantity * 1.10, 2),
            "time_days": 5
        },
        "C": {
            "action": "Delay Launch",
            "cost": round(abs(benefit) * delay_days * 0.02, 2),
            "time_days": delay_days
        }
    }

    # -----------------------------
    # PuLP Optimization
    # -----------------------------
    prob = LpProblem("Prescriptive_Decision", LpMinimize)

    x = {
        label: LpVariable(f"select_{label}", cat="Binary")
        for label in options
    }

    # Minimize total cost
    prob += lpSum(options[label]["cost"] * x[label] for label in options)

    # Select exactly one option
    prob += lpSum(x[label] for label in options) == 1

    # Budget constraint
    prob += lpSum(options[label]["cost"] * x[label] for label in options) <= BUDGET

    # Time constraint
    prob += lpSum(options[label]["time_days"] * x[label] for label in options) <= MAX_TIME

    prob.solve()

    solver_status = LpStatus[prob.status]

    saved_options = []
    optimal_option = None

    for label, option in options.items():

        cursor.execute("""
            INSERT INTO prescriptions
            (
                prediction_id,
                option_label,
                action_type,
                predicted_cost,
                predicted_time_days
            )
            VALUES (?, ?, ?, ?, ?)
        """,
        (
            prediction_id,
            label,
            option["action"],
            option["cost"],
            option["time_days"]
        ))

        prescription_id = cursor.lastrowid

        saved_options.append({
            "prescription_id": prescription_id,
            "option_label": label,
            "action_type": option["action"],
            "predicted_cost": option["cost"],
            "predicted_time_days": option["time_days"]
        })

        if x[label].value() == 1:
            optimal_option = label

    conn.commit()
    conn.close()

    return {
        "prediction_id": prediction_id,
        "solver_status": solver_status,
        "optimal_option": optimal_option,
        "options": saved_options
    }


# -----------------------------
# Decision API
# -----------------------------
@app.post("/decisions/{prescription_id}/execute")
def execute_decision(
    prescription_id: int,
    user_id: str = "manager_01"
):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM prescriptions WHERE id=?",
        (prescription_id,)
    )

    prescription = cursor.fetchone()

    if prescription is None:
        conn.close()
        return {"error": "Prescription not found"}

    cursor.execute(
        "SELECT * FROM decisions WHERE prescription_id=?",
        (prescription_id,)
    )

    existing = cursor.fetchone()

    if existing:
        conn.close()

        return {
            "message": "Already Executed",
            "decision_id": existing["id"],
            "status": existing["status"]
        }

    cursor.execute("""
        INSERT INTO decisions
        (
            prescription_id,
            user_id,
            status
        )
        VALUES (?, ?, 'executed')
    """,
    (
        prescription_id,
        user_id
    ))

    conn.commit()

    decision_id = cursor.lastrowid

    conn.close()

    return {
        "decision_id": decision_id,
        "prescription_id": prescription_id,
        "user_id": user_id,
        "status": "executed"
    }


# -----------------------------
# Analytics API
# -----------------------------
@app.get("/analytics/decision-roi")
def decision_roi():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            COUNT(*) as total,
            AVG(actual_cost) as avg_cost,
            AVG(actual_time_days) as avg_days
        FROM outcomes
    """)

    row = cursor.fetchone()

    conn.close()

    if row["total"] == 0:
        return {
            "message": "No outcomes available"
        }

    return {
        "total_decisions": row["total"],
        "average_actual_cost": round(row["avg_cost"], 2),
        "average_actual_time_days": round(row["avg_days"], 2)
    }
