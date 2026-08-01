from pulp import lpSum

def create_objective(model, optimization_data, decision_vars):
    """
    Objective:
    Minimize shipping days and late delivery risk.
    """

    model += lpSum(
        (
            optimization_data.loc[i, "days_for_shipping_real"]
            + 10 * optimization_data.loc[i, "late_delivery_risk"]
        ) * decision_vars[i]
        for i in optimization_data.index
    )