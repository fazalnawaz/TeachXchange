import Layout from "../components/Layout";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const userName = localStorage.getItem("userName");

  return (
    <Layout>
      <div className="max-w-7xl mx-auto w-full py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#111827] mb-2">
            {userName ? `Welcome, ${userName.split(" ")[0]}!` : "Welcome back!"}
          </h1>
          <p className="text-[#6b7280]">
            Your TeachXchange dashboard — manage your learning journey.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Find Skills to Learn",
              desc: "Browse peers offering skills you want to acquire.",
              to: "/browse",
            },
            {
              title: "Offer Your Skills",
              desc: "Share what you know and help others grow.",
              to: "/add-skill",
            },
            {
              title: "Verify a Skill",
              desc: "Submit your skill for verification and earn badges.",
              to: "/skill-verification",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#111827] mb-2">
                {card.title}
              </h2>
              <p className="text-sm text-[#6b7280] leading-relaxed mb-4">
                {card.desc}
              </p>
              <Link
                to={card.to}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
              >
                Explore
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
