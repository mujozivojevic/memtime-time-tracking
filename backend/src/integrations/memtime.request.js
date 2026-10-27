import { config } from "../config.js";
import { ApiError } from "../errors/ApiError.js";

const errorMessage = {
  400: "Memtime rejected the request",
  404: "The requested resource was not found",
};

export async function memtimeRequest(path, query = {}, options = {}) {
  const url = new URL(`${config.memtimeBaseUrl}/${path}`);
  url.search = new URLSearchParams(query).toString();

  let response;

  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${config.memtimeApiKey}`,
        ...(options.body !== undefined && {
          "Content-Type": "application/json",
        }),
      },
      signal: AbortSignal.timeout(10_000),
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    console.error("Memtime connection failed", error);
    throw new ApiError(502, "Unable to connect to Memtime");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    console.error("Memtime error", response.status, path, data);

    if (response.status === 429) {
      throw new ApiError(
        503,
        "Memtime is temporarily unavailable, please try again later",
      );
    }

    const fallbackMessage = errorMessage[response.status];
    if (!fallbackMessage) {
      throw new ApiError(502, "Memtime could not process the request");
    }

    const upstreamMessage =
      typeof data?.error === "string" ? data.error.trim() : "";
    throw new ApiError(response.status, upstreamMessage || fallbackMessage);
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    throw new ApiError(502, "Invalid JSON response from Memtime");
  }
}
