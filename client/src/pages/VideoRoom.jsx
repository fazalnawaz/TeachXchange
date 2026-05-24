import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { getZegoSessionInfo, startSession, completeSession } from "../services/sessionService";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, Clock } from "lucide-react";

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoRoom() {
  const { id } = useParams();
  const containerRef = useRef(null);
  const zpRef = useRef(null);
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [sessionInfo, setSessionInfo] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let destroyed = false;

    const init = async () => {
      try {
        const { data } = await getZegoSessionInfo(id);
        const info = data.data;
        setSessionInfo(info);
        await startSession(id);

        const appID = parseInt(
          import.meta.env.VITE_ZEGO_APP_ID || info.appId || "0",
          10
        );
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        if (!appID || !serverSecret) {
          setError(
            "Add VITE_ZEGO_APP_ID and VITE_ZEGO_SERVER_SECRET to client .env (get keys from zegocloud.com)"
          );
          return;
        }

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          info.roomId,
          info.userId,
          info.userName || "User"
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        if (!destroyed && containerRef.current) {
          zp.joinRoom({
            container: containerRef.current,
            sharedLinks: [],
            scenario: {
              mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
            showScreenSharingButton: true,
            showPreJoinView: true,
            turnOnCameraWhenJoining: true,
            turnOnMicrophoneWhenJoining: true,
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Could not start video session");
      }
    };

    init();

    return () => {
      destroyed = true;
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [id]);

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await completeSession(id);
      showToast("Session ended — points and badges updated!", "success");
      if (zpRef.current) zpRef.current.destroy();
      window.location.href = `/sessions?feedback=${id}`;
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to end session", "error");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-gray-950 border-b border-gray-800">
        <Link
          to="/sessions"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm"
        >
          <ArrowLeft size={18} />
          Back to Sessions
        </Link>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm text-gray-400 font-mono">
            <Clock size={14} />
            {formatDuration(elapsed)}
          </span>
          <button
            type="button"
            onClick={handleEndSession}
            disabled={ending}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {ending ? "Ending..." : "End & Complete Session"}
          </button>
        </div>
      </header>

      {error ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center text-white">
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-sm text-gray-400">
              Room: {sessionInfo?.roomId || "—"}
            </p>
            <Link
              to="/sessions"
              className="inline-block mt-6 px-5 py-2.5 bg-purple-600 rounded-xl text-sm font-semibold"
            >
              Return to Sessions
            </Link>
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="flex-1 w-full min-h-[calc(100vh-56px)]" />
      )}
    </div>
  );
}
