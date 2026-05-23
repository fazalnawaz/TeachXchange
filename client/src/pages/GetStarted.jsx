import { Shield, Users, Video, Trophy } from "lucide-react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

const FEATURES = [
  {
    icon: Shield,
    iconClass: "text-blue-500",
    title: "AI Skill Verification",
    description:
      "Automated skill testing ensures authentic expertise from all teachers.",
  },
  {
    icon: Users,
    iconClass: "text-purple-500",
    title: "Smart Matchmaking",
    description:
      "Connect with learners and teachers based on your skills and interests.",
  },
  {
    icon: Video,
    iconClass: "text-pink-500",
    title: "Live Video Sessions",
    description:
      "Conduct real-time learning sessions with integrated video calls.",
  },
  {
    icon: Trophy,
    iconClass: "text-blue-500",
    title: "Gamification",
    description:
      "Earn points, badges, and climb the leaderboard as you teach and learn.",
  },
];

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.15] tracking-tight text-[#111827] mb-6">
                Learn &amp; Teach Skills
                <br />
                <span className="text-[#2563eb]">For Free</span>
              </h1>

              <p className="text-[#6b7280] text-lg leading-relaxed max-w-lg mb-8">
                Exchange your skills with others. Teach what you know, learn what
                you need. Join our peer-to-peer learning community today.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button to="/signup" variant="primary" className="px-6 py-3">
                  Start Learning
                </Button>
                <Button variant="secondary" className="px-6 py-3">
                  Learn More
                </Button>
              </div>

              <p className="text-sm text-[#9ca3af] flex flex-wrap gap-x-6 gap-y-1">
                <span>✓ No payment required</span>
                <span>✓ AI-verified skills</span>
                <span>✓ Safe &amp; secure</span>
              </p>
            </div>

            <div className="relative">
              <img
                src={HERO_IMAGE}
                alt="Person learning on a laptop at a desk"
                className="w-full aspect-[4/3] object-cover rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
              />
            </div>
          </div>
        </div>

        <section
          className="py-16 lg:py-24"
          style={{
            background:
              "radial-gradient(ellipse at center, #f5f3ff 0%, #faf5ff 40%, #ffffff 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-3">
                Platform Features
              </h2>
              <p className="text-[#6b7280] text-lg">
                Everything you need for effective skill exchange
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map(({ icon: Icon, iconClass, title, description }) => (
                <div
                  key={title}
                  className="bg-white border border-[#f0f0f0] rounded-xl p-8 text-left"
                >
                  <Icon
                    className={`w-8 h-8 mb-5 stroke-[1.5] ${iconClass}`}
                    aria-hidden
                  />
                  <h3 className="text-lg font-bold text-[#111827] mb-2">
                    {title}
                  </h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
