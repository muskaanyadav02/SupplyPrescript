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
  const [data, setData] = useState([]);
  const [shipmentData, setShipmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  //------------------------------------------
  // Load CSV
  //------------------------------------------

  useEffect(() => {
    async function fetchCSV() {
      try {
        const csv = await loadSupplyChainData();
        setData(csv);
      } catch (err) {
        console.error(err);
      }
    }

    fetchCSV();
  }, []);

  //------------------------------------------
  // Load Shipment Data
  //------------------------------------------

  const loadShipments = async () => {
    try {
      setLoading(true);

      const response = await api.get("/shipments");

      console.log("========== API RESPONSE ==========");
      console.log(response);
      console.log("response.data =", response.data);
      console.log("Array ?", Array.isArray(response.data));
      console.log("==================================");

      let shipments = [];

      if (Array.isArray(response.data)) {
        shipments = response.data;
      } else if (
        response.data &&
        Array.isArray(response.data.data)
      ) {
        shipments = response.data.data;
      } else if (
        response.data &&
        Array.isArray(response.data.shipments)
      ) {
        shipments = response.data.shipments;
      } else if (
        response.data &&
        response.data.results &&
        Array.isArray(response.data.results)
      ) {
        shipments = response.data.results;
      }

      console.log("Shipment Count :", shipments.length);

      setShipmentData([...shipments]);
    } catch (err) {
      console.error("Shipment API Error", err);
      setShipmentData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  //------------------------------------------
  // KPI
  //------------------------------------------

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
              sum +
              Number(item.days_for_shipping_real || 0),
            0
          ) / data.length
        ).toFixed(1)
      : "0";

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar />

        <main className="p-8">

          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-2xl shadow-xl text-white p-8 mb-8">

            <div className="flex justify-between items-center">

              <div>

                <h1 className="text-4xl font-bold">
                  SupplyPrescript Dashboard
                </h1>

                <p className="mt-3 text-blue-100">
                  AI Powered Supply Chain Analytics
                </p>

              </div>

              <button
                onClick={loadShipments}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100"
              >
                Refresh Data
              </button>

            </div>

          </div>

          <SearchBar />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

            <KpiCard
              title="Orders"
              value={totalOrders.toLocaleString()}
            />

            <KpiCard
              title="Late Deliveries"
              value={lateDeliveries}
            />

            <KpiCard
              title="Sales"
              value={`$${Math.round(totalSales).toLocaleString()}`}
            />

            <KpiCard
              title="Average Shipping"
              value={`${averageShippingDays} Days`}
            />

          </div>

          <div className="mt-10 flex justify-between items-center">

            <div>

              <h2 className="text-3xl font-bold">
                Live Shipments
              </h2>

              <p className="text-gray-500">
                Real-time Shipment Information
              </p>

            </div>

            <div className="bg-blue-600 text-white px-5 py-3 rounded-full shadow font-semibold">
              {shipmentData.length} Shipments
            </div>

          </div>

          {/* DEBUG */}

          <div className="bg-white rounded-xl shadow p-5 mt-6 mb-6">

            <h2 className="font-bold text-lg mb-3">
              Debug Information
            </h2>

            <p>
              Loading :
              <strong> {loading ? "YES" : "NO"}</strong>
            </p>

            <p>
              Shipment Count :
              <strong> {shipmentData.length}</strong>
            </p>

            <pre className="bg-gray-100 rounded-lg p-3 text-xs mt-3 overflow-auto max-h-60">
              {JSON.stringify(shipmentData.slice(0, 2), null, 2)}
            </pre>

          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-10 text-center">
              Loading Shipment Data...
            </div>
          ) : (
            <ShipmentTable shipmentData={shipmentData} />
          )}

          <div className="mt-10">
            <LineChartComponent data={data} />
          </div>

          <div className="mt-10">
            <BarChartComponent data={data} />
          </div>

          <div className="mt-10 mb-10">
            <PieChartComponent data={data} />
          </div>

        </main>

      </div>

    </div>
  );
}

export default Layout;