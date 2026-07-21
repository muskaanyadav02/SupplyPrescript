from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)


def evaluate_model(model, X_test, y_test, verbose: bool = True) -> dict:
    y_pred = model.predict(X_test)

    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred),
        "recall": recall_score(y_test, y_pred),
        "f1": f1_score(y_test, y_pred),
        "roc_auc": roc_auc_score(y_test, y_pred),
    }

    if verbose:
        print("Accuracy :", metrics["accuracy"])
        print("Precision:", metrics["precision"])
        print("Recall   :", metrics["recall"])
        print("F1 Score :", metrics["f1"])
        print("ROC AUC  :", metrics["roc_auc"])

        print("\nClassification Report:\n")
        print(classification_report(y_test, y_pred))

        print("\nConfusion Matrix:\n")
        print(confusion_matrix(y_test, y_pred))

    return metrics