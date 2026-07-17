import sqlite3
import os


def load_data(df, output_csv, database_path):
    """
    Save cleaned data as CSV and load it into SQLite.
    """

    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    os.makedirs(os.path.dirname(database_path), exist_ok=True)

    df.to_csv(output_csv, index=False)
    print(f"Cleaned CSV saved to: {output_csv}")

    conn = sqlite3.connect(database_path)

    df.to_sql(
        "supply_chain",
        conn,
        if_exists="replace",
        index=False
    )

    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM supply_chain")
    total_rows = cursor.fetchone()[0]

    print(f"Rows loaded into SQLite: {total_rows}")

    conn.close()

    print("Database connection closed.")