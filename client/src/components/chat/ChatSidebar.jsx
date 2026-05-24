import { Search, Circle } from "lucide-react";

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  search,
  onSearchChange,
}) {
  return (
    <aside className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 text-center">
            No conversations yet. Connect with a match to start chatting.
          </p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv._id}
              type="button"
              onClick={() => onSelect(conv)}
              className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition border-b border-gray-50 dark:border-gray-800 ${
                activeId === conv._id ? "bg-purple-50 dark:bg-purple-900/30" : ""
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {(conv.partner?.name || "?").charAt(0)}
                </div>
                {conv.partnerOnline && (
                  <Circle
                    size={10}
                    className="absolute -bottom-0.5 -right-0.5 text-green-500 fill-green-500 bg-white dark:bg-gray-900 rounded-full"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                    {conv.partner?.name || "Partner"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {conv.lastMessage?.text || "Start a conversation"}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
