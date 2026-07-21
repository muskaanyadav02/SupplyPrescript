import sqlite3

conn = sqlite3.connect("database/supply_chain.db")
cursor = conn.cursor()

# Pull a sample of 500 rows from the raw supply_chain table
cursor.execute("""
    SELECT
        order_id,
        category_name,
        order_region,
        order_item_quantity,
        product_price,
        benefit_per_order,
        days_for_shipment_scheduled
    FROM supply_chain
    LIMIT 500
""")

rows = cursor.fetchall()
print(f"Fetched {len(rows)} rows from supply_chain.")

# Insert them into the shipments table
cursor.executemany("""
    INSERT INTO shipments (
        order_id, category_name, order_region,
        order_item_quantity, product_price,
        benefit_per_order, days_for_shipment_scheduled
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
""", rows)

conn.commit()
print(f"Inserted {cursor.rowcount if cursor.rowcount != -1 else len(rows)} rows into shipments.")

conn.close()