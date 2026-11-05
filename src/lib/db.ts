import { createClient } from "@libsql/client";

const url =
  process.env.TURSO_DATABASE_URL ||
  "libsql://freelance-system-themededits.aws-ap-south-1.turso.io";
const authToken =
  process.env.TURSO_AUTH_TOKEN ||
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM4NDQ0MzYsImlkIjoiMDFhMWE5NzUtNzIwMS03OGIxLThmOTctOWIyODQwODZmMzQzIiwia2lkIjoiWGM3NEJHcF9fT19tcldpaXAtYUUtd0NzdVF3S0dRTFM0Sm5hWmF1b3J0WSIsInJpZCI6IjBiY2UzMjk4LWM1NGYtNDNmNS04M2NiLTM0OWMwOTc4NzJiNiJ9.yiYwfBqBjnnSxXTvvJ8RhlqqUYOty0TIUiq_trP6hY4YD58Q6rXZBuIGyHkHKCoiabIEEZ8BCm1dIm9HSS3_Bw";

export const db = createClient({
  url,
  authToken,
});
