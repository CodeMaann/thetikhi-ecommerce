/**
 * Safe fetch helper that validates the response status and content type
 * to prevent JSON parsing errors (like "Rate exceeded" or HTML error pages).
 */
export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<any> {
  const response = await fetch(input, init);
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        if (text.includes("Rate exceeded")) {
          errorMessage = "Rate limit exceeded. Please wait a few seconds and try again.";
        } else {
          errorMessage = text.substring(0, 100);
        }
      }
    } catch (_) {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    if (text.includes("Rate exceeded")) {
      throw new Error("Rate limit exceeded. Please wait a few seconds and try again.");
    }
    throw new Error(`Expected JSON response, but received content-type: "${contentType || 'none'}"`);
  }

  return response.json();
}
