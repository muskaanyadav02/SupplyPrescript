import pandas as pd


def transform_data(df):
    """
    Clean and transform the raw dataset.
    """

    df = df.copy()

    columns_to_drop = [
        "Product Description",
        "Order Zipcode"
    ]

    df.drop(columns=columns_to_drop, inplace=True)

    df["Customer Lname"] = df["Customer Lname"].fillna("Unknown")

    median_zip = df["Customer Zipcode"].median()
    df["Customer Zipcode"] = df["Customer Zipcode"].fillna(median_zip)

    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
        .str.replace("(", "", regex=False)
        .str.replace(")", "", regex=False)
    )

    df["order_date_dateorders"] = pd.to_datetime(
        df["order_date_dateorders"],
        errors="coerce"
    )

    df["shipping_date_dateorders"] = pd.to_datetime(
        df["shipping_date_dateorders"],
        errors="coerce"
    )

    int_columns = df.select_dtypes(include=["int64"]).columns

    for col in int_columns:
        df[col] = pd.to_numeric(df[col], downcast="integer")

    float_columns = df.select_dtypes(include=["float64"]).columns

    for col in float_columns:
        df[col] = pd.to_numeric(df[col], downcast="float")

    for col in df.select_dtypes(include="object").columns:
        if df[col].nunique() < 100:
            df[col] = df[col].astype("category")

    print("Data transformed successfully.")
    print(f"Shape: {df.shape}")

    return df