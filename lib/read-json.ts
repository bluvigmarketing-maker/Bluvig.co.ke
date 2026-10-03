// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;

/**
 * Parses a fetch response as JSON. If the server failed without sending JSON
 * (e.g. an empty 500), returns a readable `{ error }` instead of throwing
 * "Unexpected end of JSON input".
 */
export async function readJson(res: Response): Promise<Json> {
  const text = await res.text();
  try {
    if (text) return JSON.parse(text) as Json;
  } catch {
    // fall through to the generic error below
  }
  return res.ok
    ? {}
    : {
        error: `The server ran into a problem (error ${res.status}). Please try again.`,
      };
}
