import { shipmentData } from "../data/shipmentData";

function ShipmentTable() {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        marginTop: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Shipment History</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "15px",
        }}
      >
        <thead>
          <tr>
            <th>Shipment ID</th>
            <th>Supplier</th>
            <th>Product</th>
            <th>Delay</th>
            <th>Status</th>
            <th>Cost</th>
          </tr>
        </thead>

        <tbody>
          {shipmentData.map((shipment) => (
            <tr key={shipment.id}>
              <td>{shipment.id}</td>
              <td>{shipment.supplier}</td>
              <td>{shipment.product}</td>
              <td>{shipment.delay} Days</td>
              <td>{shipment.status}</td>
              <td>${shipment.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShipmentTable;