import { useEffect, useMemo, useState } from "react";

import {
  Package,
  Clock3,
  IndianRupee,
  Truck,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Search,
  X,
} from "lucide-react";

import { loadSupplyChainData } from "./data/loadSupplyChainData";
import api from "./api/api";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import SearchBar from "./Components/SearchBar";
import ShipmentTable from "./Components/shipmentTable";
import KpiCard from "./Components/KpiCard";

import LineChartComponent from "./charts/LineChartComponent";
import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";

import "./Layout.css";


function Layout() {

  // ============================================================
  // STATE
  // ============================================================

  // Complete CSV dataset
  const [data, setData] = useState([]);

  // Shipment records coming from FastAPI
  const [shipmentData, setShipmentData] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search input typed by user
  const [searchInput, setSearchInput] = useState("");

  // Actual search applied after clicking Search
  const [searchTerm, setSearchTerm] = useState("");


  // ============================================================
  // LOAD CSV DATA
  // ============================================================

  const loadDashboardData = async () => {

    try {

      setDashboardLoading(true);

      const csvData = await loadSupplyChainData();

      if (Array.isArray(csvData)) {

        console.log(
          "SUCCESS: Dashboard CSV loaded:",
          csvData.length,
          "records"
        );

        setData(csvData);

      } else {

        console.warn(
          "Dashboard CSV returned invalid data"
        );

        setData([]);

      }

    } catch (error) {

      console.error(
        "CSV loading error:",
        error
      );

      setData([]);

    } finally {

      setDashboardLoading(false);

    }

  };


  // ============================================================
  // LOAD SHIPMENT API DATA
  // ============================================================

  const loadShipments = async () => {

    try {

      setLoading(true);

      const response = await api.get("/shipments");

      if (
        response &&
        Array.isArray(response.data)
      ) {

        console.log(
          "SUCCESS: Shipment API loaded:",
          response.data.length,
          "records"
        );

        setShipmentData(response.data);

      } else {

        console.warn(
          "Shipment API returned invalid data"
        );

        setShipmentData([]);

      }

    } catch (error) {

      console.error(
        "Shipment API error:",
        error
      );

      setShipmentData([]);

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadDashboardData();
    loadShipments();

  }, []);


  // ============================================================
  // REFRESH DASHBOARD
  // ============================================================

  const handleRefresh = async () => {

    try {

      setRefreshing(true);

      await Promise.all([
        loadDashboardData(),
        loadShipments(),
      ]);

    } catch (error) {

      console.error(
        "Refresh error:",
        error
      );

    } finally {

      setRefreshing(false);

    }

  };


  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = () => {

    setSearchTerm(
      searchInput.trim()
    );

  };


  // ============================================================
  // CLEAR SEARCH
  // ============================================================

  const handleClearSearch = () => {

    setSearchInput("");
    setSearchTerm("");

  };


  // ============================================================
  // SEARCH WITH ENTER KEY
  // ============================================================

  const handleSearchKeyDown = (event) => {

    if (event.key === "Enter") {

      handleSearch();

    }

  };


  // ============================================================
  // KPI CALCULATIONS
  // ============================================================

  const totalOrders = Array.isArray(data)
    ? data.length
    : 0;


  // ============================================================
  // LATE DELIVERIES
  // ============================================================

  const lateDeliveries = Array.isArray(data)
    ? data.filter(
        (item) =>
          String(
            item?.late_delivery_risk ?? ""
          ) === "1"
      ).length
    : 0;


  // ============================================================
  // TOTAL SALES / REVENUE
  // ============================================================

  const totalSales = Array.isArray(data)

    ? data.reduce(
        (sum, item) => {

          const sales = Number(
            item?.sales ?? 0
          );

          return (
            sum +
            (
              Number.isFinite(sales)
                ? sales
                : 0
            )
          );

        },
        0
      )

    : 0;


  // ============================================================
  // AVERAGE SHIPPING DAYS
  // ============================================================

  const averageShippingDays =

    totalOrders > 0

      ? (
          data.reduce(
            (sum, item) => {

              const days = Number(
                item?.days_for_shipping_real ?? 0
              );

              return (
                sum +
                (
                  Number.isFinite(days)
                    ? days
                    : 0
                )
              );

            },
            0
          ) / totalOrders
        ).toFixed(1)

      : "0.0";


  // ============================================================
  // ON-TIME DELIVERIES
  // ============================================================

  const onTimeDeliveries = Math.max(
    totalOrders - lateDeliveries,
    0
  );


  // ============================================================
  // DELIVERY RATE
  // ============================================================

  const deliveryRate =

    totalOrders > 0

      ? (
          (
            onTimeDeliveries /
            totalOrders
          ) * 100
        ).toFixed(1)

      : "0.0";


  // ============================================================
  // FILTER SHIPMENT DATA
  // ============================================================

  const filteredShipments = useMemo(() => {

    if (!Array.isArray(shipmentData)) {

      return [];

    }


    // No search applied
    if (!searchTerm.trim()) {

      return shipmentData;

    }


    const search = searchTerm
      .toLowerCase()
      .trim();


    return shipmentData.filter(
      (shipment) => {

        if (!shipment) {

          return false;

        }


        return Object.values(
          shipment
        ).some(
          (value) =>
            String(
              value ?? ""
            )
              .toLowerCase()
              .includes(search)
        );

      }
    );

  }, [
    shipmentData,
    searchTerm
  ]);


  // ============================================================
  // SAFE CHART DATA
  // ============================================================

  const chartData = Array.isArray(data)
    ? data
    : [];


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="dashboard-shell">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="dashboard-sidebar">

        <Sidebar />

      </aside>



      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <main className="dashboard-main">


        {/* ====================================================
            NAVBAR
        ==================================================== */}

        <Navbar />



        {/* ====================================================
            PAGE CONTENT
        ==================================================== */}

        <div className="dashboard-content">


          {/* ==================================================
              DASHBOARD HEADER
          ================================================== */}

          <section className="dashboard-header">


            <div className="dashboard-title-area">


              {/* STATUS */}

              <div className="dashboard-badge">

                <span className="status-dot"></span>

                Live Supply Chain Intelligence

              </div>



              {/* MAIN TITLE */}

              <h1 className="dashboard-main-title">

                <span className="brand-title">
                  SupplyPrescript
                </span>

                <span className="dashboard-title">
                  {" "}Dashboard
                </span>

              </h1>



              <p className="dashboard-subtitle">

                AI-powered supply chain monitoring,
                prediction and decision intelligence.

              </p>


            </div>



            {/* ==================================================
                REFRESH BUTTON
            ================================================== */}

            <button
              className="refresh-button"
              onClick={handleRefresh}
              disabled={refreshing}
              type="button"
            >

              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "spin-icon"
                    : ""
                }
              />


              {refreshing
                ? "Refreshing..."
                : "Refresh Data"}

            </button>


          </section>



          {/* ==================================================
              SEARCH SECTION
          ================================================== */}

          <section className="search-section">


            <div className="search-wrapper">


              {/* SEARCH INPUT */}

              <div
                className="dashboard-search-box"
                onKeyDown={handleSearchKeyDown}
              >

                <Search
                  size={18}
                  className="search-icon"
                />


                <SearchBar
                  value={searchInput}
                  onChange={setSearchInput}
                />


                {/* CLEAR BUTTON */}

                {searchInput && (

                  <button
                    type="button"
                    className="clear-search-button"
                    onClick={handleClearSearch}
                    title="Clear search"
                  >

                    <X size={16} />

                  </button>

                )}


                {/* SEARCH BUTTON */}

                <button
                  type="button"
                  className="search-button"
                  onClick={handleSearch}
                >

                  <Search size={16} />

                  Search

                </button>


              </div>


            </div>



            {/* SEARCH INFORMATION */}

            <div className="search-info">


              <span>

                <Package size={16} />

                {filteredShipments.length}

                {" "}shipments

              </span>


              <span>

                {searchTerm

                  ? `Showing results for "${searchTerm}"`

                  : loading
                    ? "Loading API data..."
                    : "Updated live from API"}

              </span>


            </div>


          </section>



          {/* ==================================================
              KPI CARDS
          ================================================== */}

          <section className="kpi-grid">


            {/* TOTAL ORDERS */}

            <KpiCard
              title="Total Orders"
              value={
                totalOrders.toLocaleString()
              }
              icon={Package}
              color="kpi-blue"
            />



            {/* LATE DELIVERIES */}

            <KpiCard
              title="Late Deliveries"
              value={
                lateDeliveries.toLocaleString()
              }
              icon={AlertTriangle}
              color="kpi-red"
            />



            {/* TOTAL REVENUE */}

            <KpiCard
              title="Total Revenue"
              value={
                `₹${Math.round(
                  totalSales
                ).toLocaleString()}`
              }
              icon={IndianRupee}
              color="kpi-green"
            />



            {/* AVERAGE SHIPPING */}

            <KpiCard
              title="Avg Shipping Days"
              value={
                averageShippingDays
              }
              icon={Truck}
              color="kpi-purple"
            />


          </section>



          {/* ==================================================
              PERFORMANCE SUMMARY
          ================================================== */}

          <section className="summary-grid">


            {/* ON-TIME DELIVERY */}

            <div className="summary-card">

              <div className="summary-icon success">

                <CheckCircle2
                  size={22}
                />

              </div>


              <div>

                <span>
                  On-Time Delivery
                </span>

                <strong>
                  {deliveryRate}%
                </strong>

              </div>

            </div>



            {/* AVERAGE SHIPPING */}

            <div className="summary-card">

              <div className="summary-icon warning">

                <Clock3
                  size={22}
                />

              </div>


              <div>

                <span>
                  Average Shipping
                </span>

                <strong>

                  {averageShippingDays}

                  {" "}days

                </strong>

              </div>

            </div>



            {/* SHIPMENT RECORDS */}

            <div className="summary-card">

              <div className="summary-icon info">

                <TrendingUp
                  size={22}
                />

              </div>


              <div>

                <span>
                  Shipment Records
                </span>

                <strong>
                  {shipmentData.length}
                </strong>

              </div>

            </div>


          </section>



          {/* ==================================================
              SHIPMENT TABLE
          ================================================== */}

          <section className="dashboard-card">


            <div className="card-header">


              <div>

                <h2>
                  Shipment History
                </h2>

                <p>
                  Real-time shipment records
                  from the SupplyPrescript API
                </p>

              </div>


              <div className="live-badge">

                <span></span>

                LIVE

              </div>


            </div>



            {/* TABLE */}

            <div className="table-container">


              {loading ? (

                <div className="loading-state">

                  <RefreshCw
                    size={28}
                    className="spin-icon"
                  />

                  <p>
                    Loading shipment data...
                  </p>

                </div>


              ) : filteredShipments.length === 0 ? (

                <div className="empty-state">

                  <Package
                    size={40}
                  />

                  <h3>
                    No shipments found
                  </h3>

                  <p>
                    Try changing your search.
                  </p>

                </div>


              ) : (

                <ShipmentTable
                  data={filteredShipments}
                />

              )}


            </div>


          </section>



          {/* ==================================================
              CHARTS SECTION
          ================================================== */}

          <section className="charts-section">


            {/* ==================================================
                LINE CHART
            ================================================== */}

            <div className="chart-card large-chart">


              <div className="card-header">


                <div>

                  <h2>
                    Shipment Trend
                  </h2>

                  <p>
                    Average shipping days
                    by shipping mode
                  </p>

                </div>


                <div className="chart-status-badge">

                  Shipping Performance

                </div>


              </div>



              <div className="chart-container">


                {dashboardLoading ? (

                  <div className="loading-state">

                    <RefreshCw
                      size={28}
                      className="spin-icon"
                    />

                    <p>
                      Loading shipment trend...
                    </p>

                  </div>


                ) : chartData.length === 0 ? (

                  <div className="empty-state">

                    <TrendingUp
                      size={36}
                    />

                    <h3>
                      No chart data available
                    </h3>

                    <p>
                      Dashboard data could not
                      be loaded.
                    </p>

                  </div>


                ) : (

                  <LineChartComponent
                    data={chartData}
                  />

                )}


              </div>


            </div>



            {/* ==================================================
                BAR CHART
            ================================================== */}

            <div className="chart-card">


              <div className="card-header">


                <div>

                  <h2>
                    Supplier Performance
                  </h2>

                  <p>
                    Supplier delivery comparison
                  </p>

                </div>


              </div>



              <div className="chart-container">


                {dashboardLoading ? (

                  <div className="loading-state">

                    <RefreshCw
                      size={28}
                      className="spin-icon"
                    />

                    <p>
                      Loading supplier data...
                    </p>

                  </div>


                ) : chartData.length === 0 ? (

                  <div className="empty-state">

                    <Package
                      size={36}
                    />

                    <h3>
                      No supplier data
                    </h3>

                  </div>


                ) : (

                  <BarChartComponent
                    data={chartData}
                  />

                )}


              </div>


            </div>



            {/* ==================================================
                RECOMMENDATION OVERVIEW
            ================================================== */}

            <div className="chart-card recommendation-card">


              <div className="card-header">


                <div>

                  <h2>
                    Recommendation Overview
                  </h2>

                  <p>
                    Distribution of supply chain recommendations
                  </p>

                </div>


                <div className="ai-insights-badge">

                  AI Insights

                </div>


              </div>



              <div className="chart-container">


                {dashboardLoading ? (

                  <div className="loading-state">

                    <RefreshCw
                      size={28}
                      className="spin-icon"
                    />

                    <p>
                      Loading recommendation data...
                    </p>

                  </div>


                ) : chartData.length === 0 ? (

                  <div className="empty-state">

                    <TrendingUp
                      size={36}
                    />

                    <h3>
                      No recommendation data available
                    </h3>

                    <p>
                      Data will appear when
                      recommendations are available.
                    </p>

                  </div>


                ) : (

                  <PieChartComponent
                    data={chartData}
                  />

                )}


              </div>


            </div>


          </section>



          {/* ==================================================
              FOOTER
          ================================================== */}

          <footer className="dashboard-footer">


            <div>

              <strong>
                SupplyPrescript
              </strong>

              <span>
                AI Supply Chain Intelligence Platform
              </span>

            </div>


            <span>
              Data powered by Supply Chain Analytics
            </span>


          </footer>


        </div>

      </main>

    </div>

  );

}


export default Layout;