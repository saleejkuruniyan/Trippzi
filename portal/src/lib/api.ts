const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchDestinations() {
  const res = await fetch(`${API_BASE}/destinations/`);
  return res.json();
}

export async function fetchDestinationBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/destinations/${slug}/`);
  return res.json();
}

// Helper for Auth Headers
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('trippzi-token') : null;
  const isValidToken = token && token !== 'undefined' && token !== 'null';
  return {
    'Content-Type': 'application/json',
    ...(isValidToken ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function fetchMyTrips() {
  const res = await fetch(`${API_BASE}/my-trips/`, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function toggleWishlist(itineraryId: number) {
  const res = await fetch(`${API_BASE}/wishlist/toggle/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ itinerary_id: itineraryId }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMyWishlist() {
  const res = await fetch(`${API_BASE}/wishlist/`, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchItineraries() {
  const res = await fetch(`${API_BASE}/itineraries/`, { headers: getAuthHeaders() });
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results && Array.isArray(data.results) ? data.results : []);
}

export async function fetchItineraryById(id: string | number) {
  const res = await fetch(`${API_BASE}/itineraries/${id}/`, { headers: getAuthHeaders() });
  if (!res.ok) return null;
  return res.json();
}

export async function generateItinerary(data: {
  destination: string;
  duration?: number;
  budget?: string;
  style?: string;
  interests?: string;
  source_country?: string;
}) {
  const res = await fetch(`${API_BASE}/generate/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchVisaInfo(source: string, destination: string) {
  const res = await fetch(`${API_BASE}/visa/?source=${source}&destination=${destination}`);
  return res.json();
}

export async function googleLogin(accessToken: string) {
  const res = await fetch(`${API_BASE}/auth/google/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
  });
  return res.json();
}


export async function createRazorpayOrder(itineraryId: number) {
  const res = await fetch(`${API_BASE}/payments/checkout/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ itinerary_id: itineraryId }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.detail || data.error || "Failed to create order", status: res.status };
  return data;
}

export async function verifyRazorpayPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const res = await fetch(`${API_BASE}/payments/verify/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) return { error: resData.detail || "Verification failed", status: res.status };
  return resData;
}

export async function fetchProfile() {
  const res = await fetch(`${API_BASE}/auth/profile/`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.detail || "Failed to fetch profile", status: res.status };
  return data;
}

export async function updateProfile(data: any) {
  const res = await fetch(`${API_BASE}/auth/profile/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) return { error: resData.detail || "Update failed", status: res.status };
  return resData;
}
