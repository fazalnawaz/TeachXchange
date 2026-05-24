import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({ baseURL: `${API_URL}/api/verification` });

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const getVerificationStats = () =>
  api.get("/stats", { headers: authHeaders() });

export const getUnverifiedSkills = () =>
  api.get("/skills/unverified", { headers: authHeaders() });

export const getAllSkills = () =>
  api.get("/skills", { headers: authHeaders() });

export const startQuiz = (skillId) =>
  api.post("/quiz/start", { skillId }, { headers: authHeaders() });

export const submitQuiz = (attemptId, answers, timeTakenSeconds) =>
  api.post(
    "/quiz/submit",
    { attemptId, answers, timeTakenSeconds },
    { headers: authHeaders() }
  );

export const getNotifications = () =>
  api.get("/notifications", { headers: authHeaders() });

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`, {}, { headers: authHeaders() });

export const markAllNotificationsRead = () =>
  api.patch("/notifications/read-all", {}, { headers: authHeaders() });
