import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";

export default function AchievementListener() {
  const { socket } = useSocket();
  const { showToast } = useToast();

  useEffect(() => {
    if (!socket) return undefined;

    const onAchievement = ({ badge, points }) => {
      if (badge) {
        showToast(`Badge unlocked: ${badge.name}!`, "success");
      } else if (points) {
        showToast(`+${points} points earned!`, "success");
      }
    };

    const onConnected = () => {
      showToast("You are now connected with your learning partner", "success");
    };

    socket.on("gamification:achievement", onAchievement);
    socket.on("connection:accepted", onConnected);
    socket.on("notification:new", () => {
      window.dispatchEvent(new CustomEvent("notifications:refresh"));
    });

    return () => {
      socket.off("gamification:achievement", onAchievement);
      socket.off("connection:accepted", onConnected);
    };
  }, [socket, showToast]);

  return null;
}
