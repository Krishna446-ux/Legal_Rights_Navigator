const raw = process.env.NEXT_PUBLIC_BACKEND_URL;

export const BACKEND_URL: string =
  (raw ?? "http://127.0.0.1:8000").replace(/^["']|["']$/g, "");
