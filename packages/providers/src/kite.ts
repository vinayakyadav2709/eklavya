const KITE_BASE = "https://api.kite.trade";

export interface KiteSession {
  access_token: string;
  public_token: string;
  user_id: string;
  user_name: string;
}

export interface KiteHolding {
  tradingsymbol: string;
  exchange: string;
  isin: string;
  quantity: number;
  t1_quantity: number;
  realised_quantity: number;
  authorised_date: string;
  average_price: number;
  last_price: number;
  close_price: number;
  pnl: number;
  day_change: string;
  day_change_percentage: string;
}

export interface KiteProfile {
  user_id: string;
  user_name: string;
  email: string;
  user_shortname: string;
  avatar_url: string;
  broker: string;
  products: string[];
  order_types: string[];
  exchanges: string[];
}

export function getLoginURL(apiKey: string, redirectUrl: string): string {
  return `https://kite.zerodha.com/connect/login?v=3&api_key=${encodeURIComponent(apiKey)}&redirect_url=${encodeURIComponent(redirectUrl)}`;
}

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateSession(
  apiKey: string,
  apiSecret: string,
  requestToken: string
): Promise<KiteSession> {
  const checksum = await sha256(apiKey + requestToken + apiSecret);

  const body = new URLSearchParams({
    api_key: apiKey,
    request_token: requestToken,
    checksum,
  });

  const res = await fetch(`${KITE_BASE}/session/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Kite-Version": "3",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kite session generation failed: ${res.status} ${text}`);
  }

  const data = await res.json() as { data: KiteSession };
  return data.data;
}

export async function getHoldings(
  apiKey: string,
  accessToken: string
): Promise<KiteHolding[]> {
  const res = await fetch(`${KITE_BASE}/portfolio/holdings`, {
    method: "GET",
    headers: {
      Authorization: `token ${apiKey}:${accessToken}`,
      "X-Kite-Version": "3",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kite holdings fetch failed: ${res.status} ${text}`);
  }

  const data = await res.json() as { data: KiteHolding[] };
  return data.data;
}

export async function getProfile(
  apiKey: string,
  accessToken: string
): Promise<KiteProfile> {
  const res = await fetch(`${KITE_BASE}/user/profile`, {
    method: "GET",
    headers: {
      Authorization: `token ${apiKey}:${accessToken}`,
      "X-Kite-Version": "3",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kite profile fetch failed: ${res.status} ${text}`);
  }

  const data = await res.json() as { data: KiteProfile };
  return data.data;
}
