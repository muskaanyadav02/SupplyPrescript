import pandas as pd


def extract_data(file_path):
    """
    Read raw CSV file and return a DataFrame.
    """
    df = pd.read_csv(file_path, encoding="latin1")

    print("Data extracted successfully.")
    print(f"Shape: {df.shape}")

    return df