from fastapi import FastAPI
import sqlite3
import random
import pickle
import pandas as pd
from pulp import LpProblem, LpVariable, LpMinimize, lpSum, LpStatus, value

with open("models/xgboost_model.pkl", "rb") as f:
    xgb_model = pickle.load(f)
with open("models/feature_columns.pkl", "rb") as f:
    feature_columns = pickle.load(f)

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

    # Get the shipment and its linked order_id
    cursor.execute("SELECT * FROM shipments WHERE id = ?", (shipment_id,))
    shipment = cursor.fetchone()
    if shipment is None:
        conn.close()
        return {"error": "Shipment not found"}

    order_id = shipment["order_id"]

    # Pull the full raw row from supply_chain (has all columns the model was trained on)
    cursor.execute("SELECT * FROM supply_chain WHERE order_id = ? LIMIT 1", (order_id,))
    raw_row = cursor.fetchone()
    if raw_row is None:
        conn.close()
        return {"error": "Original order data not found for this shipment"}

    raw_dict = dict(raw_row)

    # Drop target + ID/PII columns, matching training exactly
    columns_to_drop = [
        "late_delivery_risk", "customer_fname", "customer_lname",
        "customer_street", "product_image", "order_id", "customer_id",
        "order_customer_id", "order_item_id", "product_card_id"
    ]
    for col in columns_to_drop:
        raw_dict.pop(col, None)

    # One-hot encode exactly like training did
    df_row = pd.DataFrame([raw_dict])
    df_encoded = pd.get_dummies(
        df_row,
        columns=df_row.select_dtypes(include=["object", "string"]).columns,
        drop_first=True
    )

    # Align to the model's expected 443 columns, filling any missing ones with 0
    df_aligned = df_encoded.reindex(columns=feature_columns, fill_value=0)

    # Real XGBoost prediction
    probability = float(xgb_model.predict_proba(df_aligned)[0][1])

    # NOTE: model only predicts late_delivery_risk (probability).
    # Delay duration is a placeholder estimate until confirmed with the ML team.
    predicted_delay_days = round(7 + (probability * 7), 1)  # scales 7-14 days with risk

    model_version = "xgboost_v1"

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
        "probability": round(probability, 3),
        "predicted_delay_days": predicted_delay_days,
        "model_version": model_version
    }

@app.post("/prescribe/{prediction_id}")
def prescribe_options(prediction_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT dp.*, s.order_item_quantity, s.product_price, s.benefit_per_order
        FROM disruption_predictions dp
        JOIN shipments s ON dp.shipment_id = s.id
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

    # Candidate options — cost/time inputs to the optimizer
    options = {
        "A": {"action": "air_freight", "cost": round(price * quantity * 0.15, 2), "time_days": 2},
        "B": {"action": "secondary_supplier", "cost": round(price * quantity * 1.10, 2), "time_days": 5},
        "C": {"action": "delay_launch", "cost": round(abs(benefit) * delay_days * 0.02, 2), "time_days": delay_days},
    }

    # --- Real PuLP optimization ---
    # Binary decision variable per option: 1 if selected, 0 if not
    prob = LpProblem("Prescriptive_Decision", LpMinimize)
    x = {label: LpVariable(f"select_{label}", cat="Binary") for label in options}

    # Objective: minimize cost of the selected option
    prob += lpSum(options[label]["cost"] * x[label] for label in options)

    # Constraint: exactly one option must be selected
    prob += lpSum(x[label] for label in options) == 1

    # Constraint: the selected option must respect budget and time limits
    for label in options:
        prob += options[label]["cost"] * x[label] <= BUDGET
        prob += options[label]["time_days"] * x[label] <= MAX_TIME * x[label] + MAX_TIME * (1 - x[label]) if False else options[label]["time_days"] * x[label] <= MAX_TIME

    prob.solve()
    solver_status = LpStatus[prob.status]

    saved_options = []
    optimal_label = None

    for label, opt in options.items():
        # Only surface options that individually satisfy hard constraints
        feasible = opt["cost"] <= BUDGET and opt["time_days"] <= MAX_TIME
        if not feasible:
            continue

        cursor.execute("""
            INSERT INTO prescriptions (prediction_id, option_label, action_type, predicted_cost, predicted_time_days)
            VALUES (?, ?, ?, ?, ?)
        """, (prediction_id, label, opt["action"], opt["cost"], opt["time_days"]))

        saved_options.append({
            "prescription_id": cursor.lastrowid,
            "option_label": label,
            "action_type": opt["action"],
            "predicted_cost": opt["cost"],
            "predicted_time_days": opt["time_days"]
        })

        if x[label].value() == 1:
            optimal_label = label

    conn.commit()
    conn.close()

    return {
        "prediction_id": prediction_id,
        "solver_status": solver_status,
        "optimal_option": optimal_label,
        "options": saved_options
    }


@app.post("/decisions/{prescription_id}/execute")
def execute_decision(prescription_id: int, user_id: str = "manager_01"):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Confirm the prescription exists
    cursor.execute("SELECT * FROM prescriptions WHERE id = ?", (prescription_id,))
    prescription = cursor.fetchone()
    if prescription is None:
        conn.close()
        return {"error": "Prescription not found"}

    # Idempotency check — if already executed, return the existing decision instead of creating a duplicate
    cursor.execute("SELECT * FROM decisions WHERE prescription_id = ?", (prescription_id,))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return {
            "message": "Decision already executed (idempotent — no duplicate created)",
            "decision_id": existing["id"],
            "prescription_id": prescription_id,
            "status": existing["status"]
        }

    # Insert the new decision
    cursor.execute("""
        INSERT INTO decisions (prescription_id, user_id, status)
        VALUES (?, ?, 'executed')
    """, (prescription_id, user_id))
    conn.commit()

    decision_id = cursor.lastrowid
    conn.close()

    return {
        "message": "Decision executed successfully",
        "decision_id": decision_id,
        "prescription_id": prescription_id,
        "action_type": prescription["action_type"],
        "user_id": user_id
    }

@app.get("/analytics/decision-roi")
def decision_roi():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT o.*, p.action_type, p.predicted_cost, p.predicted_time_days
        FROM outcomes o
        JOIN decisions d ON o.decision_id = d.id
        JOIN prescriptions p ON d.prescription_id = p.id
    """)
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return {"message": "No outcomes recorded yet", "total_decisions": 0}

    total = len(rows)
    within_10_percent = 0
    total_variance_cost = 0
    by_action_type = {}

    for row in rows:
        variance_pct = abs(row["variance_cost"]) / row["predicted_cost"] if row["predicted_cost"] else 0
        if variance_pct <= 0.10:
            within_10_percent += 1
        total_variance_cost += row["variance_cost"]

        action = row["action_type"]
        if action not in by_action_type:
            by_action_type[action] = {"count": 0, "total_variance_cost": 0}
        by_action_type[action]["count"] += 1
        by_action_type[action]["total_variance_cost"] += row["variance_cost"]

    for action in by_action_type:
        count = by_action_type[action]["count"]
        by_action_type[action]["avg_variance_cost"] = round(by_action_type[action]["total_variance_cost"] / count, 2)

    return {
        "total_decisions": total,
        "percent_within_10_percent_of_prediction": round((within_10_percent / total) * 100, 1),
        "average_variance_cost": round(total_variance_cost / total, 2),
        "breakdown_by_action_type": by_action_type
    }

