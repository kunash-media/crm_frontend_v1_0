import axiosInstance from "./axiosInstance";

export const loginApi = (mobile, password) =>
  axiosInstance.post("/auth/login", { mobile, password });

export const logoutApi = () => axiosInstance.post("/auth/logout");

export const refreshApi = () => axiosInstance.post("/auth/refresh");