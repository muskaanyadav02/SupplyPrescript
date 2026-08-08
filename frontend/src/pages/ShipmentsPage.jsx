import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Truck,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import api from "../api/api";

function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD SHIPMENTS
  // ============================================================

  const loadShipments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/shipments");

      if (Array.isArray(response.data)) {
        setShipments(response.data);
      } else {
        setShipments([]);
      }
    } catch (err) {
      console.error("Shipment loading error:", err);
      setError("Unable to load shipment data.");
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadShipments();
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredShipments = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return shipments;
    }

    return shipments.filter((shipment) =>
      Object.values(shipment || {}).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search)
      )
    );
  }, [shipments, searchTerm]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const totalShipments = shipments.length;

  const delayedShipments = shipments.filter((item) => {
    const risk = String(item?.late_delivery_risk ?? "");

    return risk === "1";
  }).length;

  const deliveredShipments = Math.max(
    totalShipments - delayedShipments,
    0
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: "800",
              color: "#0f172a",
            }}
          >
            Shipment Management
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            Monitor and search real-time shipment records.
          </p>
        </div>

        <button
          onClick={loadShipments}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "11px 18px",
            border: "none",
            borderRadius: "10px",
            background: "#2563eb",
            color: "#ffffff",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <RefreshCw
            size={17}
            className={loading ? "spin-icon" : ""}
          />

          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        {/* TOTAL */}

        <div
          style={{
            background: "#ffffff",
            padding: "22px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 5px 15px rgba(15,23,42,0.05)",
          }}
        >
          <Package size={25} color="#2563eb" />

          <p
            style={{
              color: "#64748b",
              marginBottom: "5px",
            }}
          >
            Total Shipments
          </p>

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
            }}
          >
            {totalShipments.toLocaleString()}
          </h2>
        </div>

        {/* DELIVERED */}

        <div
          style={{
            background: "#ffffff",
            padding: "22px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <CheckCircle2 size={25} color="#16a34a" />

          <p
            style={{
              color: "#64748b",
              marginBottom: "5px",
            }}
          >
            On-Time Shipments
          </p>

          <h2
            style={{
              margin: 0,
              color: "#16a34a",
            }}
          >
            {deliveredShipments.toLocaleString()}
          </h2>
        </div>

        {/* DELAYED */}

        <div
          style={{
            background: "#ffffff",
            padding: "22px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <AlertTriangle size={25} color="#dc2626" />

          <p
            style={{
              color: "#64748b",
              marginBottom: "5px",
            }}
          >
            Delayed Shipments
          </p>

          <h2
            style={{
              margin: 0,
              color: "#dc2626",
            }}
          >
            {delayedShipments.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          padding: "18px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            maxWidth: "500px",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
            }}
          />

          <input
            type="text"
            placeholder="Search shipment..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 15px 13px 42px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              outline: "none",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: "10px",
          }}
        >
          {error}
        </div>
      )}

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#0f172a",
            }}
          >
            Shipment Records
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Showing {filteredShipments.length} shipment records
          </p>
        </div>

        {loading ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <RefreshCw
              size={30}
              className="spin-icon"
            />

            <p>Loading shipment data...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <Truck size={40} />

            <p>No shipments found.</p>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  {Object.keys(
                    filteredShipments[0] || {}
                  ).map((key) => (
                    <th
                      key={key}
                      style={{
                        textAlign: "left",
                        padding: "14px",
                        fontSize: "12px",
                        color: "#475569",
                        borderBottom:
                          "1px solid #e2e8f0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {key.replaceAll("_", " ")}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredShipments.map(
                  (shipment, index) => (
                    <tr key={index}>
                      {Object.keys(
                        filteredShipments[0] || {}
                      ).map((key) => (
                        <td
                          key={key}
                          style={{
                            padding: "14px",
                            borderBottom:
                              "1px solid #f1f5f9",
                            fontSize: "13px",
                            color: "#334155",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {String(
                            shipment?.[key] ?? "-"
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShipmentsPage;