"use client";

import crypto from "crypto";

/**
 * Gets the Gravatar URL for a given email address
 * @param {string} email - The email address to get the Gravatar for
 * @param {number} size - The size of the Gravatar in pixels (default: 80)
 * @param {string} defaultImage - The default image to use if no Gravatar exists (default: retro)
 * @returns {string} - The URL to the Gravatar
 */
export const getGravatarUrl = (email, size = 80, defaultImage = "retro") => {
  if (!email) return `https://gravatar.com/avatar/?s=${size}&d=${defaultImage}`;

  // Convert email to lowercase and trim whitespace
  const normalizedEmail = email.trim().toLowerCase();

  // Create an MD5 hash of the email address
  const hash = crypto.createHash("md5").update(normalizedEmail).digest("hex");

  // Return the Gravatar URL
  return `https://gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
};

/**
 * Gets a profile image URL for a user
 * If user has a photoURL, use that, otherwise use Gravatar
 * @param {object} user - The user object from Firebase Auth
 * @param {number} size - The size of the image in pixels
 * @returns {string} - The URL to the profile image
 */
export const getProfileImageUrl = (user, size = 80) => {
  // If no user, return default avatar
  if (!user) return `https://gravatar.com/avatar/?s=${size}&d=mp`;

  // If user has a photoURL (from Google auth, etc.), use that
  if (user.photoURL) return user.photoURL;

  // Otherwise, use Gravatar based on email
  return getGravatarUrl(user.email, size);
};

// For Next.js Image component optimization
export const profileImageLoader = ({ src, width }) => {
  return src;
};

/**
 * Updates a user's profile image (for demonstration purposes)
 * In a real application, this would upload the image to storage and update the user's profile
 * @param {object} user - The Firebase user object
 * @param {function} onComplete - Callback function to run after updating
 */
export const updateProfileImage = (user, onComplete) => {
  // This is a mockup function that would normally upload an image
  // In this demo, we'll just simulate by redirecting to Gravatar
  const gravatarUrl = "https://gravatar.com/emails/";

  // Open Gravatar in a new tab
  window.open(gravatarUrl, "_blank");

  if (onComplete) {
    onComplete();
  }
};
