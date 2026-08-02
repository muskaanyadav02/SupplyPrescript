import sqlite3

conn = sqlite3.connect("database/supply_chain.db")
cursor = conn.cursor()

cursor.executescript("""
CREATE TABLE IF NOT EXISTS shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    category_name TEXT,
    order_region TEXT,
    order_item_quantity INTEGER,
    product_price REAL,
    benefit_per_order REAL,
    days_for_shipment_scheduled INTEGER,
    status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS disruption_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shipment_id INTEGER REFERENCES shipments(id),
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    probability REAL,
    predicted_delay_days REAL,
    model_version TEXT
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prediction_id INTEGER REFERENCES disruption_predictions(id),
    option_label TEXT,
    action_type TEXT,
    predicted_cost REAL,
    predicted_time_days REAL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER UNIQUE REFERENCES prescriptions(id),
    user_id TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'executed'
);

CREATE TABLE IF NOT EXISTS outcomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    decision_id INTEGER REFERENCES decisions(id),
    actual_cost REAL,
    actual_time_days REAL,
    variance_cost REAL,
    variance_time REAL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_retrain_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    triggered_by TEXT,
    old_version TEXT,
    new_version TEXT,
    trigger_reason TEXT,
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

conn.commit()
print("Tables created successfully.")
conn.close()