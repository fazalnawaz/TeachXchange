import { io } from "socket.io-client";
import { API_URL } from "../config";

let socket = null;

export function connectSocket() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (socket?.connected) return socket;

  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
