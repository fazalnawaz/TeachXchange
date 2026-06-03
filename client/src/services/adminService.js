import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({ baseURL: `${API_URL}/api/admin` });

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const getAdminStats = () =>
  api.get("/stats", { headers: authHeaders() });

export const getUsers = (params = {}) =>
  api.get("/users", { headers: authHeaders(), params });

export const getUser = (id) =>
  api.get(`/users/${id}`, { headers: authHeaders() });

export const updateUserStatus = (id, accountStatus) =>
  api.patch(`/users/${id}/status`, { accountStatus }, { headers: authHeaders() });

export const updateUserRole = (id, role) =>
  api.patch(`/users/${id}/role`, { role }, { headers: authHeaders() });

export const deleteUser = (id) =>
  api.delete(`/users/${id}`, { headers: authHeaders() });

export const getVerifications = (params = {}) =>
  api.get("/verifications", { headers: authHeaders(), params });

export const getSessions = (params = {}) =>
  api.get("/sessions", { headers: authHeaders(), params });
