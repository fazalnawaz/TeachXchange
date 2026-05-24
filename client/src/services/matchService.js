import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({ baseURL: `${API_URL}/api/matches` });

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getMatches = (params = {}) =>
  api.get("/", { headers: authHeaders(), params });

export const refreshMatches = () =>
  api.post("/refresh", {}, { headers: authHeaders() });

export const getMatchStats = () =>
  api.get("/stats", { headers: authHeaders() });

export const getMatchRequests = () =>
  api.get("/requests", { headers: authHeaders() });

export const getMatchHistory = () =>
  api.get("/history", { headers: authHeaders() });

export const sendMatchRequest = (toUserId, message = "") =>
  api.post("/request", { toUserId, message }, { headers: authHeaders() });

export const acceptMatchRequest = (requestId) =>
  api.patch(`/request/${requestId}/accept`, {}, { headers: authHeaders() });

export const rejectMatchRequest = (requestId) =>
  api.patch(`/request/${requestId}/reject`, {}, { headers: authHeaders() });
