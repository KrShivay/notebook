export const getLocalStorageItem = (key: string, defaultValue = null) => {
  try {
    const storedValue = localStorage.getItem(key);

    // Return the default value if the key doesn't exist in localStorage
    if (storedValue === null) {
      return defaultValue;
    }

    // Parse the stored value as JSON
    return JSON.parse(storedValue);
  } catch (error) {
    return defaultValue;
  }
};

export const setLocalStorageItem = (key: string, value: any) => {
  try {
    // Stringify the value before saving to handle various data types
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(
      `Error saving value to localStorage for key "${key}":`,
      error
    );
  }
};
