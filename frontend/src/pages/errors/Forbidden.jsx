import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <ErrorPage
      code="401"
      icon={ShieldAlert}
      title="Authentication Required"
      message="You need to sign in before you can access this page."
      primaryAction="Go to Login"
      onPrimary={() => navigate("/login")}
      secondaryAction="Go Back"
      onSecondary={() => navigate(-1)}
    />
  );
}

function ErrorPage({
  code,
  icon: Icon,
  title,
  message,
  primaryAction,
  onPrimary,
  secondaryAction,
  onSecondary,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <Icon size={34} />
        </div>

        <p className="mt-6 text-6xl font-black text-slate-200">
          {code}
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          {message}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

          <button
            onClick={onPrimary}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <LogIn size={17} />
            {primaryAction}
          </button>

          <button
            onClick={onSecondary}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            {secondaryAction}
          </button>

        </div>

      </div>
    </div>
  );
}