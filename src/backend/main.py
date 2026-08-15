from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pickle
import sqlite3
from pathlib import Path
import pandas as pd
from pulp import LpProblem, LpVariable, LpMinimize, lpSum, LpStatus

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATABASE_PATH = PROJECT_ROOT / "database" / "supply_chain.db"
MODEL_PATH = PROJECT_ROOT / "models" / "xgboost_model.pkl"
FEATURE_COLUMNS_PATH = PROJECT_ROOT / "models" / "feature_columns.pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        xgb_model = pickle.load(f)
except Exception as error:
    xgb_model = None
    print(f"Warning: Could not load XGBoost model: {error}")

try:
    with open(FEATURE_COLUMNS_PATH, "rb") as f:
        feature_columns = pickle.load(f)
except Exception as error:
    feature_columns = None
    print(f"Warning: Could not load feature columns: {error}")

app = FastAPI(title="SupplyPrescript API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    if not DATABASE_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Database file not found: {DATABASE_PATH}"
        )
    connection = sqlite3.connect(str(DATABASE_PATH))
    connection.row_factory = sqlite3.Row
    return connection


def table_exists(connection, table_name: str) -> bool:
    row = connection.execute(
        """SELECT name FROM sqlite_master
           WHERE type = 'table' AND name = ?""",
        (table_name,)
    ).fetchone()
    return row is not None


def ensure_prediction_tables(connection):
    connection.execute("""
        CREATE TABLE IF NOT EXISTS disruption_predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shipment_id INTEGER NOT NULL,
            probability REAL NOT NULL,
            predicted_delay_days REAL,
            model_version TEXT
        )
    """)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prediction_id INTEGER NOT NULL,
            option_label TEXT NOT NULL,
            action_type TEXT NOT NULL,
            predicted_cost REAL NOT NULL,
            predicted_time_days REAL NOT NULL
        )
    """)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prescription_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            status TEXT NOT NULL
        )
    """)
    connection.commit()


@app.get("/")
def root():
    return {
        "message": "SupplyPrescript API is running",
        "status": "online",
        "project": "SupplyPrescript",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": DATABASE_PATH.exists(),
        "ml_model": xgb_model is not None,
        "feature_columns": feature_columns is not None
    }


@app.get("/database/tables")
def get_database_tables():
    connection = get_db_connection()
    try:
        rows = connection.execute("""
            SELECT name FROM sqlite_master
            WHERE type = 'table'
            ORDER BY name
        """).fetchall()
        return {"tables": [dict(row)["name"] for row in rows]}
    finally:
        connection.close()


@app.get("/shipments")
def get_shipments():
    connection = get_db_connection()
    try:
        if not table_exists(connection, "supply_chain"):
            raise HTTPException(
                status_code=500,
                detail="Table 'supply_chain' does not exist."
            )
        rows = connection.execute("""
            SELECT * FROM supply_chain LIMIT 20
        """).fetchall()
        return [dict(row) for row in rows]
    except HTTPException:
        raise
    except sqlite3.Error as error:
        raise HTTPException(status_code=500, detail=f"Database error: {error}")
    finally:
        connection.close()


@app.get("/dashboard/kpis")
def dashboard_kpis():
    connection = get_db_connection()
    try:
        if not table_exists(connection, "supply_chain"):
            raise HTTPException(
                status_code=500,
                detail="Table 'supply_chain' does not exist."
            )

        cursor = connection.cursor()
        total_shipments = cursor.execute(
            "SELECT COUNT(*) FROM supply_chain"
        ).fetchone()[0] or 0
        pending_shipments = cursor.execute(
            """SELECT COUNT(*) FROM supply_chain
               WHERE LOWER(COALESCE(order_status, '')) = 'pending'"""
        ).fetchone()[0] or 0
        average_price = cursor.execute(
            "SELECT AVG(product_price) FROM supply_chain"
        ).fetchone()[0] or 0
        total_profit = cursor.execute(
            "SELECT SUM(benefit_per_order) FROM supply_chain"
        ).fetchone()[0] or 0

        return {
            "total_shipments": total_shipments,
            "pending_shipments": pending_shipments,
            "average_price": round(float(average_price), 2),
            "total_profit": round(float(total_profit), 2)
        }
    except HTTPException:
        raise
    except sqlite3.Error as error:
        raise HTTPException(status_code=500, detail=f"Database error: {error}")
    finally:
        connection.close()


@app.get("/predict/{shipment_id}")
def predict_delay(shipment_id: int):
    if xgb_model is None or feature_columns is None:
        raise HTTPException(
            status_code=500,
            detail=(
                "ML model is not available. Check "
                "models/xgboost_model.pkl and models/feature_columns.pkl."
            )
        )

    connection = get_db_connection()
    try:
        if not table_exists(connection, "supply_chain"):
            raise HTTPException(
                status_code=500,
                detail="Table 'supply_chain' does not exist."
            )

        ensure_prediction_tables(connection)
        cursor = connection.cursor()

        # The actual database uses order_id as the shipment/order identifier.
        shipment = cursor.execute("""
            SELECT * FROM supply_chain
            WHERE order_id = ?
            LIMIT 1
        """, (shipment_id,)).fetchone()

        if shipment is None:
            raise HTTPException(
                status_code=404,
                detail=f"Shipment/order {shipment_id} not found."
            )

        raw_dict = dict(shipment)

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
            "product_card_id",
        ]

        for column in columns_to_drop:
            raw_dict.pop(column, None)

        dataframe = pd.DataFrame([raw_dict])
        categorical_columns = dataframe.select_dtypes(
            include=["object", "string", "category"]
        ).columns

        if len(categorical_columns) > 0:
            dataframe = pd.get_dummies(
                dataframe,
                columns=categorical_columns,
                drop_first=True
            )

        dataframe = dataframe.reindex(
            columns=feature_columns,
            fill_value=0
        )

        probability = float(xgb_model.predict_proba(dataframe)[0][1])

        if probability >= 0.70:
            risk_level = "High"
        elif probability >= 0.40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # The model predicts late-delivery risk, not exact duration.
        predicted_delay_days = round(7 + probability * 7, 1)
        model_version = "xgboost_v1"

        cursor.execute("""
            INSERT INTO disruption_predictions
            (shipment_id, probability, predicted_delay_days, model_version)
            VALUES (?, ?, ?, ?)
        """, (
            shipment_id,
            probability,
            predicted_delay_days,
            model_version
        ))

        connection.commit()
        prediction_id = cursor.lastrowid

        return {
            "prediction_id": prediction_id,
            "shipment_id": shipment_id,
            "probability": round(probability, 3),
            "risk_level": risk_level,
            "predicted_delay_days": predicted_delay_days,
            "model_version": model_version
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {error}"
        )
    finally:
        connection.close()


@app.get("/predictions")
def get_predictions():
    connection = get_db_connection()
    try:
        if not table_exists(connection, "disruption_predictions"):
            return []
        rows = connection.execute("""
            SELECT * FROM disruption_predictions
            ORDER BY id DESC
        """).fetchall()
        return [dict(row) for row in rows]
    finally:
        connection.close()


@app.post("/prescribe/{prediction_id}")
def prescribe_options(prediction_id: int):
    connection = get_db_connection()
    try:
        if not table_exists(connection, "supply_chain"):
            raise HTTPException(
                status_code=500,
                detail="Table 'supply_chain' does not exist."
            )
        if not table_exists(connection, "disruption_predictions"):
            raise HTTPException(
                status_code=500,
                detail="Table 'disruption_predictions' does not exist."
            )

        ensure_prediction_tables(connection)
        cursor = connection.cursor()

        # IMPORTANT: prediction.shipment_id stores supply_chain.order_id.
        row = cursor.execute("""
            SELECT
                dp.*,
                s.order_item_quantity,
                s.product_price,
                s.benefit_per_order
            FROM disruption_predictions dp
            JOIN supply_chain s
                ON dp.shipment_id = s.order_id
            WHERE dp.id = ?
            LIMIT 1
        """, (prediction_id,)).fetchone()

        if row is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Prediction not found or related "
                    "supply-chain record not found."
                )
            )

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

        optimization_problem = LpProblem(
            "SupplyPrescript_Decision",
            LpMinimize
        )

        decision_variables = {
            label: LpVariable(f"select_{label}", cat="Binary")
            for label in options
        }

        optimization_problem += lpSum(
            options[label]["cost"] * decision_variables[label]
            for label in options
        )

        optimization_problem += (
            lpSum(decision_variables[label] for label in options) == 1
        )

        optimization_problem += (
            lpSum(
                options[label]["cost"] * decision_variables[label]
                for label in options
            ) <= BUDGET
        )

        optimization_problem += (
            lpSum(
                options[label]["time_days"] * decision_variables[label]
                for label in options
            ) <= MAX_TIME
        )

        optimization_problem.solve()
        solver_status = LpStatus[optimization_problem.status]
        optimal_option = None

        if solver_status == "Optimal":
            for label in options:
                if decision_variables[label].value() == 1:
                    optimal_option = label
                    break

        saved_options = []

        for label, option in options.items():
            feasible = (
                option["cost"] <= BUDGET
                and option["time_days"] <= MAX_TIME
            )

            if not feasible:
                continue

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
            """, (
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
                "predicted_time_days": option["time_days"],
                "recommended": label == optimal_option
            })

        connection.commit()

        return {
            "prediction_id": prediction_id,
            "solver_status": solver_status,
            "budget": BUDGET,
            "max_time_days": MAX_TIME,
            "optimal_option": optimal_option,
            "options": saved_options
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prescription error: {error}"
        )
    finally:
        connection.close()


@app.get("/prescriptions")
def get_prescriptions():
    connection = get_db_connection()
    try:
        if not table_exists(connection, "prescriptions"):
            return []

        rows = connection.execute("""
            SELECT
                p.*,
                dp.shipment_id,
                dp.probability,
                dp.predicted_delay_days,
                dp.model_version
            FROM prescriptions p
            JOIN disruption_predictions dp
                ON p.prediction_id = dp.id
            ORDER BY p.id DESC
        """).fetchall()

        return [dict(row) for row in rows]
    finally:
        connection.close()


@app.post("/decisions/{prescription_id}/execute")
def execute_decision(
    prescription_id: int,
    user_id: str = "manager_01"
):
    connection = get_db_connection()
    try:
        if not table_exists(connection, "prescriptions"):
            raise HTTPException(
                status_code=500,
                detail="Table 'prescriptions' does not exist."
            )

        ensure_prediction_tables(connection)
        cursor = connection.cursor()

        prescription = cursor.execute("""
            SELECT * FROM prescriptions
            WHERE id = ?
        """, (prescription_id,)).fetchone()

        if prescription is None:
            raise HTTPException(
                status_code=404,
                detail="Prescription not found."
            )

        existing_decision = cursor.execute("""
            SELECT * FROM decisions
            WHERE prescription_id = ?
            LIMIT 1
        """, (prescription_id,)).fetchone()

        if existing_decision:
            return {
                "message": "Decision already executed",
                "decision_id": existing_decision["id"],
                "prescription_id": prescription_id,
                "status": existing_decision["status"],
                "action_type": prescription["action_type"],
                "user_id": existing_decision["user_id"]
            }

        cursor.execute("""
            INSERT INTO decisions
            (prescription_id, user_id, status)
            VALUES (?, ?, ?)
        """, (
            prescription_id,
            user_id,
            "executed"
        ))

        connection.commit()
        decision_id = cursor.lastrowid

        return {
            "message": "Decision executed successfully",
            "decision_id": decision_id,
            "prescription_id": prescription_id,
            "action_type": prescription["action_type"],
            "predicted_cost": prescription["predicted_cost"],
            "predicted_time_days": prescription["predicted_time_days"],
            "user_id": user_id,
            "status": "executed"
        }

    except HTTPException:
        raise
    except sqlite3.Error as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error}"
        )
    finally:
        connection.close()


@app.get("/decisions")
def get_decisions():
    connection = get_db_connection()
    try:
        if not table_exists(connection, "decisions"):
            return []

        rows = connection.execute("""
            SELECT
                d.id AS decision_id,
                d.user_id,
                d.status,
                p.id AS prescription_id,
                p.action_type,
                p.option_label,
                p.predicted_cost,
                p.predicted_time_days,
                dp.shipment_id,
                dp.probability,
                dp.predicted_delay_days,
                dp.model_version
            FROM decisions d
            JOIN prescriptions p
                ON d.prescription_id = p.id
            JOIN disruption_predictions dp
                ON p.prediction_id = dp.id
            ORDER BY d.id DESC
        """).fetchall()

        return [dict(row) for row in rows]

    except sqlite3.Error as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error}"
        )
    finally:
        connection.close()


@app.get("/analytics/decision-roi")
def decision_roi():
    connection = get_db_connection()
    try:
        if not table_exists(connection, "outcomes"):
            return {
                "message": "Outcomes table does not exist",
                "total_decisions": 0,
                "percent_within_10_percent": 0,
                "average_variance_cost": 0,
                "breakdown_by_action_type": {}
            }

        rows = connection.execute("""
            SELECT
                o.*,
                p.action_type,
                p.predicted_cost,
                p.predicted_time_days,
                d.user_id,
                d.status
            FROM outcomes o
            JOIN decisions d
                ON o.decision_id = d.id
            JOIN prescriptions p
                ON d.prescription_id = p.id
            ORDER BY o.id DESC
        """).fetchall()

        if not rows:
            return {
                "message": "No outcomes recorded yet",
                "total_decisions": 0,
                "percent_within_10_percent": 0,
                "average_variance_cost": 0,
                "breakdown_by_action_type": {}
            }

        total = len(rows)
        within_10_percent = 0
        total_variance_cost = 0
        by_action_type = {}

        for row in rows:
            predicted_cost = row["predicted_cost"] or 0
            variance_cost = row["variance_cost"] or 0

            variance_pct = (
                abs(variance_cost) / predicted_cost
                if predicted_cost
                else 0
            )

            if variance_pct <= 0.10:
                within_10_percent += 1

            total_variance_cost += variance_cost
            action = row["action_type"]

            if action not in by_action_type:
                by_action_type[action] = {
                    "count": 0,
                    "total_variance_cost": 0
                }

            by_action_type[action]["count"] += 1
            by_action_type[action]["total_variance_cost"] += variance_cost

        for action in by_action_type:
            count = by_action_type[action]["count"]
            total_action_variance = (
                by_action_type[action]["total_variance_cost"]
            )
            by_action_type[action]["avg_variance_cost"] = round(
                total_action_variance / count,
                2
            )

        return {
            "total_decisions": total,
            "percent_within_10_percent": round(
                (within_10_percent / total) * 100,
                1
            ),
            "average_variance_cost": round(
                total_variance_cost / total,
                2
            ),
            "breakdown_by_action_type": by_action_type
        }

    except sqlite3.Error as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error}"
        )
    finally:
        connection.close()


@app.on_event("startup")
def startup_message():
    print()
    print("=" * 60)
    print("🚀 SupplyPrescript API Started")
    print("=" * 60)
    print(f"📁 Project Root: {PROJECT_ROOT}")
    print(f"🗄️ Database: {DATABASE_PATH}")
    print(f"🤖 Model Loaded: {xgb_model is not None}")
    print(f"📊 Feature Columns Loaded: {feature_columns is not None}")
    print("=" * 60)
    print()