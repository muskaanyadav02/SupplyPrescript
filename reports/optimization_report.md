# SupplyPrescript – Optimization Engine Report

## Overview

The Optimization Engine is designed to identify the most suitable orders for processing by balancing multiple business objectives. Instead of selecting orders based on a single criterion, the optimizer considers delivery performance, business profitability, and operational constraints to generate an optimized list of orders.

The optimization module has been implemented using the PuLP linear programming library and is integrated into the project's modular source code structure.

---

# Objective

The primary objective of the optimization engine is to:

- Minimize average shipping time.
- Minimize late delivery risk.
- Maximize business profit (Benefit Per Order).

The optimization model selects the best **100 orders** from the complete dataset while satisfying predefined business constraints.

---

# Optimization Technique

- Optimization Library: PuLP
- Optimization Type: Binary Integer Linear Programming
- Decision Variable: Binary (0 = Not Selected, 1 = Selected)

Each order is represented by a binary decision variable indicating whether it is selected by the optimization model.

---

# Objective Function

The optimization objective combines three business goals:

- Reduce shipping time.
- Reduce delivery risk.
- Increase business profit.

The implemented objective function is:

```
Minimize:

(2 × Shipping Days)
+ (10 × Predicted/Delivery Risk)
− (0.05 × Benefit Per Order)
```

This formulation encourages the optimizer to choose orders that can be delivered quickly, have a lower delivery risk, and provide higher business value.

---

# Business Constraints

The optimization model includes the following constraints:

### 1. Fixed Order Selection

Exactly **100 orders** must be selected.

```
Selected Orders = 100
```

---

### 2. Same Day Shipment Limit

To avoid excessive shipping costs, the optimizer limits Same Day shipments.

```
Maximum Same Day Orders = 20
```

---

### 3. High Risk Order Limit

To reduce delivery failures, only a limited number of high-risk orders can be selected.

```
Maximum High Risk Orders = 30
```

---

### 4. High Profit Requirement

To improve business value, the optimizer must include profitable orders.

```
Minimum High Profit Orders = 40
```

High-profit orders are determined using the median value of `benefit_per_order`.

---

# Dataset

Dataset Used:

```
clean_supply_chain.csv
```

Dataset Size:

```
180,519 Orders
```

Selected Orders:

```
100 Orders
```

---

# Optimization Results

| Metric | Before Optimization | After Optimization |
|---------|--------------------:|-------------------:|
| Total Orders | 180519 | 100 |
| Average Shipping Days | 3.50 | 2.54 |
| Average Late Delivery Risk | 0.55 | 0.14 |
| Average Benefit Per Order | 21.97 | 567.28 |

---

# Performance Summary

The optimization engine achieved the following improvements:

- Reduced average shipping time from **3.50** days to **2.54** days.
- Reduced average late delivery risk from **0.55** to **0.14**.
- Increased average benefit per order from **21.97** to **567.28**.
- Selected the top **100** orders satisfying all business constraints.

---

# Output Files

The optimization results are stored in:

```
reports/
    optimized_orders.csv
```

The output contains important fields such as:

- Order ID
- Customer City
- Customer State
- Category
- Product Name
- Benefit Per Order
- Shipping Days
- Shipping Mode
- Late Delivery Risk
- Delivery Status
- Order Status

---

# Project Structure

```
src/
└── optimization/
    ├── optimize.py
    ├── objective.py
    └── constraints.py
```

### optimize.py

- Creates the optimization model.
- Defines binary decision variables.
- Calls the objective and constraint modules.
- Solves the optimization problem.
- Returns the optimized order list.

### objective.py

Defines the optimization objective that balances:

- Shipping Time
- Delivery Risk
- Business Profit

### constraints.py

Implements business constraints including:

- Fixed number of selected orders.
- Shipment type limitation.
- High-risk order limitation.
- High-profit order requirement.

---

# Future Improvements

The optimization engine can be further enhanced by:

- Integrating ML-predicted delivery risk instead of using the existing risk column.
- Supporting dynamic business rules.
- Adding warehouse capacity constraints.
- Including inventory availability constraints.
- Optimizing transportation cost.
- Multi-objective optimization using weighted business priorities.

---

# Conclusion

The developed Optimization Engine successfully prioritizes orders by balancing delivery efficiency, delivery risk, and business profitability. The modular implementation improves maintainability and supports future enhancements, including integration with machine learning predictions and additional supply chain constraints.