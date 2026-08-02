import sqlite3
import random

def get_db_connection():
    conn = sqlite3.connect("database/supply_chain.db")
    conn.row_factory = sqlite3.Row
    return conn

def simulate_actual_outcome(predicted_cost, predicted_time_days):
    actual_cost = round(predicted_cost * random.normalvariate(1.15, 0.1), 2)
    actual_time_days = round(predicted_time_days * random.normalvariate(1.05, 0.15), 1)
    return max(actual_cost, 0), max(actual_time_days, 0)

def evaluate_outcomes():
    conn = get_db_connection()
    cursor = conn.cursor()
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
        print(f"Decision {row['decision_id']}: predicted ${row['predicted_cost']} -> actual ${actual_cost} (variance: ${variance_cost})")

    conn.commit()
    conn.close()
    print("Outcome evaluation complete.")

def check_retrain_trigger():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT o.variance_cost, p.predicted_cost
        FROM outcomes o
        JOIN decisions d ON o.decision_id = d.id
        JOIN prescriptions p ON d.prescription_id = p.id
        ORDER BY o.recorded_at DESC
        LIMIT 20
    """)
    rows = cursor.fetchall()

    if not rows:
        conn.close()
        print("No outcomes yet - skipping retrain check.")
        return

    variance_pcts = [abs(r["variance_cost"]) / r["predicted_cost"] for r in rows if r["predicted_cost"]]
    avg_variance_pct = sum(variance_pcts) / len(variance_pcts) if variance_pcts else 0
    THRESHOLD = 0.20

    print(f"Average variance over last {len(rows)} outcomes: {round(avg_variance_pct * 100, 1)}%")

    if avg_variance_pct > THRESHOLD:
        cursor.execute("""
            INSERT INTO model_retrain_log (triggered_by, old_version, new_version, trigger_reason)
            VALUES (?, ?, ?, ?)
        """, ("evaluate_outcomes_job", "mock_v0", "mock_v0", f"Average cost variance {round(avg_variance_pct*100,1)}% exceeded {int(THRESHOLD*100)}% threshold"))
        conn.commit()
        print("Retrain trigger logged - model variance exceeded threshold.")
    else:
        print("Variance within acceptable range - no retrain needed.")

    conn.close()

if __name__ == "__main__":
    evaluate_outcomes()
    check_retrain_trigger()