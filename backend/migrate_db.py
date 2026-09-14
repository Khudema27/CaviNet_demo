import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "cavinet.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

def add_column(table, column, definition):
    cursor.execute(f"PRAGMA table_info({table})")
    existing_columns = [row[1] for row in cursor.fetchall()]

    if column not in existing_columns:
        cursor.execute(
            f"ALTER TABLE {table} ADD COLUMN {column} {definition}"
        )
        print(f"Added: {table}.{column}")
    else:
        print(f"Already exists: {table}.{column}")


# Patient columns
add_column("patients", "email", "VARCHAR(255)")
add_column("patients", "phone", "VARCHAR(50)")
add_column("patients", "address", "VARCHAR(500)")
add_column("patients", "notes", "VARCHAR(2000)")

# Scan columns
add_column("scans", "job_id", "VARCHAR(100)")
add_column("scans", "decision_summary", "VARCHAR(2000)")
add_column("scans", "heatmap_url", "VARCHAR(1000)")

conn.commit()
conn.close()

print("\nDatabase migration completed successfully.")