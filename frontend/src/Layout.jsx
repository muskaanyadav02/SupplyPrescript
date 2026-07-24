import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";
import LineChartComponent from "./charts/LineChartComponent";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import KpiCard from "./Components/KpiCard";
import { dashboardStats } from "./dashboardData";

function Layout() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 min-h-screen">
        <Navbar />

        <main className="p-6">
          <h1 className="text-3xl font-bold">
            SupplyPrescript Dashboard 📦
          </h1>

          <p className="mt-2 text-gray-600">
            Monitor shipment performance and supply chain insights.
          </p>

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
        </main>
      </div>
    </div>
  );
}

export default Layout;