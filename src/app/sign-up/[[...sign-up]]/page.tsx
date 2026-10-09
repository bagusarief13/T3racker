import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4">
      <div className="text-center mb-6">
        <img
          src="/logo.png"
          alt="T3racker Logo"
          className="mx-auto h-16 w-16 rounded-2xl shadow-xl shadow-cyan-600/25 object-contain mb-3"
        />
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          T3racker
        </h1>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
          Timesheet Task & Overtime Tracker
        </p>
      </div>
      <SignUp />
    </div>
  );
}
