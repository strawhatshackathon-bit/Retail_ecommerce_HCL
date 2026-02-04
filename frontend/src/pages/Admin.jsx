import React, { useEffect, useState } from "react";
import { inventoryApi, ordersApi } from "../lib/api.js";

const Admin = () => {
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  const refresh = async () => {
    const [stockData, ordersData] = await Promise.all([inventoryApi.list(), ordersApi.listAll()]);
    setStock(stockData);
    setOrders(ordersData);
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggleAvailability = async (item) => {
    await inventoryApi.update(item._id, { isAvailable: !item.isAvailable });
    setMessage("Inventory updated.");
    refresh();
  };

  const updateStatus = async (orderId, status) => {
    await ordersApi.updateStatus(orderId, status);
    setMessage("Order status updated.");
    refresh();
  };

  return (
    <section className="page">
      <h2>Admin Control Room</h2>
      <div className="grid">
        <div className="card">
          <h3>Inventory</h3>
          {stock.map((s) => (
            <div className="row" key={s._id}>
              <span>
                {s.name} · {s.stock} {s.unit}
              </span>
              <button className="btn ghost" onClick={() => toggleAvailability(s)}>
                {s.isAvailable ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>Orders</h3>
          {orders.map((o) => (
            <div className="row" key={o._id}>
              <span>
                #{o._id.slice(-6)} · {o.status}
              </span>
              <select onChange={(e) => updateStatus(o._id, e.target.value)} defaultValue={o.status}>
                <option value="placed">Placed</option>
                <option value="prepping">Prepping</option>
                <option value="cooking">Cooking</option>
                <option value="out_for_delivery">Out</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          ))}
        </div>
      </div>
      {message && <p className="muted">{message}</p>}
    </section>
  );
};

export default Admin;
