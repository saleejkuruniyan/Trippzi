const getEnv = (key: string, defaultValue: string) => {
  if (typeof window !== 'undefined' && (window as any).ENV) {
    return (window as any).ENV[key] || defaultValue;
  }
  return process.env[key] || defaultValue;
};

const API_BASE = getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8000/api');

export async function fetchDestinations(showAll = false) {
  const url = `${API_BASE}/destinations/list_all/?t=${Date.now()}${showAll ? '&show_all=true' : ''}`;
  const res = await apiRequest(url, { headers: getAuthHeaders() });
  return res.json();
}

export async function fetchDestinationBySlug(slug: string) {
  const res = await apiRequest(`${API_BASE}/destinations/${slug}/`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Destination not found");
  return data;
}

export async function fetchSubDestinations(countrySlug: string) {
  const res = await apiRequest(`${API_BASE}/destinations/${countrySlug}/destinations/`, { headers: getAuthHeaders() });
  return res.json();
}

async function handleResponse(res: Response) {
  return res;
}

async function apiRequest(url: string, options: RequestInit = {}) {
  const res = await fetch(url, options);
  
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('trippzi-token');
      if (token) {
        localStorage.removeItem('trippzi-token');
        localStorage.removeItem('trippzi-user');
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/'; 
      }
    }
  }

  return res;
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
  const res = await apiRequest(`${API_BASE}/my-trips/`, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function toggleWishlist(itineraryId: number) {
  const res = await apiRequest(`${API_BASE}/wishlist/toggle/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ itinerary_id: itineraryId }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMyWishlist() {
  const res = await apiRequest(`${API_BASE}/wishlist/`, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchItineraries() {
  const res = await apiRequest(`${API_BASE}/itineraries/`, { headers: getAuthHeaders() });
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results && Array.isArray(data.results) ? data.results : []);
}

export async function fetchItineraryById(id: string | number) {
  const res = await apiRequest(`${API_BASE}/itineraries/${id}/?t=${Date.now()}`, { 
    headers: getAuthHeaders(),
    cache: 'no-store' as RequestCache
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateItinerary(data: {
  country_id: number;
  destination_ids: number[];
  duration?: number;
  budget?: string;
  style?: string;
  interests?: string;
  source_country?: string;
  custom_destination?: string;
}) {
  const res = await apiRequest(`${API_BASE}/generate/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || "Generation failed");
  return resData;
}

export async function fetchVisaInfo(source: string, destination: string) {
  const res = await apiRequest(`${API_BASE}/visa/?source=${source}&destination=${destination}`);
  return res.json();
}

export async function googleLogin(accessToken: string) {
  const res = await apiRequest(`${API_BASE}/auth/google/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
  });
  return res.json();
}


export async function createRazorpayOrder(itineraryId: number) {
  const res = await apiRequest(`${API_BASE}/payments/checkout/`, {
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
  const res = await apiRequest(`${API_BASE}/payments/verify/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) return { error: resData.detail || "Verification failed", status: res.status };
  return resData;
}

export async function fetchProfile() {
  const res = await apiRequest(`${API_BASE}/auth/profile/`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.detail || "Failed to fetch profile", status: res.status };
  return data;
}

export async function updateProfile(data: any) {
  const res = await apiRequest(`${API_BASE}/auth/profile/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) return { error: resData.detail || "Update failed", status: res.status };
  return resData;
}

export async function downloadItineraryPDF(itineraryId: number) {
  const res = await apiRequest(`${API_BASE}/itineraries/${itineraryId}/pdf/`, {
    headers: getAuthHeaders(),
  });
  
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const data = await res.json();
    if (!res.ok) {
      const error: any = new Error(data.error || "Failed to generate PDF");
      if (data.instructions) error.instructions = data.instructions;
      throw error;
    }
    return data;
  } else {
    const text = await res.text();
    console.error("PDF Generation failed with non-JSON response:", text);
    throw new Error("Failed to generate PDF. The server returned an unexpected response.");
  }
}
export async function fetchCountries() {
  const res = await apiRequest(`${API_BASE}/destinations/list_all/?show_all=true`);
  return res.json();
}
