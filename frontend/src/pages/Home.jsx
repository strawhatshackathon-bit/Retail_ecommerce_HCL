import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App.jsx";
import { menuApi, ordersApi } from "../lib/api.js";

const Home = () => {
  const { user } = React.useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [combos, setCombos] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [chef, setChef] = useState([]);
  const [cart, setCart] = useState([]);
  const [customAdds, setCustomAdds] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [customBase, setCustomBase] = useState(null);

  useEffect(() => {
    Promise.all([menuApi.items(), menuApi.combos(), menuApi.ingredients(), menuApi.chefSpecials()])
      .then(([itemsRes, combosRes, ingredientsRes, chefRes]) => {
        setItems(itemsRes);
        setCombos(combosRes);
        setIngredients(ingredientsRes);
        setChef(chefRes);
        setLoadError("");
      })
      .catch((err) => {
        setLoadError(err.message || "Unable to load menu.");
      })
      .finally(() => setLoading(false));
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const addToCart = (item, type = "item") => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item._id && p.type === type);
      if (exists) {
        return prev.map((p) => (p === exists ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { id: item._id, name: item.name, price: item.basePrice || item.price, qty: 1, type }];
    });
  };

  const updateCustom = (ingredient, delta) => {
    setCustomAdds((prev) => {
      const found = prev.find((p) => p.id === ingredient._id);
      if (!found && delta > 0) return [...prev, { id: ingredient._id, name: ingredient.name, price: ingredient.price, qty: 1 }];
      if (!found) return prev;
      const nextQty = Math.max(0, found.qty + delta);
      if (nextQty === 0) return prev.filter((p) => p.id !== ingredient._id);
      return prev.map((p) => (p.id === ingredient._id ? { ...p, qty: nextQty } : p));
    });
  };

  const basePrice = customBase?.basePrice ?? 120;
  const customPrice = basePrice + customAdds.reduce((sum, a) => sum + a.price * a.qty, 0);

  const addCustomToCart = () => {
    const name = customBase ? `Custom ${customBase.name}` : "Custom Bowl";
    setCart((prev) => [...prev, { id: `custom-${Date.now()}`, name, price: customPrice, qty: 1, type: "custom", additions: customAdds }]);
    setCustomAdds([]);
  };

  const startCustomize = (item) => {
    setCustomBase(item);
    setCustomAdds([]);
    const el = document.getElementById("custom-builder");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const placeOrder = async () => {
    if (!user) return;
    const payload = {
      items: cart.filter((c) => c.type === "item"),
      combos: cart.filter((c) => c.type === "combo"),
      customItems: cart.filter((c) => c.type === "custom"),
      total,
      streak: user.streak || 0,
    };
    try {
      await ordersApi.create(payload);
      setCart([]);
      setMessage("Order placed. Track it in My Orders.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>{user ? `Welcome back, ${user.name}.` : "Restaurant commerce that feels like retail."}</h1>
          <p>
            {user
              ? `We tuned your Flavor DNA with chef specials. Your streak perks: ${user.streak || 0}.`
              : "Build your meal, bundle combos, and track live ETA. Sign in to unlock custom bowls and group orders."}
          </p>
          <div className="hero-actions">
            <a className="btn" href="#menu">
              Explore Menu
            </a>
            <a className="btn ghost" href="#custom-builder">
              Customize a Bowl
            </a>
          </div>
        </div>
        <div className="hero-card">
          <h3>Today’s Chef Specials</h3>
          <div className="grid">
            {chef.map((c) => (
              <button className="card" key={c._id} onClick={() => addToCart(c, "item")}>
                <h4>{c.name}</h4>
                <p>{c.description}</p>
                <div className="nutri">
                  <span>{c.nutrition?.calories ?? 0} kcal</span>
                  <span>{c.nutrition?.protein ?? 0}g protein</span>
                </div>
                <span className="price">₹{c.basePrice}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="menu">
        <h2>Menu</h2>
        {loading && <p className="muted">Loading menu...</p>}
        {!loading && loadError && <p className="muted">{loadError}</p>}
        {!loading && !items.length && !loadError && (
          <p className="muted">No menu items yet. Run the seed script to load demo data.</p>
        )}
        <div className="grid">
          {items.map((item) => (
            <div className="card" key={item._id}>
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <div className="chip-row">
                <span className="chip">{item.category || "Signature"}</span>
                {item.allergens?.slice(0, 2).map((a) => (
                  <span className="chip ghost" key={a}>
                    {a}
                  </span>
                ))}
              </div>
              <div className="nutri">
                <span>{item.nutrition?.calories ?? 0} kcal</span>
                <span>{item.nutrition?.protein ?? 0}g protein</span>
                <span>{item.nutrition?.carbs ?? 0}g carbs</span>
                <span>{item.nutrition?.fat ?? 0}g fat</span>
              </div>
              <div className="row">
                <span className="price">₹{item.basePrice}</span>
                <div className="row">
                  <button className="btn ghost" onClick={() => startCustomize(item)}>
                    Customize
                  </button>
                  <button className="btn" onClick={() => addToCart(item, "item")}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="combos">
        <h2>Combos</h2>
        <div className="grid">
          {combos.map((combo) => (
            <div className="card" key={combo._id}>
              <h4>{combo.name}</h4>
              <p>{combo.description}</p>
              <div className="nutri">
                <span>{combo.nutrition?.calories ?? 0} kcal</span>
                <span>{combo.nutrition?.protein ?? 0}g protein</span>
              </div>
              <div className="row">
                <span className="price">₹{combo.price}</span>
                <button className="btn" onClick={() => addToCart(combo, "combo")}>
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="card highlight">
          <h3>Group Ordering, Zero Chaos.</h3>
          <p className="muted">Create a room, share a code, and let everyone add their dishes before checkout.</p>
          <Link className="btn" to="/group">
            Start a Group Order
          </Link>
        </div>
      </section>

      <section className="section" id="custom-builder">
        <h2>Custom Bowl Builder</h2>
        <p className="muted">
          Choose your ingredients, set quantity, and watch the price update. {customBase ? `Base: ${customBase.name}.` : "Pick a base or start from scratch."}
        </p>
        <div className="builder">
          <div>
            {!ingredients.length && <p className="muted">No ingredients available yet.</p>}
            {ingredients.map((ing) => (
              <div className="builder-row" key={ing._id}>
                <span>{ing.name}</span>
                <span className="price">₹{ing.price}</span>
                <div className="qty">
                  <button onClick={() => updateCustom(ing, -1)}>-</button>
                  <span>{customAdds.find((c) => c.id === ing._id)?.qty || 0}</span>
                  <button onClick={() => updateCustom(ing, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="builder-summary">
            <h3>{customBase ? `Custom ${customBase.name}` : "Custom Bowl"}</h3>
            <p className="muted">Base price: ₹{basePrice}</p>
            {customBase?.ingredients?.length ? (
              <div className="chip-row">
                {customBase.ingredients.map((ing) => (
                  <span className="chip ghost" key={ing.ingredientId || ing.name}>
                    {ing.name}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="price">₹{customPrice}</div>
            <button className="btn" onClick={addCustomToCart} disabled={!user}>
              {user ? "Add Bowl" : "Login to add"}
            </button>
          </div>
        </div>
      </section>

      <section className="section" id="cart">
        <h2>Your Cart</h2>
        <div className="card">
          {cart.length === 0 && <p className="muted">Add items to get started.</p>}
          {cart.map((c) => (
            <div className="row" key={c.id}>
              <span>{c.name}</span>
              <span>
                {c.qty} × ₹{c.price}
              </span>
            </div>
          ))}
          <div className="row total">
            <strong>Total</strong>
            <strong>₹{total}</strong>
          </div>
          <button className="btn" disabled={!cart.length} onClick={placeOrder}>
            Place Order
          </button>
          {!user && <p className="muted">Login to place orders and track delivery.</p>}
          {message && <p className="muted">{message}</p>}
        </div>
      </section>
    </div>
  );
};

export default Home;
