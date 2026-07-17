from src.preprocessing.extract import extract_data
from src.preprocessing.transform import transform_data
from src.preprocessing.load import load_data
from src.preprocessing.data_quality import run_data_quality_checks


def main():
    """
    Execute the complete ETL pipeline.
    """

    # File paths (relative to the project root)
    input_file = "data/raw/DataCoSupplyChainDataset.csv"
    output_file = "data/processed/clean_supply_chain.csv"
    database_file = "database/supply_chain.db"

    # -----------------------
    # Extract
    # -----------------------
    df = extract_data(input_file)

    # -----------------------
    # Transform
    # -----------------------
    df = transform_data(df)

    # -----------------------
    # Data Quality Checks
    # -----------------------
    passed = run_data_quality_checks(df)

    if not passed:
        print("Pipeline stopped because data quality checks failed.")
        return

    # -----------------------
    # Load
    # -----------------------
    load_data(df, output_file, database_file)

    print("\nETL Pipeline completed successfully!")


if __name__ == "__main__":
    main()