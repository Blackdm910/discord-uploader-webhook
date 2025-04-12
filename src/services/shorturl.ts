/**
 * Represents the response from shortening a URL.
 */
export interface ShortUrlResponse {
  /**
   * The shortened URL.
   */
  shortUrl: string;
}

/**
 * Asynchronously shortens a given URL.
 *
 * @param longUrl The URL to shorten.
 * @returns A promise that resolves to a ShortUrlResponse containing the shortened URL.
 */
export async function shortenUrl(longUrl: string): Promise<ShortUrlResponse> {
  // TODO: Implement this by calling a URL shortening API.

  return {
    shortUrl: 'https://short.url/xyz123',
  };
}
