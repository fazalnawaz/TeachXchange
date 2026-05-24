import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({ baseURL: `${API_URL}/api/sessions` });
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getSessions = (params = {}) =>
  api.get("/", { headers: authHeaders(), params });

export const getSession = (id) =>
  api.get(`/${id}`, { headers: authHeaders() });

export const scheduleSession = (payload) =>
  api.post("/", payload, { headers: authHeaders() });

export const confirmSession = (id) =>
  api.patch(`/${id}/confirm`, {}, { headers: authHeaders() });

export const startSession = (id) =>
  api.patch(`/${id}/start`, {}, { headers: authHeaders() });

export const completeSession = (id) =>
  api.patch(`/${id}/complete`, {}, { headers: authHeaders() });

export const getZegoSessionInfo = (id) =>
  api.get(`/${id}/zego`, { headers: authHeaders() });
