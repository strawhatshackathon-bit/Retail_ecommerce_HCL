import React, { useState } from "react";
import { groupApi } from "../lib/api.js";
import { AuthContext } from "../App.jsx";

const GroupOrder = () => {
  const { user } = React.useContext(AuthContext);
  const [code, setCode] = useState("");
  const [group, setGroup] = useState(null);
  const [items, setItems] = useState("");
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");

  const create = async () => {
    try {
      const data = await groupApi.create();
      setGroup(data);
      setMessage("");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const join = async () => {
    try {
      const data = await groupApi.join(code);
      setGroup(data);
      setMessage("");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const addItems = async () => {
    try {
      const payload = { items: items.split(",").map((t) => t.trim()), total: Number(total) };
      const data = await groupApi.addItems(group._id, payload);
      setGroup(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const checkout = async () => {
    try {
      const data = await groupApi.checkout(group._id);
      setGroup(data);
      setMessage("Group order closed and sent to kitchen.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="page">
      <h2>Group Orders</h2>
      {!user && (
        <div className="card highlight">
          <h3>Invite your squad to order together.</h3>
          <p className="muted">Login to create or join a group order and split items in real time.</p>
        </div>
      )}
      {!group && (
        <div className="grid">
          <div className="card">
            <h3>Create a Group</h3>
            <button className="btn" onClick={create} disabled={!user}>
              Create
            </button>
          </div>
          <div className="card">
            <h3>Join with Code</h3>
            <input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn" onClick={join} disabled={!user}>
              Join
            </button>
          </div>
        </div>
      )}

      {group && (
        <div className="card">
          <h3>Group Code: {group.code}</h3>
          <p>Status: {group.status}</p>
          <div className="row">
            <input
              placeholder="Items comma-separated"
              value={items}
              onChange={(e) => setItems(e.target.value)}
            />
            <input
              placeholder="Total"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
            <button className="btn" onClick={addItems}>
              Add Items
            </button>
          </div>
          <div className="row">
            <button className="btn ghost" onClick={checkout}>
              Checkout Group
            </button>
          </div>
          <div className="grid">
            {group.members.map((m) => (
              <div className="card" key={m.userId}>
                <h4>{m.name}</h4>
                <p>Items: {m.items?.length || 0}</p>
                <p>Total: ₹{m.total}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {message && <p className="muted">{message}</p>}
    </section>
  );
};

export default GroupOrder;
