from pulp import LpProblem, LpMinimize, LpVariable, LpStatus

from .objective import create_objective
from .constraints import add_constraints


def optimize_orders(optimization_data):
    """
    Run supply chain optimization and return selected orders.
    """

    # Create optimization model
    model = LpProblem("Supply_Chain_Optimization", LpMinimize)

    # Decision variables
    decision_vars = {
        i: LpVariable(f"Order_{i}", cat="Binary")
        for i in optimization_data.index
    }

    # Add objective
    create_objective(model, optimization_data, decision_vars)

    # Add constraints
    add_constraints(model, optimization_data, decision_vars)

    # Solve model
    model.solve()

    print("Status:", LpStatus[model.status])

    # Get selected orders
    selected_orders = optimization_data[
        [decision_vars[i].value() == 1 for i in optimization_data.index]
    ]

    print("Total Selected Orders:", len(selected_orders))

    return selected_orders