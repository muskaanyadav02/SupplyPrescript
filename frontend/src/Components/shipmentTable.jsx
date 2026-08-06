import { useState } from "react";
import api from "../api/api";

function ShipmentTable({ shipmentData = [] }) {
  const [prediction, setPrediction] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  async function handlePredict(shipmentId) {
    try {
      setLoadingId(shipmentId);

      const response = await api.get(`/predict/${shipmentId}`);

      console.log(response.data);

      setPrediction(response.data);
    } catch (error) {
      console.error(error);
      alert("Prediction Failed");
    } finally {
      setLoadingId(null);
    }
  }

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
      <h2>Shipment History (Live Backend)</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#2563eb",
              color: "white",
            }}
          >
            <th>Order ID</th>
            <th>Category</th>
            <th>Region</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Status</th>
            <th>Predict</th>
          </tr>
        </thead>

        <tbody>
          {shipmentData.map((shipment) => (
            <tr
              key={shipment.id}
              style={{
                textAlign: "center",
                borderBottom: "1px solid #ddd",
              }}
            >
              <td>{shipment.order_id}</td>

              <td>{shipment.category_name}</td>

              <td>{shipment.order_region}</td>

              <td>{shipment.order_item_quantity}</td>

              <td>${shipment.product_price}</td>

              <td>{shipment.status}</td>

              <td>
                <button
                  onClick={() => handlePredict(shipment.id)}
                  disabled={loadingId === shipment.id}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
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
          ))}
        </tbody>
      </table>

      {prediction && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            borderRadius: "10px",
            background: "#eef6ff",
            border: "1px solid #2563eb",
          }}
        >
          <h3>Prediction Result</h3>

          <p>
            <strong>Shipment ID:</strong>{" "}
            {prediction.shipment_id}
          </p>

          <p>
            <strong>Probability:</strong>{" "}
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