import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Users, FileSignature, Building2, Loader2 } from "lucide-react";
import dashboardService from "../../services/dashboardService";

export default function GlobalSearch({ query, onClose, onClear }) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardService.search(query);
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.results)
          ? response.results
          : [];
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!query) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default"
      />

      <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 max-h-96 overflow-y-auto">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-4 text-slate-400">
              <Loader2 size={16} className="animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result) => {
                const isClient = result.type === "client";
                const isVendor = result.type === "vendor";
                const isInvoice = result.type === "invoice";
                
                let Icon = FileSignature;
                if (isClient) Icon = Users;
                if (isVendor) Icon = Building2;
                if (isInvoice) Icon = FileText;

                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => {
                      onClear();
                      navigate(`/admin/${result.type}s/${result.id}`);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isClient ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" :
                      isVendor ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" :
                      isInvoice ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      <Icon size={14} />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {result.title}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {result.subtitle}
                      </p>
                    </div>
                    
                    <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {result.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
