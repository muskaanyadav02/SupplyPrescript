from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import sqlite3
import pickle
import pandas as pdfrom pulp import LpProblem, LpVariable, LpMinimize, lpSum, LpStatus

# -----------------------------
# Load ML Model
# -----------------------------
with open("models/xgboost_model.pkl", "rb") as f:
    xgb_model = pickle.load(f)

with open("models/feature_columns.pkl", "rb") as f:
    feature_columns = pickle.load(f)

app = FastAPI()


# -----------------------------
# Database Connection
# -----------------------------
def get_db_connection():

    if not DATABASE_PATH.exists():

        raise HTTPException(
            status_code=500,
            detail=(
                "Database file not found: "
                f"{DATABASE_PATH}"
            )
        )

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.row_factory = sqlite3.Row

    return connection


# ============================================================
# ROOT API
# ============================================================

@app.get("/")
def root():

    return {
        "message": "SupplyPrescript API is running",
        "status": "online",
        "project": "SupplyPrescript",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    database_status = DATABASE_PATH.exists()

    model_status = (
        xgb_model is not None
        and feature_columns is not None
    )

    return {
        "status": "healthy",
        "database": database_status,
        "ml_model": model_status
    }


# ============================================================
# DATABASE TABLES
# ============================================================

@app.get("/database/tables")
def get_database_tables():

    connection = get_db_connection()

    try:

        cursor = connection.cursor()

        cursor.execute("""
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
            ORDER BY name
        """)

        rows = cursor.fetchall()

        return {
            "tables": [
                row["name"]
                for row in rows
            ]
        }

    finally:

        connection.close()


# ============================================================
# ============================================================
# SHIPMENTS API
# ============================================================

@app.get("/shipments")
def get_shipments():

    connection = get_db_connection()

    try:
        cursor = connection.cursor()

        # The current database contains the supply_chain table,
        # not a separate shipments table.
        cursor.execute("""
            SELECT *
            FROM supply_chain
            LIMIT 20
        """)

        rows = cursor.fetchall()

        return [
            dict(row)
            for row in rows
        ]

    except sqlite3.Error as error:

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error}"
        )

    finally:
        connection.close()


# ============================================================
# DASHBOARD KPI API
# ============================================================

@app.get("/dashboard/kpis")
def dashboard_kpis():

    connection = get_db_connection()

    try:

        cursor = connection.cursor()

        # --------------------------------------------
        # Total shipments
        # --------------------------------------------

        cursor.execute("""
            SELECT COUNT(*)
            FROM shipments
        """)

        total_shipments = (
            cursor.fetchone()[0] or 0
        )


        # --------------------------------------------
        # Pending shipments
        # --------------------------------------------

        cursor.execute("""
            SELECT COUNT(*)
            FROM shipments
            WHERE LOWER(status) = 'pending'
        """)

        pending_shipments = (
            cursor.fetchone()[0] or 0
        )


        # --------------------------------------------
        # Average product price
        # --------------------------------------------

        cursor.execute("""
            SELECT AVG(product_price)
            FROM shipments
        """)

        average_price = (
            cursor.fetchone()[0] or 0
        )


        # --------------------------------------------
        # Total benefit / profit
        # --------------------------------------------

        cursor.execute("""
            SELECT SUM(benefit_per_order)
            FROM shipments
        """)

        total_profit = (
            cursor.fetchone()[0] or 0
        )


        return {

            "total_shipments": total_shipments,

            "pending_shipments": pending_shipments,

            "average_price": round(
                float(average_price),
                2
            ),

            "total_profit": round(
                float(total_profit),
                2
            )
        }

    except sqlite3.Error as error:

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error}"
        )

    finally:

        connection.close()

# ============================================================
# AI PREDICTION API
# ============================================================

@app.get("/predict/{shipment_id}")
def predict_delay(shipment_id: int):

    # --------------------------------------------------------
    # Check ML model
    # --------------------------------------------------------

    if xgb_model is None or feature_columns is None:

        raise HTTPException(
            status_code=500,
            detail=(
                "ML model is not available. "
                "Check models/xgboost_model.pkl "
                "and models/feature_columns.pkl"
            )
        )


    connection = get_db_connection()

    try:

        cursor = connection.cursor()


        # ----------------------------------------------------
        # Get shipment
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT *
            FROM shipments
            WHERE id = ?
            """,
            (shipment_id,)
        )

        shipment = cursor.fetchone()


        if shipment is None:

            raise HTTPException(
                status_code=404,
                detail="Shipment not found"
            )


        order_id = shipment["order_id"]


        # ----------------------------------------------------
        # Get original supply-chain data
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT *
            FROM supply_chain
            WHERE order_id = ?
            LIMIT 1
            """,
            (order_id,)
        )

        raw_row = cursor.fetchone()


        if raw_row is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Original supply chain data "
                    "not found for this shipment"
                )
            )


        raw_dict = dict(raw_row)


        # ----------------------------------------------------
        # Remove columns that were not used by the model
        # ----------------------------------------------------

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


        for column in columns_to_drop:

            raw_dict.pop(
                column,
                None
            )


        # ----------------------------------------------------
        # Convert row into DataFrame
        # ----------------------------------------------------

        dataframe = pd.DataFrame(
            [raw_dict]
        )


        # ----------------------------------------------------
        # One-hot encode categorical columns
        # ----------------------------------------------------

        categorical_columns = (
            dataframe
            .select_dtypes(
                include=[
                    "object",
                    "string"
                ]
            )
            .columns
        )


        if len(categorical_columns) > 0:

            dataframe = pd.get_dummies(
                dataframe,
                columns=categorical_columns,
                drop_first=True
            )


        # ----------------------------------------------------
        # Match the exact training columns
        # ----------------------------------------------------

        dataframe = dataframe.reindex(
            columns=feature_columns,
            fill_value=0
        )


        # ----------------------------------------------------
        # XGBoost prediction
        # ----------------------------------------------------

        probability = float(
            xgb_model
            .predict_proba(dataframe)[0][1]
        )


        # ----------------------------------------------------
        # Convert probability into risk level
        # ----------------------------------------------------

        if probability >= 0.70:

            risk_level = "High"

        elif probability >= 0.40:

            risk_level = "Medium"

        else:

            risk_level = "Low"


        # ----------------------------------------------------
        # Estimated delay
        #
        # IMPORTANT:
        # The current ML model predicts late-delivery risk.
        # It does not directly predict exact delay duration.
        #
        # Therefore this remains an estimated value.
        # ----------------------------------------------------

        predicted_delay_days = round(
            7 + (probability * 7),
            1
        )


        model_version = "xgboost_v1"


        # ----------------------------------------------------
        # Save prediction
        # ----------------------------------------------------

        cursor.execute(
            """
            INSERT INTO disruption_predictions
            (
                shipment_id,
                probability,
                predicted_delay_days,
                model_version
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                shipment_id,
                probability,
                predicted_delay_days,
                model_version
            )
        )


        connection.commit()


        prediction_id = (
            cursor.lastrowid
        )


        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return {

            "prediction_id":
                prediction_id,

            "shipment_id":
                shipment_id,

            "probability":
                round(
                    probability,
                    3
                ),

            "risk_level":
                risk_level,

            "predicted_delay_days":
                predicted_delay_days,

            "model_version":
                model_version
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


# ============================================================
# PRESCRIPTIVE RECOMMENDATION API
# ============================================================

@app.post("/prescribe/{prediction_id}")
def prescribe_options(
    prediction_id: int
):

    connection = get_db_connection()

    try:

        cursor = connection.cursor()


        # ----------------------------------------------------
        # Get prediction + shipment information
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT
                dp.*,
                s.order_item_quantity,
                s.product_price,
                s.benefit_per_order

            FROM disruption_predictions dp

            JOIN shipments s
                ON dp.shipment_id = s.id

            WHERE dp.id = ?
            """,
            (prediction_id,)
        )


        row = cursor.fetchone()


        if row is None:

            raise HTTPException(
                status_code=404,
                detail="Prediction not found"
            )


        # ----------------------------------------------------
        # Input values
        # ----------------------------------------------------

        quantity = (
            row["order_item_quantity"]
            or 1
        )

        price = (
            row["product_price"]
            or 0
        )

        benefit = (
            row["benefit_per_order"]
            or 0
        )

        delay_days = (
            row["predicted_delay_days"]
            or 1
        )


        # ----------------------------------------------------
        # Business constraints
        # ----------------------------------------------------

        BUDGET = 20000

        MAX_TIME = 21


        # ----------------------------------------------------
        # Candidate recommendations
        # ----------------------------------------------------

        options = {

            "A": {

                "action":
                    "Air Freight",

                "cost":
                    round(
                        price
                        * quantity
                        * 0.15,
                        2
                    ),

                "time_days":
                    2
            },


            "B": {

                "action":
                    "Secondary Supplier",

                "cost":
                    round(
                        price
                        * quantity
                        * 1.10,
                        2
                    ),

                "time_days":
                    5
            },


            "C": {

                "action":
                    "Delay Launch",

                "cost":
                    round(
                        abs(benefit)
                        * delay_days
                        * 0.02,
                        2
                    ),

                "time_days":
                    delay_days
            }
        }


        # ----------------------------------------------------
        # PuLP Optimization
        # ----------------------------------------------------

        optimization_problem = LpProblem(
            "SupplyPrescript_Decision",
            LpMinimize
        )


        # Binary variable:
        #
        # 1 = select option
        # 0 = don't select option

        decision_variables = {

            label: LpVariable(
                f"select_{label}",
                cat="Binary"
            )

            for label in options
        }


        # ----------------------------------------------------
        # Objective:
        # Minimize cost
        # ----------------------------------------------------

        optimization_problem += lpSum(

            options[label]["cost"]
            * decision_variables[label]

            for label in options
        )


        # ----------------------------------------------------
        # Exactly ONE recommendation
        # ----------------------------------------------------

        optimization_problem += (

            lpSum(
                decision_variables[label]
                for label in options
            )

            == 1
        )


        # ----------------------------------------------------
        # Budget constraint
        # ----------------------------------------------------

        optimization_problem += (

            lpSum(
                options[label]["cost"]
                * decision_variables[label]

                for label in options
            )

            <= BUDGET
        )


        # ----------------------------------------------------
        # Maximum time constraint
        # ----------------------------------------------------

        optimization_problem += (

            lpSum(
                options[label]["time_days"]
                * decision_variables[label]

                for label in options
            )

            <= MAX_TIME
        )


        # ----------------------------------------------------
        # Solve optimization
        # ----------------------------------------------------

        optimization_problem.solve()


        solver_status = LpStatus[
            optimization_problem.status
        ]


        # ----------------------------------------------------
        # Determine optimal option
        # ----------------------------------------------------

        optimal_option = None


        if solver_status == "Optimal":

            for label in options:

                selected_value = (
                    decision_variables[label]
                    .value()
                )

                if selected_value == 1:

                    optimal_option = label

                    break


        # ----------------------------------------------------
        # Save feasible recommendations
        # ----------------------------------------------------

        saved_options = []


        for label, option in options.items():

            # Check business constraints

            feasible = (

                option["cost"]
                <= BUDGET

                and

                option["time_days"]
                <= MAX_TIME
            )


            if not feasible:

                continue


            # ------------------------------------------------
            # Save recommendation
            # ------------------------------------------------

            cursor.execute(
                """
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
                )
            )


            prescription_id = (
                cursor.lastrowid
            )


            saved_options.append({

                "prescription_id":
                    prescription_id,

                "option_label":
                    label,

                "action_type":
                    option["action"],

                "predicted_cost":
                    option["cost"],

                "predicted_time_days":
                    option["time_days"],

                "recommended":
                    label == optimal_option
            })


        connection.commit()


        # ----------------------------------------------------
        # Final response
        # ----------------------------------------------------

        return {

            "prediction_id":
                prediction_id,

            "solver_status":
                solver_status,

            "budget":
                BUDGET,

            "max_time_days":
                MAX_TIME,

            "optimal_option":
                optimal_option,

            "options":
                saved_options
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

# ============================================================
# EXECUTE DECISION
# ============================================================

@app.post("/decisions/{prescription_id}/execute")
def execute_decision(
    prescription_id: int,
    user_id: str = "manager_01"
):

    connection = get_db_connection()

    try:

        cursor = connection.cursor()


        # ----------------------------------------------------
        # Check prescription
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT *
            FROM prescriptions
            WHERE id = ?
            """,
            (prescription_id,)
        )

        prescription = cursor.fetchone()


        if prescription is None:

            raise HTTPException(
                status_code=404,
                detail="Prescription not found"
            )


        # ----------------------------------------------------
        # Idempotency check
        #
        # Prevents the same decision from being
        # executed multiple times.
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT *
            FROM decisions
            WHERE prescription_id = ?
            """,
            (prescription_id,)
        )

        existing_decision = (
            cursor.fetchone()
        )


        if existing_decision:

            return {

                "message":
                    "Decision already executed",

                "decision_id":
                    existing_decision["id"],

                "prescription_id":
                    prescription_id,

                "status":
                    existing_decision["status"],

                "action_type":
                    prescription["action_type"],

                "user_id":
                    existing_decision["user_id"]
            }


        # ----------------------------------------------------
        # Create new decision
        # ----------------------------------------------------

        cursor.execute(
            """
            INSERT INTO decisions
            (
                prescription_id,
                user_id,
                status
            )
            VALUES (?, ?, ?)
            """,
            (
                prescription_id,
                user_id,
                "executed"
            )
        )


        connection.commit()


        decision_id = (
            cursor.lastrowid
        )


        return {

            "message":
                "Decision executed successfully",

            "decision_id":
                decision_id,

            "prescription_id":
                prescription_id,

            "action_type":
                prescription["action_type"],

            "predicted_cost":
                prescription["predicted_cost"],

            "predicted_time_days":
                prescription["predicted_time_days"],

            "user_id":
                user_id,

            "status":
                "executed"
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


# ============================================================
# DECISIONS HISTORY
# ============================================================

@app.get("/decisions")
def get_decisions():

    connection = get_db_connection()

    try:

        cursor = connection.cursor()


        cursor.execute(
            """
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
            """
        )


        rows = cursor.fetchall()


        return [
            dict(row)
            for row in rows
        ]


    except sqlite3.Error as error:

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error}"
        )


    finally:

        connection.close()


# ============================================================
# PRESCRIPTIONS HISTORY
# ============================================================

@app.get("/prescriptions")
def get_prescriptions():

    connection = get_db_connection()

    try:

        cursor = connection.cursor()


        cursor.execute(
            """
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
            """
        )


        rows = cursor.fetchall()


        return [
            dict(row)
            for row in rows
        ]


    except sqlite3.Error as error:

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error}"
        )


    finally:

        connection.close()


# ============================================================
# PREDICTION HISTORY
# ============================================================

@app.get("/predictions")
def get_predictions():

    connection = get_db_connection()

    try:

        cursor = connection.cursor()


        cursor.execute(
            """
            SELECT *

            FROM disruption_predictions

            ORDER BY id DESC
            """
        )


        rows = cursor.fetchall()


        return [
            dict(row)
            for row in rows
        ]


    except sqlite3.Error as error:

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error}"
        )


    finally:

        connection.close()


# ============================================================
# DECISION ROI / ANALYTICS
# ============================================================

@app.get("/analytics/decision-roi")
def decision_roi():

    connection = get_db_connection()

    try:

        cursor = connection.cursor()


        # ----------------------------------------------------
        # Get outcomes connected to decisions
        # ----------------------------------------------------

        cursor.execute(
            """
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
            """
        )


        rows = cursor.fetchall()


        # ----------------------------------------------------
        # No outcome data
        # ----------------------------------------------------

        if not rows:

            return {

                "message":
                    "No outcomes recorded yet",

                "total_decisions":
                    0,

                "percent_within_10_percent":
                    0,

                "average_variance_cost":
                    0,

                "breakdown_by_action_type":
                    {}
            }


        # ----------------------------------------------------
        # Calculate analytics
        # ----------------------------------------------------

        total = len(rows)

        within_10_percent = 0

        total_variance_cost = 0

        by_action_type = {}


        for row in rows:

            predicted_cost = (
                row["predicted_cost"]
                or 0
            )

            variance_cost = (
                row["variance_cost"]
                or 0
            )


            # ----------------------------------------------
            # Variance percentage
            # ----------------------------------------------

            if predicted_cost:

                variance_pct = (
                    abs(variance_cost)
                    / predicted_cost
                )

            else:

                variance_pct = 0


            if variance_pct <= 0.10:

                within_10_percent += 1


            total_variance_cost += (
                variance_cost
            )


            # ----------------------------------------------
            # Action type breakdown
            # ----------------------------------------------

            action = (
                row["action_type"]
            )


            if action not in by_action_type:

                by_action_type[action] = {

                    "count": 0,

                    "total_variance_cost":
                        0
                }


            by_action_type[action][
                "count"
            ] += 1


            by_action_type[action][
                "total_variance_cost"
            ] += variance_cost


        # ----------------------------------------------------
        # Average variance for each action
        # ----------------------------------------------------

        for action in by_action_type:

            count = (
                by_action_type[action]["count"]
            )

            total_action_variance = (
                by_action_type[action][
                    "total_variance_cost"
                ]
            )


            by_action_type[action][
                "avg_variance_cost"
            ] = round(
                total_action_variance / count,
                2
            )


        # ----------------------------------------------------
        # Final analytics response
        # ----------------------------------------------------

        return {

            "total_decisions":
                total,

            "percent_within_10_percent":
                round(
                    (
                        within_10_percent
                        / total
                    ) * 100,
                    1
                ),

            "average_variance_cost":
                round(
                    total_variance_cost
                    / total,
                    2
                ),

            "breakdown_by_action_type":
                by_action_type
        }


    except sqlite3.Error as error:

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {error}"
        )


    finally:

        connection.close()


# ============================================================
# SERVER STARTUP MESSAGE
# ============================================================

@app.on_event("startup")
def startup_message():

    print()
    print("=" * 60)
    print("🚀 SupplyPrescript API Started")
    print("=" * 60)

    print(
        f"📁 Project Root: {PROJECT_ROOT}"
    )

    print(
        f"🗄️ Database: {DATABASE_PATH}"
    )

    print(
        f"🤖 Model Loaded: {xgb_model is not None}"
    )

    print(
        f"📊 Feature Columns Loaded: "
        f"{feature_columns is not None}"
    )

    print("=" * 60)
    print()

