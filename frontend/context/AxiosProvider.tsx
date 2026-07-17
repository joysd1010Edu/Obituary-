"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AxiosInstance } from "axios";
import type { ReactNode } from "react";

import { useAppContext } from "./AppContext";

const AxiosContext = createContext<AxiosInstance | undefined>(undefined);

export function AxiosProvider({ children }: { children: ReactNode }) {
  const { accessToken, refreshToken, logout, setSession } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  const api = useMemo(() => {
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
      withCredentials: true,
      timeout: 60000,
      headers: {
        Accept: "application/json",
      },
    });
  }, []);

  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? require("react").useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (!(config as any)._retry) {
        // Fallback to accessToken from context if localStorage fails
        const token = typeof window !== "undefined" 
          ? (localStorage.getItem("obituary.accessToken") || accessToken)
          : accessToken;
          
        if (token) {
          config.headers = config.headers ?? {};
          (config.headers as Record<string, string>).Authorization =
            `Bearer ${token}`;
        }
      }

      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error?.response?.status === 401 && !(originalRequest as any)._retry) {
          (originalRequest as any)._retry = true;
          try {
            const refreshResponse = await api.post("/auth/refresh", {
              refreshToken,
            });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = refreshResponse.data;
            
            setSession(
              {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userImage: user.profilePhotoUrl || "/Source/person.jpg",
                role: user.role,
              },
              newAccessToken,
              newRefreshToken,
            );
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            logout();

            if (
              pathname !== "/login" &&
              pathname !== "/register" &&
              pathname !== "/forgot-password"
            ) {
              router.replace("/login");
            }
            
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, api, logout, pathname, router]);

  return <AxiosContext.Provider value={api}>{children}</AxiosContext.Provider>;
}

export function useAxios() {
  const api = useContext(AxiosContext);

  if (!api) {
    throw new Error("useAxios must be used within AxiosProvider");
  }

  return api;
}
