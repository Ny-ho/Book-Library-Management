const baseUrl =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    super.name = "ApiError"; // Standard practice for custom JS errors
    this.status = status;
    this.detail = detail;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: string | { msg: string }[] };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((d) => d.msg).join(", ");
    }
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed";
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");
  
  // ✨ FIX: Convert standard Headers Init type into a flat string-to-string dictionary
  const incomingHeaders = options.headers
    ? (Object.fromEntries(new Headers(options.headers).entries()) as Record<string, string>)
    : {};

  // Set up headers dynamically with guaranteed flat string values
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...incomingHeaders,
  };

  // Only set Content-Type to JSON if we aren't uploading FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers, // Type check passes flawlessly now!
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseError(res));
  }

  return res.json() as Promise<T>;
}

export { baseUrl };