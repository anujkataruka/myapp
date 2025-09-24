import axios from 'axios';
import Constants from 'expo-constants';

const baseURL = (Constants.expoConfig?.extra?.apiUrl as string) || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL });

export const setAuthToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

