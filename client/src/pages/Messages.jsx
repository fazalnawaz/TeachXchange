import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import { getConversations, startConversation } from "../services/chatService";
import { useToast } from "../context/ToastContext";

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const openedPartnerRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await getConversations();
      setConversations(data.data || []);
    } catch {
      showToast("Failed to load conversations", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const conversationId = location.state?.conversationId;
    const partnerId = location.state?.partnerId;
    if (!conversationId && !partnerId) return;

    const openKey = conversationId || partnerId;
    if (openedPartnerRef.current === openKey) return;
    openedPartnerRef.current = openKey;

    (async () => {
      try {
        if (conversationId) {
          const { data } = await getConversations();
          const list = data.data || [];
          setConversations(list);
          const existing = list.find((c) => String(c._id) === String(conversationId));
          if (existing) {
            setActive(existing);
          } else if (partnerId) {
            const { data: startData } = await startConversation(partnerId);
            await loadConversations();
            setActive({
              _id: startData.data._id,
              partner: location.state?.partnerName
                ? { _id: partnerId, name: location.state.partnerName }
                : { _id: partnerId, name: "Partner" },
            });
          }
        } else {
          const { data } = await startConversation(partnerId);
          const conv = data.data;
          await loadConversations();
          setActive({
            _id: conv._id,
            partner: location.state?.partnerName
              ? { _id: partnerId, name: location.state.partnerName }
              : { _id: partnerId, name: "Partner" },
          });
        }
        navigate(location.pathname, { replace: true, state: {} });
      } catch (err) {
        openedPartnerRef.current = null;
        showToast(err.response?.data?.message || "Could not open chat", "error");
      }
    })();
  }, [
    location.state?.partnerId,
    location.state?.conversationId,
    loadConversations,
    navigate,
    location.pathname,
    showToast,
    location.state?.partnerName,
  ]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      (c.partner?.name || "").toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const handleSelect = (conv) => setActive(conv);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] glass-card rounded-2xl overflow-hidden flex border border-gray-100 dark:border-gray-800 shadow-lg">
        <ChatSidebar
          conversations={filtered}
          activeId={active?._id}
          onSelect={handleSelect}
          search={search}
          onSearchChange={setSearch}
        />
        <ChatWindow
          conversation={active}
          onMessageReceived={loadConversations}
        />
      </div>
    </Layout>
  );
}
