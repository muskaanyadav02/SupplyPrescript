#  SupplyPrescript Dashboard – Project Report

##  Developer

**Name:** Rahul Idiga

**Role:** Dashboard & Documentation

**Project:** SupplyPrescript – Supply Chain Analytics Dashboard

**Technology:** React.js | Vite | Recharts | JavaScript | Papa Parse | GitHub

---

#  Project Overview

SupplyPrescript Dashboard is a web-based Supply Chain Analytics Dashboard developed using React.js to monitor and visualize shipment performance, delivery status, sales, and logistics insights.

The main objective of this dashboard is to provide a clean, interactive, and user-friendly interface for viewing important supply chain metrics. The dashboard enables users to analyze shipment information through KPI cards, tables, and charts.

---

#  Objectives

The objectives of this project are:

- Build a responsive dashboard using React.js
- Display important supply chain KPIs
- Visualize shipment data using charts
- Provide shipment history in a structured table
- Improve decision-making through data visualization
- Prepare the dashboard for future backend and machine learning integration

---

# 🛠 Technologies Used

| Technology | Purpose |
|------------|---------|
| React.js | Frontend Development |
| Vite | React Build Tool |
| JavaScript (ES6) | Application Logic |
| Recharts | Data Visualization |
| Papa Parse | CSV File Parsing |
| CSS / Tailwind CSS | UI Styling |
| Git | Version Control |
| GitHub | Source Code Management |

---

#  Project Structure

```
frontend
│
├── public
│   ├── clean_supply_chain.csv
│   └── dashboard_sample.csv
│
├── src
│   ├── Components
│   │     ├── KpiCard.jsx
│   │     ├── ShipmentTable.jsx
│   │     └── SearchBar.jsx
│   │
│   ├── charts
│   │     ├── LineChartComponent.jsx
│   │     ├── BarChartComponent.jsx
│   │     └── PieChartComponent.jsx
│   │
│   ├── data
│   │     └── loadSupplyChainData.js
│   │
│   ├── Sidebar.jsx
│   ├── Navbar.jsx
│   ├── Layout.jsx
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

---

#  Features Implemented

## 1. Sidebar Navigation

Implemented a responsive sidebar for navigating different dashboard sections.

Sections include:

- Dashboard
- Home
- Analytics
- Users
- Settings

---

## 2. Navbar

Created a simple top navigation bar containing:

- User Profile
- Dashboard Header

---

## 3. Search Bar

Implemented a search component for future shipment filtering functionality.

---

## 4. KPI Cards

Developed four KPI cards displaying important business metrics.

Displayed Metrics:

-  Total Orders
-  Late Deliveries
-  Total Sales
-  Average Shipping Days

These KPIs are calculated dynamically from the dataset.

---

## 5. Shipment History Table

Developed a shipment history table displaying:

- Order ID
- Product Name
- Customer Name
- Delivery Status
- Shipping Mode
- Sales Amount

The table is designed to display real data from the CSV dataset.

---

## 6. Line Chart

Implemented a Line Chart using Recharts to visualize shipping trends.

Purpose:

- Analyze shipment performance over time.
- Display shipping day distribution.

---

## 7. Bar Chart

Implemented a Bar Chart showing product category distribution.

Purpose:

- Identify top-performing product categories.
- Compare shipment counts across categories.

---

## 8. Pie Chart

Implemented a Pie Chart to visualize delivery status distribution.

Categories include:

- Advance Shipping
- Late Delivery
- Shipping Cancelled

---

#  Dataset Integration

Initially, dummy data was used to design the dashboard.

Later, the dashboard was integrated with a real Supply Chain CSV dataset.

Original Dataset Size:

- Approximately **85 MB**

Since loading the complete dataset in the browser affected performance during development, a **sample dataset** (`dashboard_sample.csv`) was created for frontend visualization while preserving the same structure as the original dataset.

CSV parsing was implemented using **Papa Parse**.

---

#  Dashboard Workflow

```
CSV Dataset
      │
      ▼
Papa Parse
      │
      ▼
React State
      │
      ▼
KPI Cards
Shipment Table
Charts
Dashboard UI
```

---

#  UI Design

The dashboard follows a clean and modern design.

Design Highlights:

- Responsive Layout
- White Cards
- Blue Theme
- Rounded Components
- Interactive Charts
- Professional Dashboard Structure

---

#  Challenges Faced

During development, several challenges were encountered:

### Large Dataset Loading

The original dataset (~85 MB) caused slow loading times in the browser.

**Solution**

Created a lightweight sample dataset for frontend visualization.

---

### CSV Integration

Reading CSV data directly into React required additional parsing.

**Solution**

Integrated Papa Parse to load and parse CSV files efficiently.

---

### Chart Integration

Initially, charts displayed dummy values.

**Solution**

Updated chart components to consume parsed CSV data.

---

### UI Alignment

Maintaining consistent spacing and responsive layouts required several refinements.

**Solution**

Organized components into reusable React modules and improved layout structure.

---

#  Future Enhancements

The current dashboard is prepared for future improvements such as:

- Backend API Integration
- Database Connectivity
- Authentication
- Live Dashboard Updates
- Machine Learning Predictions
- Supplier Recommendation Engine
- Advanced Search and Filters
- Export Dashboard Reports

---

#  Learning Outcomes

Through this project, the following skills were strengthened:

- React Component Architecture
- State Management using React Hooks
- CSV Data Processing
- Data Visualization using Recharts
- Git & GitHub Workflow
- Dashboard UI Design
- Responsive Frontend Development

---

# Project Status

Current Status:

- Dashboard UI Completed
- KPI Cards Completed
- Shipment Table Completed
- Search Bar Completed
- Line Chart Completed
- Bar Chart Completed
- Pie Chart Completed
- CSV Integration Completed
- GitHub Repository Updated
- Pull Request Submitted

---

#  Conclusion

The SupplyPrescript Dashboard successfully demonstrates how supply chain information can be visualized using modern frontend technologies.

The project provides an intuitive interface for monitoring shipments, analyzing business metrics, and presenting operational insights. The modular architecture makes it ready for future backend integration and machine learning features.

This project enhanced practical experience in React development, dashboard design, Git collaboration, and real-world data visualization.

---

##  Developed By

**Rahul Idiga**
