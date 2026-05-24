import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({ baseURL: `${API_URL}/api/chat` });
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getConversations = () =>
  api.get("/conversations", { headers: authHeaders() });

export const startConversation = (partnerId) =>
  api.post("/conversations", { partnerId }, { headers: authHeaders() });

export const getMessages = (conversationId, params = {}) =>
  api.get(`/${conversationId}/messages`, { headers: authHeaders(), params });

export const sendMessage = (conversationId, text) =>
  api.post(`/${conversationId}/messages`, { text }, { headers: authHeaders() });

export const getChatUnreadCount = () =>
  api.get("/unread", { headers: authHeaders() });
