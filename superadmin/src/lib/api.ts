const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('trippzi-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('trippzi-token');
      // Only logout if we actually had a token (to avoid loops on failed login)
      if (token) {
        localStorage.removeItem('trippzi-token');
        window.location.href = '/';
      }
    }
  }
  return res;
}

async function apiRequest(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });
  
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const errorMsg = errorBody.detail || errorBody.error || JSON.stringify(errorBody) || res.statusText;
    throw new Error(errorMsg);
  }
  
  return handleResponse(res);
}

export async function login(data: { username: string, password: string }) {
  const payload = {
    username: data.username,
    password: data.password
  };
  console.log("Sending Login Payload:", payload);
  const res = await apiRequest(`${API_BASE}/auth/login/`, {
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
  const res = await apiRequest(`${API_BASE}/admin/stats/`, { headers: getHeaders() });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchUsers(page = 1, search = "") {
  const res = await apiRequest(`${API_BASE}/admin/users/?page=${page}&search=${search}`, { headers: getHeaders() });
  if (!res.ok) {
    console.error("Fetch Users Error:", res.status);
    return { results: [], count: 0 };
  }
  return res.json();
}

export async function fetchItineraries(page = 1, isCustom?: boolean, search = "") {
  let url = `${API_BASE}/itineraries/?page=${page}&search=${search}`;
  if (isCustom !== undefined) url += `&is_custom=${isCustom}`;
  const res = await apiRequest(url, { headers: getHeaders() });
  if (!res.ok) {
    console.error("Fetch Itineraries Error:", res.status);
    return { results: [], count: 0 };
  }
  return res.json();
}

export async function fetchTransactions(page = 1, search = "") {
  const res = await apiRequest(`${API_BASE}/admin/transactions/?page=${page}&search=${search}`, { headers: getHeaders() });
  if (!res.ok) return { results: [], count: 0 };
  return res.json();
}

export async function validateItinerary(id: number) {
  const res = await apiRequest(`${API_BASE}/itineraries/${id}/validate/`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return res.json();
}

// Itinerary CRUD
export async function createItinerary(data: any) {
  const res = await apiRequest(`${API_BASE}/itineraries/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateItinerary(id: number, data: any) {
  const res = await apiRequest(`${API_BASE}/itineraries/${id}/`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteItinerary(id: number) {
  const res = await apiRequest(`${API_BASE}/itineraries/${id}/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.ok;
}

export async function cloneItinerary(id: number, copyPdf: boolean = false) {
  const res = await apiRequest(`${API_BASE}/itineraries/${id}/clone_to_standard/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ copy_pdf: copyPdf })
  });
  if (!res.ok) throw new Error("Cloning failed");
  return res.json();
}

export async function fetchSettings() {
  const res = await apiRequest(`${API_BASE}/admin/settings/`, { headers: getHeaders() });
  if (!res.ok) return null;
  return res.json();
}

export async function updateSettings(data: any) {
  const res = await apiRequest(`${API_BASE}/admin/settings/`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// Country CRUD (Backend path is 'destinations')
export async function fetchCountries(page = 1, search = "") {
  const res = await apiRequest(`${API_BASE}/destinations/?page=${page}&search=${search}`, { headers: getHeaders() });
  return res.json();
}
export async function fetchAllCountries() {
  const res = await apiRequest(`${API_BASE}/destinations/list_all/`, { headers: getHeaders() });
  return res.json();
}
export async function createCountry(data: any) {
  const res = await apiRequest(`${API_BASE}/destinations/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  return res.json();
}
export async function updateCountry(id: number, data: any) {
  const res = await apiRequest(`${API_BASE}/destinations/${id}/`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) });
  return res.json();
}
export async function deleteCountry(id: number) {
  const res = await apiRequest(`${API_BASE}/destinations/${id}/`, { method: 'DELETE', headers: getHeaders() });
  return res.ok;
}

// Destination CRUD (Backend path is 'sub-destinations')
export async function fetchDestinations(page = 1, search = "") {
  const res = await apiRequest(`${API_BASE}/sub-destinations/?page=${page}&search=${search}`, { headers: getHeaders() });
  return res.json();
}
export async function fetchAllDestinations() {
  const res = await apiRequest(`${API_BASE}/sub-destinations/list_all/`, { headers: getHeaders() });
  return res.json();
}
export async function createDestination(data: any) {
  const res = await apiRequest(`${API_BASE}/sub-destinations/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  return res.json();
}
export async function updateDestination(id: number, data: any) {
  const res = await apiRequest(`${API_BASE}/sub-destinations/${id}/`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) });
  return res.json();
}
export async function deleteDestination(id: number) {
  const res = await apiRequest(`${API_BASE}/sub-destinations/${id}/`, { method: 'DELETE', headers: getHeaders() });
  return res.ok;
}

// Attraction CRUD
export async function fetchAttractions(page = 1, search = "") {
  const res = await apiRequest(`${API_BASE}/attractions/?page=${page}&search=${search}`, { headers: getHeaders() });
  return res.json();
}
export async function createAttraction(data: any) {
  const res = await apiRequest(`${API_BASE}/attractions/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  return res.json();
}
export async function updateAttraction(id: number, data: any) {
  const res = await apiRequest(`${API_BASE}/attractions/${id}/`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) });
  return res.json();
}
export async function deleteAttraction(id: number) {
  const res = await apiRequest(`${API_BASE}/attractions/${id}/`, { method: 'DELETE', headers: getHeaders() });
  return res.ok;
}
