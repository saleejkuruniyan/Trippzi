const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchDestinations() {
  const res = await fetch(`${API_BASE}/destinations/`);
  return res.json();
}

export async function fetchDestinationBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/destinations/${slug}/`);
  return res.json();
}

export async function fetchItineraries() {
  const res = await fetch(`${API_BASE}/itineraries/`);
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
    headers: { 'Content-Type': 'application/json' },
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
