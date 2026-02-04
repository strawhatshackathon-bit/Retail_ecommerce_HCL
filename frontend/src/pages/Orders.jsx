import React, { useEffect, useState } from "react";
import { ordersApi } from "../lib/api.js";

const steps = ["placed", "prepping", "cooking", "out_for_delivery", "delivered"];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    ordersApi.my().then(setOrders).catch(() => {});
  }, []);

  const reorder = async (id) => {
    try {
      await ordersApi.reorder(id);
      setMessage("Reorder placed.");
      const data = await ordersApi.my();
      setOrders(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const lastOrder = orders[0];

  return (
    <section className="page">
      <h2>Order History</h2>
      {lastOrder && (
        <div className="card highlight">
          <h3>Quick Reorder Suggestion</h3>
          <p>Repeat your last order with one click.</p>
          <button className="btn" onClick={() => reorder(lastOrder._id)}>
            Reorder Last
          </button>
        </div>
      )}
      <div className="grid">
        {orders.map((order) => {
          const stepIndex = steps.indexOf(order.status);
          return (
            <div className="card" key={order._id}>
              <h4>Order #{order._id.slice(-6)}</h4>
              <p>Status: {order.status}</p>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${(stepIndex + 1) * 20}%` }} />
              </div>
              <p>ETA: {order.etaMinutes} min</p>
              <p>Total: ₹{order.total}</p>
              <button className="btn ghost" onClick={() => reorder(order._id)}>
                Reorder
              </button>
            </div>
          );
        })}
      </div>
      {message && <p className="muted">{message}</p>}
    </section>
  );
};

export default Orders;
