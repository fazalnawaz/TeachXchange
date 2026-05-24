import { useEffect, useRef, useState } from "react";
import { Send, Smile } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import {
  sendMessage as sendMessageApi,
  getMessages,
} from "../../services/chatService";

const EMOJIS = ["😀", "👍", "🎉", "💡", "🔥", "✅", "📚", "🙌", "💜", "⭐"];

function getCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id ? String(payload.id) : null;
  } catch {
    return null;
  }
}

export default function ChatWindow({ conversation, onMessageReceived }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!conversation?._id) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getMessages(conversation._id);
        if (!cancelled) setMessages(data.data || []);
      } catch {
        if (!cancelled) setMessages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversation?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!socket || !conversation?._id) return undefined;

    socket.emit("conversation:join", { conversationId: conversation._id });

    const onMessage = (msg) => {
      if (String(msg.conversationId) !== String(conversation._id)) return;
      const currentUserId = getCurrentUserId();
      const isMine =
        msg.isMine === true ||
        (currentUserId && String(msg.senderId) === currentUserId);
      if (isMine) return;

      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, { ...msg, isMine: false }];
      });
      onMessageReceived?.();
    };

    const onTyping = ({ conversationId, isTyping: active }) => {
      if (String(conversationId) === String(conversation._id)) {
        setTyping(active);
      }
    };

    socket.on("chat:message", onMessage);
    socket.on("chat:typing", onTyping);

    return () => {
      socket.emit("conversation:leave", { conversationId: conversation._id });
      socket.off("chat:message", onMessage);
      socket.off("chat:typing", onTyping);
    };
  }, [socket, conversation?._id, onMessageReceived]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !conversation?._id) return;

    setSending(true);
    setText("");
    setShowEmoji(false);

    try {
      if (socket?.connected) {
        socket.emit("chat:send", { conversationId: conversation._id, text: trimmed }, (res) => {
          if (res?.success && res.message) {
            const sent = { ...res.message, isMine: true };
            setMessages((prev) => {
              if (prev.some((m) => String(m._id) === String(sent._id))) return prev;
              return [...prev, sent];
            });
          }
        });
      } else {
        const { data } = await sendMessageApi(conversation._id, trimmed);
        setMessages((prev) => [...prev, data.data]);
      }
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (value) => {
    setText(value);
    if (!socket || !conversation?._id) return;
    socket.emit("chat:typing", { conversationId: conversation._id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("chat:typing", { conversationId: conversation._id, isTyping: false });
    }, 1200);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-950">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
          {(conversation.partner?.name || "P").charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {conversation.partner?.name}
          </p>
          <p className="text-xs text-gray-500">
            {conversation.partnerOnline ? "Online" : "Offline"}
            {typing && " · typing..."}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                msg.isMine
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.isMine ? "text-purple-100" : "text-gray-400"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        {showEmoji && (
          <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
            {EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                className="text-xl hover:scale-110 transition"
                onClick={() => setText((t) => t + em)}
              >
                {em}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Smile size={20} />
          </button>
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
