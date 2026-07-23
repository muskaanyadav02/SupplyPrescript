import sqlite3
import random

def get_db_connection():
    conn = sqlite3.connect("database/supply_chain.db")
    conn.row_factory = sqlite3.Row
    return conn

def simulate_actual_outcome(predicted_cost, predicted_time_days):
    """
    Simulates a real-world outcome. Since we don't have real invoices,
    we perturb the prediction with realistic noise — actual costs tend
    to run somewhat over prediction, which is common in logistics.
    """
    actual_cost = round(predicted_cost * random.normalvariate(1.15, 0.1), 2)
    actual_time_days = round(predicted_time_days * random.normalvariate(1.05, 0.15), 1)
    return max(actual_cost, 0), max(actual_time_days, 0)

def evaluate_outcomes():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Find decisions that have been executed but don't have an outcome recorded yet
    cursor.execute("""
        SELECT d.id AS decision_id, p.predicted_cost, p.predicted_time_days
        FROM decisions d
        JOIN prescriptions p ON d.prescription_id = p.id
        LEFT JOIN outcomes o ON o.decision_id = d.id
        WHERE o.id IS NULL
    """)
    pending = cursor.fetchall()

    print(f"Found {len(pending)} decisions awaiting outcome evaluation.")

    for row in pending:
        actual_cost, actual_time = simulate_actual_outcome(row["predicted_cost"], row["predicted_time_days"])
        variance_cost = round(actual_cost - row["predicted_cost"], 2)
        variance_time = round(actual_time - row["predicted_time_days"], 2)

        cursor.execute("""
            INSERT INTO outcomes (decision_id, actual_cost, actual_time_days, variance_cost, variance_time)
            VALUES (?, ?, ?, ?, ?)
        """, (row["decision_id"], actual_cost, actual_time, variance_cost, variance_time))

        print(f"Decision {row['decision_id']}: predicted ${row['predicted_cost']} → actual ${actual_cost} (variance: ${variance_cost})")

    conn.commit()
    conn.close()
    print("Outcome evaluation complete.")

if __name__ == "__main__":
    evaluate_outcomes()