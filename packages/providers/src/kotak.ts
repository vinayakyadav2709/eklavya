const KOTAK_LOGIN_BASE = "https://mis.kotaksecurities.com";

export interface KotakTotpResponse {
  token: string;
  sid: string;
}

export interface KotakMpinResponse {
  token: string;
  sid: string;
  baseUrl: string;
}

export interface KotakHolding {
  symbol: string;
  displaySymbol: string;
  instrumentName: string;
  quantity: number;
  averagePrice: number;
  closingPrice: number;
  mktValue: number;
  unrealisedGainLoss: number;
  instrumentType?: string;
  sector?: string;
}

async function neoFetch(
  baseUrl: string,
  endpoint: string,
  method: string,
  headers: Record<string, string> = {},
  body?: Record<string, string>
) {
  const url = `${baseUrl}${endpoint}`;
  const options: RequestInit = { method, headers };

  if (body) {
    if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
      options.body = new URLSearchParams(body).toString();
    } else {
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok || data?.status === "error" || data?.stat === "Not_Ok") {
    throw new Error(
      `Kotak API error: ${res.status} ${JSON.stringify(data)}`
    );
  }

  return data;
}

export async function loginWithTotp(
  consumerKey: string,
  mobileNumber: string,
  ucc: string,
  totp: string
): Promise<{ viewToken: string; sid: string }> {
  const data = await neoFetch(
    KOTAK_LOGIN_BASE,
    "/login/1.0/tradeApiLogin",
    "POST",
    {
      Authorization: consumerKey,
      "neo-fin-key": "neotradeapi",
      "Content-Type": "application/json",
    },
    { mobileNumber, ucc, totp }
  );

  if (!data?.data?.token || !data?.data?.sid) {
    throw new Error("Missing token or sid in TOTP response");
  }

  return { viewToken: data.data.token, sid: data.data.sid };
}

export async function validateMpin(
  consumerKey: string,
  sid: string,
  viewToken: string,
  mpin: string
): Promise<{ tradeToken: string; sid: string; dynamicBaseUrl: string }> {
  const data = await neoFetch(
    KOTAK_LOGIN_BASE,
    "/login/1.0/tradeApiValidate",
    "POST",
    {
      Authorization: consumerKey,
      "neo-fin-key": "neotradeapi",
      sid,
      Auth: viewToken,
      "Content-Type": "application/json",
    },
    { mpin }
  );

  if (!data?.data?.token || !data?.data?.baseUrl) {
    throw new Error("Missing token or baseUrl in MPIN response");
  }

  return {
    tradeToken: data.data.token,
    sid: data.data.sid || sid,
    dynamicBaseUrl: data.data.baseUrl,
  };
}

export async function getHoldings(
  dynamicBaseUrl: string,
  sid: string,
  tradeToken: string
): Promise<KotakHolding[]> {
  const data = await neoFetch(
    dynamicBaseUrl,
    "/portfolio/v1/holdings",
    "GET",
    {
      accept: "application/json",
      Sid: sid,
      Auth: tradeToken,
      "neo-fin-key": "neotradeapi",
    }
  );

  return data?.data || [];
}
