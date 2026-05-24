import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { scheduleSession } from "../../services/sessionService";
import { useToast } from "../../context/ToastContext";

export default function ScheduleSessionModal({ partner, onClose, onScheduled }) {
  const { showToast } = useToast();
  const [title, setTitle] = useState("Skill Exchange Session");
  const [scheduledAt, setScheduledAt] = useState("");
  const [teachSkill, setTeachSkill] = useState("");
  const [learnSkill, setLearnSkill] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partner?._id || !scheduledAt) return;
    setLoading(true);
    try {
      await scheduleSession({
        partnerId: partner._id,
        title,
        scheduledAt,
        teachSkill,
        learnSkill,
        notes,
        durationMinutes: 60,
      });
      showToast("Session proposed — your partner will be notified", "success");
      onScheduled?.();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to schedule", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="text-purple-600" size={20} />
            Schedule Session
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-500">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          With {partner?.name || "your partner"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            placeholder="Session title"
            required
          />
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            required
          />
          <input
            value={teachSkill}
            onChange={(e) => setTeachSkill(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            placeholder="Skill you will teach"
          />
          <input
            value={learnSkill}
            onChange={(e) => setLearnSkill(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            placeholder="Skill you will learn"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            placeholder="Notes for your partner"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Scheduling..." : "Propose Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
