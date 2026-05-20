import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <header className="w-full border-b border-[#e5e7eb] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Logo to="/dashboard" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6b7280] hidden sm:inline">
              {userEmail}
            </span>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-10">
        <h1 className="text-3xl font-bold text-[#111827] mb-2">
          {userName ? `Welcome, ${userName.split(" ")[0]}!` : "Welcome back!"}
        </h1>
        <p className="text-[#6b7280] mb-10">
          Your TeachXchange dashboard — manage your learning journey.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Find Skills to Learn",
              desc: "Browse peers offering skills you want to acquire.",
            },
            {
              title: "Offer Your Skills",
              desc: "Share what you know and help others grow.",
            },
            {
              title: "My Sessions",
              desc: "View upcoming and past learning exchanges.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#111827] mb-2">
                {card.title}
              </h2>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
