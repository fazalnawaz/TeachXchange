export default function AuthLayout({ children }) {
  return (
    <div className="auth-page-bg flex items-center justify-center min-h-screen px-4 py-10">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-8 py-10">
        {children}
      </div>
    </div>
  );
}
