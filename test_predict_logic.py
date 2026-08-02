import pickle
import pandas as pd
import sqlite3

conn = sqlite3.connect("database/supply_chain.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

with open("models/feature_columns.pkl", "rb") as f:
    feature_columns = pickle.load(f)
with open("models/xgboost_model.pkl", "rb") as f:
    xgb_model = pickle.load(f)

columns_to_drop = [
    "late_delivery_risk", "customer_fname", "customer_lname",
    "customer_street", "product_image", "order_id", "customer_id",
    "order_customer_id", "order_item_id", "product_card_id"
]

cursor.execute("SELECT id, order_id FROM shipments LIMIT 10")
shipments = cursor.fetchall()

for s in shipments:
    cursor.execute("SELECT * FROM supply_chain WHERE order_id = ? LIMIT 1", (s["order_id"],))
    raw_row = cursor.fetchone()
    if raw_row is None:
        continue
    raw_dict = dict(raw_row)
    for col in columns_to_drop:
        raw_dict.pop(col, None)

    df_row = pd.DataFrame([raw_dict])
    df_encoded = pd.get_dummies(
        df_row,
        columns=df_row.select_dtypes(include=["object", "string"]).columns,
        drop_first=True
    )
    df_aligned = df_encoded.reindex(columns=feature_columns, fill_value=0)
    prob = xgb_model.predict_proba(df_aligned)[0][1]
    print(f"shipment id {s['id']}, order_id {s['order_id']}: probability = {round(prob, 4)}")

# Check base rate in training data
cursor.execute("SELECT AVG(late_delivery_risk) FROM supply_chain")
base_rate = cursor.fetchone()[0]
print("\nBase rate of late_delivery_risk in supply_chain:", round(base_rate, 4))

conn.close()