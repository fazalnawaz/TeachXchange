import Navbar from "../components/Navbar";
import Button from "../components/Button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

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
      </main>
    </div>
  );
}
