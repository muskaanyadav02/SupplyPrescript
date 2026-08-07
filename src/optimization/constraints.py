from pulp import lpSum

def add_constraints(model, optimization_data, decision_vars):
    """
    Add optimization constraints.
    """

    # Select exactly 100 orders
    model += lpSum(
        decision_vars[i]
        for i in optimization_data.index
    ) == 100

    # Limit Same Day shipments
    model += lpSum(
        decision_vars[i]
        for i in optimization_data.index
        if optimization_data.loc[i, "shipping_mode"] == "Same Day"
    ) <= 20