const apiKey = process.env.MEMTIME_API_KEY?.trim();
const baseUrl = process.env.MEMTIME_API_BASE_URL?.trim();
const port = Number(process.env.PORT ?? "3001");

if (!apiKey) {
  throw new Error("MEMTIME_API_KEY is not set");
}

if (!baseUrl) {
  throw new Error("MEMTIME_API_BASE_URL is not set");
}

export const config = {
  port,
  memtimeApiKey: apiKey,
  memtimeBaseUrl: baseUrl,
};
