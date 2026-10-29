import { ServerCrash, RefreshCw } from "lucide-react";

export default function ServerError() {
  const reload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ServerCrash size={34} />
        </div>

        <p className="mt-6 text-6xl font-black text-slate-200">
          500
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Server Error
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          Something went wrong on the server. Please try again.
        </p>

        <button
          onClick={reload}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          <RefreshCw size={17} />
          Try Again
        </button>

      </div>
    </div>
  );
}