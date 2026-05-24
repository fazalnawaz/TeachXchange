import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({ baseURL: `${API_URL}/api/notifications` });
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getNotifications = (limit = 30) =>
  api.get("/", { headers: authHeaders(), params: { limit } });

export const getUnreadCount = () =>
  api.get("/unread-count", { headers: authHeaders() });

export const markNotificationRead = (id) =>
  api.patch(`/${id}/read`, {}, { headers: authHeaders() });

export const markAllNotificationsRead = () =>
  api.patch("/read-all", {}, { headers: authHeaders() });
