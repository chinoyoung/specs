// Firestore configuration storage utility
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTIONS = {
  CONFIGS: "screenshot_configs",
};

/**
 * Save a screenshot configuration to Firestore
 * @param {Object} config - The configuration to save
 * @param {string} userId - The user ID who owns this configuration
 * @param {string} name - A friendly name for this configuration
 * @param {string} description - Optional description of this configuration
 * @returns {Promise<string>} - The ID of the saved configuration
 */
export const saveConfiguration = async (
  config,
  userId,
  name,
  description = ""
) => {
  try {
    const configData = {
      name,
      description,
      config,
      userId,
      isDefault: false, // By default, not the default configuration
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.CONFIGS),
      configData
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving configuration:", error);
    throw error;
  }
};

/**
 * Update an existing screenshot configuration
 * @param {string} configId - The ID of the configuration to update
 * @param {Object} config - The updated configuration
 * @param {string} name - Updated name
 * @param {string} description - Updated description
 * @returns {Promise<void>}
 */
export const updateConfiguration = async (
  configId,
  config,
  name,
  description
) => {
  try {
    const configRef = doc(db, COLLECTIONS.CONFIGS, configId);
    await updateDoc(configRef, {
      config,
      name,
      description,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating configuration:", error);
    throw error;
  }
};

/**
 * Delete a configuration
 * @param {string} configId - The ID of the configuration to delete
 * @returns {Promise<void>}
 */
export const deleteConfiguration = async (configId) => {
  try {
    const configRef = doc(db, COLLECTIONS.CONFIGS, configId);
    await deleteDoc(configRef);
  } catch (error) {
    console.error("Error deleting configuration:", error);
    throw error;
  }
};

/**
 * Set a configuration as the default for a user
 * @param {string} configId - The ID of the configuration to set as default
 * @param {string} userId - The user ID
 * @returns {Promise<void>}
 */
export const setDefaultConfiguration = async (configId, userId) => {
  try {
    // First, clear any existing default configs for this user
    const userConfigsQuery = query(
      collection(db, COLLECTIONS.CONFIGS),
      where("userId", "==", userId),
      where("isDefault", "==", true)
    );

    const existingDefaults = await getDocs(userConfigsQuery);

    // Create an array of promises to update each document
    const updatePromises = existingDefaults.docs.map((doc) =>
      updateDoc(doc.ref, { isDefault: false })
    );

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Now set the new default
    const configRef = doc(db, COLLECTIONS.CONFIGS, configId);
    await updateDoc(configRef, { isDefault: true });
  } catch (error) {
    console.error("Error setting default configuration:", error);
    throw error;
  }
};

/**
 * Get all configurations for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of configuration objects
 */
export const getUserConfigurations = async (userId) => {
  try {
    const configsQuery = query(
      collection(db, COLLECTIONS.CONFIGS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(configsQuery);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to regular dates for easier handling
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error getting user configurations:", error);
    throw error;
  }
};

/**
 * Get a specific configuration by ID
 * @param {string} configId - The ID of the configuration to retrieve
 * @returns {Promise<Object|null>} - The configuration object or null if not found
 */
export const getConfigurationById = async (configId) => {
  try {
    const configRef = doc(db, COLLECTIONS.CONFIGS, configId);
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      const data = configSnap.data();
      return {
        id: configSnap.id,
        ...data,
        // Convert Firestore Timestamps to regular dates
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting configuration:", error);
    throw error;
  }
};

/**
 * Get the default configuration for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} - The default configuration or null if none exists
 */
export const getDefaultConfiguration = async (userId) => {
  try {
    const defaultConfigQuery = query(
      collection(db, COLLECTIONS.CONFIGS),
      where("userId", "==", userId),
      where("isDefault", "==", true)
    );

    const snapshot = await getDocs(defaultConfigQuery);

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      // Convert Firestore Timestamps to regular dates
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error("Error getting default configuration:", error);
    throw error;
  }
};
