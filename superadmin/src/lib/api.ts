const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('trippzi-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function login(data: { username: string, password: string }) {
  const payload = {
    username: data.username,
    password: data.password
  };
  console.log("Sending Login Payload:", payload);
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Could not read error text");
    console.error("Login Raw Error:", res.status, errorText);
  }
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/admin/stats/`, { headers: getHeaders() });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/admin/users/`, { headers: getHeaders() });
  if (!res.ok) {
    console.error("Fetch Users Error:", res.status);
    return [];
  }
  return res.json();
}

export async function fetchItineraries() {
  const res = await fetch(`${API_BASE}/itineraries/`, { headers: getHeaders() });
  if (!res.ok) {
    console.error("Fetch Itineraries Error:", res.status);
    return [];
  }
  return res.json();
}

export async function fetchVisaRules() {
  const res = await fetch(`${API_BASE}/admin/visa-rules/`, { headers: getHeaders() });
  if (!res.ok) {
    console.error("Fetch Visa Rules Error:", res.status);
    return [];
  }
  return res.json();
}

export async function fetchTransactions() {
  const res = await fetch(`${API_BASE}/admin/transactions/`, { headers: getHeaders() });
  return res.json();
}

export async function validateItinerary(id: number) {
  const res = await fetch(`${API_BASE}/itineraries/${id}/validate/`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return res.json();
}

// Itinerary CRUD
export async function createItinerary(data: any) {
  const res = await fetch(`${API_BASE}/itineraries/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateItinerary(id: number, data: any) {
  const res = await fetch(`${API_BASE}/itineraries/${id}/`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteItinerary(id: number) {
  const res = await fetch(`${API_BASE}/itineraries/${id}/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.ok;
}

// Visa Rule CRUD
export async function createVisaRule(data: any) {
  const res = await fetch(`${API_BASE}/admin/visa-rules/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateVisaRule(id: number, data: any) {
  const res = await fetch(`${API_BASE}/admin/visa-rules/${id}/`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteVisaRule(id: number) {
  const res = await fetch(`${API_BASE}/admin/visa-rules/${id}/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.ok;
}
