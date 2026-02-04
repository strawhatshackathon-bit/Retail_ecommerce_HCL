const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const getToken = () => localStorage.getItem("token");

export const api = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
};

export const auth = {
  login: (payload) => api("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => api("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  me: () => api("/auth/me"),
};

export const menuApi = {
  items: () => api("/menu/items"),
  combos: () => api("/menu/combos"),
  ingredients: () => api("/menu/ingredients"),
  chefSpecials: () => api("/menu/chef-specials"),
  priceCustom: (payload) => api("/menu/customize/price", { method: "POST", body: JSON.stringify(payload) }),
};

export const ordersApi = {
  create: (payload) => api("/orders", { method: "POST", body: JSON.stringify(payload) }),
  my: () => api("/orders/my"),
  get: (id) => api(`/orders/${id}`),
  reorder: (id) => api(`/orders/${id}/reorder`, { method: "POST" }),
  listAll: () => api("/orders"),
  updateStatus: (id, status) =>
    api(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export const groupApi = {
  create: () => api("/group-orders", { method: "POST" }),
  join: (code) => api("/group-orders/join", { method: "POST", body: JSON.stringify({ code }) }),
  addItems: (id, payload) => api(`/group-orders/${id}/items`, { method: "POST", body: JSON.stringify(payload) }),
  checkout: (id) => api(`/group-orders/${id}/checkout`, { method: "POST" }),
};

export const inventoryApi = {
  list: () => api("/inventory/ingredients"),
  update: (id, payload) => api(`/inventory/ingredients/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
};
