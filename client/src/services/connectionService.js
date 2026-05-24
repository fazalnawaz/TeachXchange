import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({ baseURL: `${API_URL}/api/connections` });
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getConnections = (status = "accepted") =>
  api.get("/", { headers: authHeaders(), params: { status } });

export const getPendingConnections = () =>
  api.get("/pending", { headers: authHeaders() });
