import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Download,
  // Building2,
  // Lock,
  // Globe,
  // Users,
} from "lucide-react";
import { getDocuments } from "../../api/documents";
import toast from "react-hot-toast";

export default function ClientDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const data = await getDocuments({ search });
        setDocuments(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [search]);

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <FileText className="text-blue-600 dark:text-blue-500" size={26} />
          Project Documents & Contracts
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Access your specifications, statements of work, and shared project assets.
        </p>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30 shadow-xs">
          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No documents found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Documents shared by your project manager will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-xs transition-all hover:shadow-md dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{doc.title}</h4>
                    <span className="text-[11px] text-slate-500">{doc.file_size || "Document"}</span>
                  </div>
                </div>

                {doc.project_title && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Project: <strong className="text-slate-700 dark:text-slate-300">{doc.project_title}</strong>
                  </p>
                )}
              </div>

              <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</span>
                <a
                  href={doc.file}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Download size={14} /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
