import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GeneratingQuiz from "../components/verification/GeneratingQuiz";
import SkillTest from "../components/verification/SkillTest";
import ResultModal from "../components/verification/ResultModal";
import {
  getVerificationStats,
  getUnverifiedSkills,
  previewSkillCategory,
  startQuiz,
  submitQuiz,
} from "../services/verificationService";
import CategoryBadge from "../components/verification/CategoryBadge";
import SkillBadge from "../components/verification/SkillBadge";
import {
  Award,
  ArrowLeft,
  Brain,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Zap,
  AlertCircle,
} from "lucide-react";

// Steps: select | generating | quiz | done
export default function SkillVerification() {
  const navigate = useNavigate();
  const [step, setStep] = useState("select");
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [categoryPreview, setCategoryPreview] = useState(null);

  useEffect(() => {
    if (!selectedSkill?._id) {
      setCategoryPreview(null);
      return;
    }
    previewSkillCategory(selectedSkill._id)
      .then(({ data }) => setCategoryPreview(data))
      .catch(() => setCategoryPreview(null));
  }, [selectedSkill?._id]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [skillsRes, statsRes] = await Promise.all([
        getUnverifiedSkills(),
        getVerificationStats(),
      ]);
      setSkills(skillsRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load verification data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartQuiz = async () => {
    if (!selectedSkill) {
      setError("Please select a skill to verify");
      return;
    }

    setError("");
    setStep("generating");

    try {
      const { data } = await startQuiz(selectedSkill._id);
      setQuiz({
        attemptId: data.attemptId,
        skillName: data.skillName,
        skillKey: data.skillKey,
        skillCategory: data.skillCategory,
        categoryLabel: data.categoryLabel,
        questions: data.questions,
        timeLimitSeconds: data.timeLimitSeconds,
        passThreshold: data.passThreshold ?? 70,
      });
      setStep("quiz");
    } catch (err) {
      setStep("select");
      setError(err.response?.data?.message || "Failed to generate AI quiz");
    }
  };

  const handleSubmitQuiz = async (answers, timeTakenSeconds) => {
    setSubmitting(true);
    setError("");

    try {
      const { data } = await submitQuiz(
        quiz.attemptId,
        answers,
        timeTakenSeconds
      );
      setResult(data);
      setStep("done");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelQuiz = () => {
    setQuiz(null);
    setStep("select");
  };

  const handleCloseResult = () => {
    setResult(null);
    setQuiz(null);
    setSelectedSkill(null);
    setStep("select");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Loading verification hub...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {step === "select" && (
          <>
            <div className="mb-8">
              <button
                onClick={() => navigate("/dashboard")}
                className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition"
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    AI Skill Verification
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                    Each quiz is generated live by Hugging Face AI (Mistral / FLAN)
                    for your exact skill and category — no stored question bank.
                    Score 70%+ to earn a verified badge.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-sm font-medium text-purple-700 dark:text-purple-300">
                  <Brain size={18} />
                  Powered by AI
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-300">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Verified",
                  value: stats?.verifiedCount ?? 0,
                  icon: CheckCircle,
                  color: "text-green-600",
                  bg: "bg-green-100 dark:bg-green-900/30",
                },
                {
                  label: "Pending",
                  value: stats?.pendingCount ?? 0,
                  icon: Clock,
                  color: "text-orange-600",
                  bg: "bg-orange-100 dark:bg-orange-900/30",
                },
                {
                  label: "Trust Score",
                  value: `${stats?.trustScore ?? 0}%`,
                  icon: TrendingUp,
                  color: "text-blue-600",
                  bg: "bg-blue-100 dark:bg-blue-900/30",
                },
                {
                  label: "Points",
                  value: stats?.points ?? 0,
                  icon: Sparkles,
                  color: "text-purple-600",
                  bg: "bg-purple-100 dark:bg-purple-900/30",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="glass-card rounded-2xl p-5">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                      <Icon size={20} className={item.color} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                  </div>
                );
              })}
            </div>

            {/* How it works */}
            <div className="glass-card rounded-2xl p-6 mb-8 border border-purple-100 dark:border-purple-900/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Verification Workflow
                  </h2>
                  <ol className="mt-3 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm text-gray-600 dark:text-gray-400">
                    {[
                      "Select skill",
                      "Detect category",
                      "HF AI generates fresh MCQs",
                      "Timed assessment",
                      "Earn badge if ≥70%",
                    ].map((s, i) => (
                      <li key={s} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Skill selection */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Select a Skill to Verify
            </h2>

            {skills.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Award className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No skills pending verification
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
                  Add a teachable skill first, then return here for AI verification.
                </p>
                <button
                  onClick={() => navigate("/add-skill")}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition"
                >
                  Add a Skill
                </button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {skills.map((skill) => (
                    <button
                      key={skill._id}
                      type="button"
                      onClick={() => setSelectedSkill(skill)}
                      className={`text-left glass-card rounded-2xl p-5 border-2 transition-all hover:shadow-lg ${
                        selectedSkill?._id === skill._id
                          ? "border-purple-500 shadow-md ring-2 ring-purple-200 dark:ring-purple-800"
                          : "border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {skill.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {skill.category} • {skill.experience || 0} yrs •{" "}
                            {skill.proficiency}
                          </p>
                          {selectedSkill?._id === skill._id && categoryPreview && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <SkillBadge
                                skillKey={categoryPreview.skillKey}
                                skillName={categoryPreview.displayName || skill.name}
                                size="sm"
                              />
                              <CategoryBadge
                                categoryId={categoryPreview.skillCategory}
                                categoryLabel={categoryPreview.categoryLabel}
                                size="sm"
                              />
                            </div>
                          )}
                          {skill.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                              {skill.description}
                            </p>
                          )}
                        </div>
                        {selectedSkill?._id === skill._id && (
                          <CheckCircle className="text-purple-600 shrink-0" size={24} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleStartQuiz}
                  disabled={!selectedSkill}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                >
                  <Brain size={20} />
                  Start AI Verification Quiz
                </button>
              </>
            )}
          </>
        )}

        {step === "generating" && (
          <GeneratingQuiz
            skillName={selectedSkill?.name}
            profileCategory={selectedSkill?.category}
          />
        )}

        {step === "quiz" && quiz && (
          <SkillTest
            quiz={quiz}
            onSubmit={handleSubmitQuiz}
            onCancel={handleCancelQuiz}
            submitting={submitting}
          />
        )}

        {step === "done" && result && (
          <ResultModal result={result} onClose={handleCloseResult} />
        )}
      </div>
    </Layout>
  );
}
