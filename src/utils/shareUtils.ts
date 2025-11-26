import { AppState } from '../types';

/**
 * Converts AppState to base64 encoded string for sharing
 */
export const encodeStateToBase64 = (state: AppState): string => {
  const jsonString = JSON.stringify(state);
  return btoa(encodeURIComponent(jsonString));
};

/**
 * Decodes base64 string back to AppState
 */
export const decodeBase64ToState = (base64: string): AppState | null => {
  try {
    const jsonString = decodeURIComponent(atob(base64));
    return JSON.parse(jsonString) as AppState;
  } catch (error) {
    console.error('Error decoding shared state:', error);
    return null;
  }
};

/**
 * Generates a shareable URL with base64 encoded state
 */
export const generateShareUrl = (state: AppState): string => {
  const base64 = encodeStateToBase64(state);
  const baseUrl = globalThis.location.origin + globalThis.location.pathname;
  return `${baseUrl}#/shared/${base64}`;
};
