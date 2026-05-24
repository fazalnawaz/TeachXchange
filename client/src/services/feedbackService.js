import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({ baseURL: `${API_URL}/api/feedback` });
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const submitFeedback = (sessionId, payload) =>
  api.post(`/session/${sessionId}`, payload, { headers: authHeaders() });

export const getSessionFeedback = (sessionId) =>
  api.get(`/session/${sessionId}`, { headers: authHeaders() });
