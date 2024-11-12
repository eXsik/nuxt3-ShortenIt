import { sendRedirect } from "h3";

export default function useExternalRedirect(
  url: string,
  code: number = 302
): Promise<void> {
  try {
    try {
      new URL(url);
    } catch (e) {
      throw new Error("Invalid URL: " + url);
    }

    if (import.meta.server) {
      const nuxtApp = useNuxtApp();
      const event = nuxtApp.ssrContext?.event;

      if (!event) {
        throw new Error("SSR event not found");
      }

      return sendRedirect(event, url, code);
    }

    window.location.href = url;
    return Promise.resolve();
  } catch (error) {
    console.error("Error during redirect:", error);
    throw error;
  }
}
