from datetime import datetime
import os


def run_data_quality_checks(df):
    """
    Runs data quality checks and saves a report.
    Returns True if all checks pass, otherwise False.
    """

    report = []

    report.append("=" * 50)
    report.append("SUPPLY CHAIN DATA QUALITY REPORT")
    report.append("=" * 50)
    report.append(f"Generated : {datetime.now()}")
    report.append("")

    report.append(f"Rows                  : {df.shape[0]}")
    report.append(f"Columns               : {df.shape[1]}")

    duplicate_rows = df.duplicated().sum()
    report.append(f"Duplicate Rows        : {duplicate_rows}")

    missing_values = df.isnull().sum().sum()
    report.append(f"Missing Values        : {missing_values}")

    invalid_order_dates = df["order_date_dateorders"].isna().sum()
    report.append(f"Invalid Order Dates   : {invalid_order_dates}")

    invalid_shipping_dates = df["shipping_date_dateorders"].isna().sum()
    report.append(f"Invalid Shipping Dates: {invalid_shipping_dates}")

    negative_sales = (df["sales"] < 0).sum()
    report.append(f"Negative Sales        : {negative_sales}")

    negative_price = (df["product_price"] < 0).sum()
    report.append(f"Negative Prices       : {negative_price}")

    negative_quantity = (df["order_item_quantity"] < 0).sum()
    report.append(f"Negative Quantity     : {negative_quantity}")

    passed = (
        duplicate_rows == 0
        and missing_values == 0
        and invalid_order_dates == 0
        and invalid_shipping_dates == 0
        and negative_price == 0
        and negative_quantity == 0
    )

    report.append("")
    report.append("=" * 50)
    report.append(f"PIPELINE STATUS : {'PASSED' if passed else 'FAILED'}")
    report.append("=" * 50)

    for line in report:
        print(line)

    os.makedirs("../reports", exist_ok=True)

    with open("../reports/data_quality_report.txt", "w") as f:
        for line in report:
            f.write(line + "\n")

    print("\nReport saved to reports/data_quality_report.txt")

    return passed