import { shipmentData } from "../data/shipmentData";

function ShipmentTable() {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginTop: "30px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        Shipment History
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
            <th style={{ padding: "12px" }}>Shipment ID</th>
            <th>Supplier</th>
            <th>Product</th>
            <th>Delay</th>
            <th>Status</th>
            <th>Cost</th>
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
              <td style={{ padding: "12px" }}>{shipment.id}</td>
              <td>{shipment.supplier}</td>
              <td>{shipment.product}</td>
              <td>{shipment.delay} Days</td>

              <td>
                <span
                  style={{
                    background:
                      shipment.status === "On Time"
                        ? "#22c55e"
                        : "#ef4444",
                    color: "white",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                  }}
                >
                  {shipment.status}
                </span>
              </td>

              <td>${shipment.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShipmentTable;