"use client";

/**
 * Utility functions for saving and loading configurations from local storage
 */

// Save configuration to local storage
export function saveConfiguration(key, config) {
  try {
    if (typeof window === "undefined") return false;

    localStorage.setItem(key, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error("Error saving configuration:", error);
    return false;
  }
}

// Load configuration from local storage
export function loadConfiguration(key) {
  try {
    if (typeof window === "undefined") return null;

    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading configuration:", error);
    return null;
  }
}

// Delete configuration from local storage
export function deleteConfiguration(key) {
  try {
    if (typeof window === "undefined") return false;

    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error deleting configuration:", error);
    return false;
  }
}
