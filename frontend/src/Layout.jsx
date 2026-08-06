import { useEffect, useState } from "react";
import { loadSupplyChainData } from "./data/loadSupplyChainData";
import api from "./api/api";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import KpiCard from "./Components/KpiCard";
import ShipmentTable from "./Components/shipmentTable";
import SearchBar from "./Components/SearchBar";

import LineChartComponent from "./charts/LineChartComponent";
import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";

function Layout() {
  // CSV Data (used for charts & current KPIs)
  const [data, setData] = useState([]);

  // Backend Shipment Data
  const [shipmentData, setShipmentData] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Load CSV
  // -----------------------------
  useEffect(() => {
    async function getData() {
      try {
        const csvData = await loadSupplyChainData();
        setData(csvData);

        console.log("CSV Loaded:", csvData.length);
      } catch (err) {
        console.error("CSV Error:", err);
      }
    }

    getData();
  }, []);

  // -----------------------------
  // Load Shipments from Backend
  // -----------------------------
  useEffect(() => {
    async function getShipments() {
      try {
        console.log("Fetching shipments...");

        const response = await api.get("/shipments");

        console.log("Backend Shipments:");
        console.log(response.data);

        setShipmentData(response.data);
      } catch (error) {
        console.error("Error fetching shipments:", error);
      } finally {
        setLoading(false);
      }
    }

    getShipments();
  }, []);

  // -----------------------------
  // KPI Calculations (CSV for now)
  // -----------------------------
  const totalOrders = data.length;

  const lateDeliveries = data.filter(
    (item) => item.late_delivery_risk === "1"
  ).length;

  const totalSales = data.reduce(
    (sum, item) => sum + Number(item.sales || 0),
    0
  );

  const averageShippingDays =
    data.length > 0
      ? (
          data.reduce(
            (sum, item) =>
              sum + Number(item.days_for_shipping_real || 0),
            0
          ) / data.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Navbar />

        <main className="p-6">
          <h1 className="text-3xl font-bold">
            SupplyPrescript Dashboard 📦
          </h1>

          <p className="mt-2 text-gray-600">
            Monitor shipment performance and supply chain insights.
          </p>

          <div style={{ marginTop: "20px" }}>
            <SearchBar />
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid">
            <KpiCard
              title="Total Orders"
              value={totalOrders.toLocaleString()}
              icon="📦"
            />

            <KpiCard
              title="Late Deliveries"
              value={lateDeliveries.toLocaleString()}
              icon="⏰"
            />

            <KpiCard
              title="Total Sales"
              value={`$${Math.round(totalSales).toLocaleString()}`}
              icon="💰"
            />

            <KpiCard
              title="Avg Shipping Days"
              value={averageShippingDays}
              icon="🚚"
            />
          </div>

          {/* Shipment Table */}
          <div style={{ marginTop: "30px" }}>
            {loading ? (
              <h3>Loading Shipments...</h3>
            ) : (
              <ShipmentTable shipmentData={shipmentData} />
            )}
          </div>

          {/* Charts */}
          <div style={{ marginTop: "30px" }}>
            <LineChartComponent data={data} />
          </div>

          <div style={{ marginTop: "30px" }}>
            <BarChartComponent data={data} />
          </div>

          <div style={{ marginTop: "30px" }}>
            <PieChartComponent data={data} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;