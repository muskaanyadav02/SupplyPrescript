from pulp import lpSum

def create_objective(model, optimization_data, decision_vars):
    """
    Multi-objective optimization:
    - Minimize shipping days
    - Minimize late delivery risk
    - Maximize profit
    """

    model += lpSum(
        (
            2 * optimization_data.loc[i, "days_for_shipping_real"]
            + 10 * optimization_data.loc[i, "late_delivery_risk"]
            - 0.05 * optimization_data.loc[i, "benefit_per_order"]
        ) * decision_vars[i]
        for i in optimization_data.index
    )