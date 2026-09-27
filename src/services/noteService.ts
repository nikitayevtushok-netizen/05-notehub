import axios, { AxiosHeaders, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { Note, NoteTag } from '../types/note';

const API_BASE_URL = 'https://notehub-public.goit.study/api';
const TOKEN_STORAGE_KEY = 'notehub-auth-token';
const DEFAULT_EMAIL = 'user@example.com';

interface AuthTokenResponse {
  token: string;
}

const authApi = axios.create({
  baseURL: API_BASE_URL,
});

const noteApi = axios.create({
  baseURL: API_BASE_URL,
});

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
};

export const createAuthToken = async (
  email: string = DEFAULT_EMAIL,
): Promise<string> => {
  const response: AxiosResponse<AuthTokenResponse> = await authApi.post(
    '/auth',
    { email },
  );

  const token = response.data.token;
  saveToken(token);

  return token;
};

const ensureAuthToken = async (): Promise<string> => {
  const storedToken = getStoredToken();

  if (storedToken) {
    return storedToken;
  }

  return createAuthToken();
};

noteApi.interceptors.request.use(async (config) => {
  const token = await ensureAuthToken();

  config.headers = AxiosHeaders.from({
    ...(config.headers ?? {}),
    Authorization: `Bearer ${token}`,
  });

  return config;
});

noteApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const token = await createAuthToken();
      originalRequest.headers = AxiosHeaders.from({
        ...(originalRequest.headers ?? {}),
        Authorization: `Bearer ${token}`,
      });

      return noteApi(originalRequest);
    }

    return Promise.reject(error);
  },
);

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tag: NoteTag;
}

export const fetchNotes = async (
  params: FetchNotesParams,
): Promise<FetchNotesResponse> => {
  const response: AxiosResponse<FetchNotesResponse> = await noteApi.get(
    '/notes',
    { params },
  );

  return response.data;
};

export const createNote = async (
  payload: CreateNotePayload,
): Promise<Note> => {
  const response: AxiosResponse<Note> = await noteApi.post('/notes', payload);

  return response.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await noteApi.delete(`/notes/${id}`);

  return response.data;
};
