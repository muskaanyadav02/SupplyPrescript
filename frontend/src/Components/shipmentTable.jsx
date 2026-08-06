import { useState } from "react";
import api from "../api/api";

function ShipmentTable({ shipmentData = [] }) {
  const [prediction, setPrediction] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const handlePredict = async (shipmentId) => {
    try {
      setLoadingId(shipmentId);

      const response = await api.get(`/predict/${shipmentId}`);

      console.log("Prediction Response:");
      console.log(response.data);

      setPrediction(response.data);
    } catch (error) {
      console.error("Prediction Error:", error);
      alert("Prediction Failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginTop: "30px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        Shipment History (Live Backend)
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#2563eb",
              color: "white",
            }}
          >
            <th style={{ padding: "12px" }}>Order ID</th>
            <th>Category</th>
            <th>Region</th>
            <th>Quantity</th>
            <th>Price ($)</th>
            <th>Status</th>
            <th>Prediction</th>
          </tr>
        </thead>

        <tbody>
          {shipmentData.length > 0 ? (
            shipmentData.map((shipment) => (
              <tr
                key={shipment.id}
                style={{
                  textAlign: "center",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <td style={{ padding: "12px" }}>
                  {shipment.order_id}
                </td>

                <td>{shipment.category_name}</td>

                <td>{shipment.order_region}</td>

                <td>{shipment.order_item_quantity}</td>

                <td>${shipment.product_price}</td>

                <td>
                  <span
                    style={{
                      background:
                        shipment.status === "pending"
                          ? "#f59e0b"
                          : "#22c55e",
                      color: "white",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                    }}
                  >
                    {shipment.status}
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => handlePredict(shipment.id)}
                    disabled={loadingId === shipment.id}
                    style={{
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    {loadingId === shipment.id
                      ? "Predicting..."
                      : "Predict"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                Loading shipment data...
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Prediction Card */}

      {prediction && (
        <div
          style={{
            marginTop: "30px",
            background: "#eef6ff",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #2563eb",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>
            🚚 Shipment Delay Prediction
          </h3>

          <p>
            <strong>Prediction ID:</strong>{" "}
            {prediction.prediction_id}
          </p>

          <p>
            <strong>Shipment ID:</strong>{" "}
            {prediction.shipment_id}
          </p>

          <p>
            <strong>Delay Probability:</strong>{" "}
            {(prediction.probability * 100).toFixed(2)}%
          </p>

          <p>
            <strong>Predicted Delay:</strong>{" "}
            {prediction.predicted_delay_days} Days
          </p>

          <p>
            <strong>Model:</strong>{" "}
            {prediction.model_version}
          </p>
        </div>
      )}
    </div>
  );
}

export default ShipmentTable;
