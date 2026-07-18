const raw = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/^["']+|["']+$/g, "").trim();

export const BACKEND_URL: string =
  raw.startsWith("http") ? raw : "http://127.0.0.1:8000";
