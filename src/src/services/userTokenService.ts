import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@user_token";

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveToken = async (token: string | null): Promise<void> => {
  try {
    if (token === null) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    // silent error
  }
};

export const deleteToken = async (): Promise<void> => {
  await saveToken(null);
};
