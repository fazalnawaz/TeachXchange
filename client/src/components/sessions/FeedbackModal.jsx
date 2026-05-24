import { useState } from "react";
import { Star, X } from "lucide-react";
import { submitFeedback } from "../../services/feedbackService";
import { useToast } from "../../context/ToastContext";

export default function FeedbackModal({ session, onClose, onSubmitted }) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitFeedback(session._id, {
        toUserId: session.partner._id,
        rating,
        comment,
      });
      showToast("Feedback submitted — +25 points!", "success");
      onSubmitted?.();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not submit feedback", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md glass-card rounded-2xl p-6">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Rate your session</h3>
          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          How was your exchange with {session.partner?.name}?
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1"
              >
                <Star
                  size={28}
                  className={
                    n <= rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience..."
            className="w-full px-3 py-2 rounded-xl border dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
