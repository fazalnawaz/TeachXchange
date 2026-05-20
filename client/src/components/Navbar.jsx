import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import Button from "./Button";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-[#f3f4f6] bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[#374151] font-medium text-sm hover:text-[#111827] bg-transparent border-0 cursor-pointer"
          >
            Login
          </button>
          <Button to="/signup" variant="primary">
            Get Started
          </Button>
        </nav>
      </div>
    </header>
  );
}
