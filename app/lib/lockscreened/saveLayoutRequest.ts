// Bound both the connection and response-body wait. Never retry a write silently.
export async function saveLayoutRequest(body: unknown, accessToken: string, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("/api/studio/update-render-config", {
      method: "POST", signal: controller.signal,
      headers: { "content-type": "application/json", Authorization: "Bearer " + accessToken },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error || "Could not save your starting layouts.");
    if (result?.ok !== true) throw new Error("The server did not confirm the layout save. Please retry.");
    return result;
  } catch (error) {
    if (controller.signal.aborted) throw new Error("The save timed out. Your changes are still here. The server may have saved them; retry to confirm these settings.");
    throw error;
  } finally { clearTimeout(timer); }
}
