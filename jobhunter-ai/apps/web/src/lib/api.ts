import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Timeout alto por default: a cadeia gateway -> ai-service -> Groq pode
// demorar (busca com match de IA, geracao de CV). Ajuste via env se necessario.
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 60000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_TIMEOUT,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh_token");

        // Tentar renovar o token uma vez e refazer a requisicao
        if (refreshToken) {
          originalRequest._retry = true;
          try {
            const res = await apiClient.post("/api/v1/auth/refresh", {
              refresh_token: refreshToken,
            });
            localStorage.setItem("access_token", res.data.access_token);
            // O interceptor de request re-adiciona o Authorization com o novo token
            return apiClient(originalRequest);
          } catch {
            // Refresh falha: limpa sessao e volta para o login
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login?expired=1";
          }
        } else {
          localStorage.removeItem("access_token");
          window.location.href = "/login?expired=1";
        }
      }
    }

    return Promise.reject(error);
  }
);
