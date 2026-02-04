import React, { useEffect, useState } from "react";
import { inventoryApi, menuApi, ordersApi } from "../lib/api.js";

const Admin = () => {
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [revenue, setRevenue] = useState({ total: 0, count: 0 });
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    category: "",
    basePrice: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const refresh = async () => {
    const [stockData, ordersData, revenueData, menuData] = await Promise.all([
      inventoryApi.list(),
      ordersApi.listAll(),
      ordersApi.revenueToday(),
      menuApi.items(),
    ]);
    setStock(stockData);
    setOrders(ordersData);
    setRevenue(revenueData);
    setMenuItems(menuData);
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

  const toggleMenuItem = async (item) => {
    await menuApi.toggleItem(item._id);
    setMessage("Menu availability updated.");
    refresh();
  };

  const editMenuItem = (item) => {
    setEditingId(item._id);
    setMenuForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "",
      basePrice: item.basePrice ?? "",
      calories: item.nutrition?.calories ?? "",
      protein: item.nutrition?.protein ?? "",
      carbs: item.nutrition?.carbs ?? "",
      fat: item.nutrition?.fat ?? "",
    });
  };

  const clearMenuForm = () => {
    setEditingId(null);
    setMenuForm({
      name: "",
      description: "",
      category: "",
      basePrice: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
  };

  const saveMenuItem = async (e) => {
    e.preventDefault();
    const payload = {
      name: menuForm.name.trim(),
      description: menuForm.description.trim(),
      category: menuForm.category.trim(),
      basePrice: Number(menuForm.basePrice) || 0,
      nutrition: {
        calories: Number(menuForm.calories) || 0,
        protein: Number(menuForm.protein) || 0,
        carbs: Number(menuForm.carbs) || 0,
        fat: Number(menuForm.fat) || 0,
      },
      isActive: true,
    };
    try {
      if (editingId) {
        await menuApi.updateItem(editingId, payload);
        setMessage("Menu item updated.");
      } else {
        await menuApi.createItem(payload);
        setMessage("Menu item created.");
      }
      clearMenuForm();
      refresh();
    } catch (err) {
      setMessage(err.message || "Unable to save menu item.");
    }
  };

  const deleteMenuItem = async (item) => {
    const ok = window.confirm(`Delete ${item.name}?`);
    if (!ok) return;
    await menuApi.deleteItem(item._id);
    setMessage("Menu item deleted.");
    refresh();
  };

  return (
    <section className="page">
      <h2>Admin Control Room</h2>
      <div className="grid">
        <div className="card highlight">
          <h3>Today’s Revenue</h3>
          <p className="price">₹{revenue.total}</p>
          <p className="muted">{revenue.count} orders processed today</p>
        </div>
        <div className="card">
          <h3>Supplier Contacts</h3>
          {stock.map((s) => (
            <div className="row" key={`${s._id}-supplier`}>
              <span>
                {s.name} · {s.supplier?.name || "Not set"}
              </span>
              <span className="muted">{s.supplier?.phone || "-"}</span>
            </div>
          ))}
        </div>
      </div>
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
          <h3>Menu Availability</h3>
          {menuItems.map((m) => (
            <div className="row" key={m._id}>
              <span>
                {m.name} · <span className={m.isActive ? "muted" : "chip danger"}>{m.isActive ? "Available" : "Unavailable"}</span>
              </span>
              <div className="row">
                <button className="btn ghost" onClick={() => toggleMenuItem(m)}>
                  {m.isActive ? "Disable" : "Enable"}
                </button>
                <button className="btn ghost" onClick={() => editMenuItem(m)}>
                  Edit
                </button>
                <button className="btn ghost" onClick={() => deleteMenuItem(m)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>{editingId ? "Update Menu Item" : "Create Menu Item"}</h3>
          <form className="admin-form" onSubmit={saveMenuItem}>
            <input
              placeholder="Name"
              value={menuForm.name}
              onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
            />
            <input
              placeholder="Category"
              value={menuForm.category}
              onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
            />
            <input
              placeholder="Base Price"
              type="number"
              value={menuForm.basePrice}
              onChange={(e) => setMenuForm({ ...menuForm, basePrice: e.target.value })}
            />
            <input
              className="full"
              placeholder="Description"
              value={menuForm.description}
              onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
            />
            <input
              placeholder="Calories"
              type="number"
              value={menuForm.calories}
              onChange={(e) => setMenuForm({ ...menuForm, calories: e.target.value })}
            />
            <input
              placeholder="Protein"
              type="number"
              value={menuForm.protein}
              onChange={(e) => setMenuForm({ ...menuForm, protein: e.target.value })}
            />
            <input
              placeholder="Carbs"
              type="number"
              value={menuForm.carbs}
              onChange={(e) => setMenuForm({ ...menuForm, carbs: e.target.value })}
            />
            <input
              placeholder="Fat"
              type="number"
              value={menuForm.fat}
              onChange={(e) => setMenuForm({ ...menuForm, fat: e.target.value })}
            />
            <div className="admin-actions full">
              <button className="btn" type="submit">
                {editingId ? "Update" : "Create"}
              </button>
              <button className="btn ghost" type="button" onClick={clearMenuForm}>
                Clear
              </button>
            </div>
          </form>
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
