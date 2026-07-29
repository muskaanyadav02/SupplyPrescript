import { useEffect, useState } from "react";
import { loadSupplyChainData } from "./data/loadSupplyChainData";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import KpiCard from "./Components/KpiCard";
import ShipmentTable from "./Components/shipmentTable";
import SearchBar from "./Components/SearchBar";

import LineChartComponent from "./charts/LineChartComponent";
import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";

function Layout() {
  // React State
  const [data, setData] = useState([]);

  // Load CSV
  useEffect(() => {
    async function getData() {
      const csvData = await loadSupplyChainData();

      setData(csvData);

      console.log("========== CSV LOADED ==========");
      console.log("First Row:");
      console.log(csvData[0]);

      console.log("Column Names:");
      console.log(Object.keys(csvData[0]));

      console.log("Total Rows:", csvData.length);
      console.log("===============================");
    }

    getData();
  }, []);

  // KPI Calculations
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
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 min-h-screen">
        {/* Navbar */}
        <Navbar />

        <main className="p-6">
          {/* Heading */}
          <h1 className="text-3xl font-bold">
            SupplyPrescript Dashboard 📦
          </h1>

          <p className="mt-2 text-gray-600">
            Monitor shipment performance and supply chain insights.
          </p>

          {/* Search */}
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
            <ShipmentTable shipmentData={data.slice(0, 20)} />
          </div>

          {/* Line Chart */}
          <div style={{ marginTop: "30px" }}>
            <LineChartComponent data={data} />
          </div>

          {/* Bar Chart */}
          <div style={{ marginTop: "30px" }}>
            <BarChartComponent data={data} />
          </div>

          {/* Pie Chart */}
          <div style={{ marginTop: "30px" }}>
            <PieChartComponent data={data} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;