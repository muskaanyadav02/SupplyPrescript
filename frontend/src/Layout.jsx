import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import KpiCard from "./Components/KpiCard";
import ShipmentTable from "./Components/shipmentTable";
import SearchBar from "./Components/SearchBar";
import LineChartComponent from "./charts/LineChartComponent";
import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";
import { dashboardStats } from "./dashboardData";

function Layout() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 min-h-screen">
        {/* Navbar */}
        <Navbar />

        <main className="p-6">
          {/* Dashboard Heading */}
          <h1 className="text-3xl font-bold">
            SupplyPrescript Dashboard 📦
          </h1>

          <p className="mt-2 text-gray-600">
            Monitor shipment performance and supply chain insights.
          </p>

          {/* Search Bar */}
          <div style={{ marginTop: "20px" }}>
            <SearchBar />
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid">
            {dashboardStats.map((item) => (
              <KpiCard
                key={item.id}
                title={item.title}
                value={item.value}
                icon={item.icon}
              />
            ))}
          </div>

          {/* Shipment Table */}
          <div style={{ marginTop: "30px" }}>
            <ShipmentTable />
          </div>

          {/* Line Chart */}
          <div style={{ marginTop: "30px" }}>
            <LineChartComponent />
          </div>

          {/* Bar Chart */}
          <div style={{ marginTop: "30px" }}>
            <BarChartComponent />
          </div>

          {/* Pie Chart */}
          <div style={{ marginTop: "30px" }}>
            <PieChartComponent />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;