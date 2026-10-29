import {
  Building2,
  Mail,
  Phone,
  MoreVertical,
  Pencil,
  Eye,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

export default function ClientCard({
  client,
  onEdit,
  onView,
}) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] =
    useState(false);

  if (!client) {
    return null;
  }

  const initials =
    client.name
      ?.split(" ")
      .map(
        (part) =>
          part.charAt(0)
      )
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CL";

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -3,
      }}
      className="group relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* MENU */}

      <div className="absolute right-4 top-4">
        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              (value) => !value
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <MoreVertical size={17} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: -5,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -5,
              }}
              className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onView?.(client);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Eye size={14} />
                View
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.(client);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Pencil size={14} />
                Edit
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HEADER */}

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
          {initials}
        </div>

        <div className="min-w-0 pr-8">
          <Link
            to={`/admin/clients/${client.id}`}
            className="block truncate text-base font-bold text-slate-900 hover:text-slate-600"
          >
            {client.name}
          </Link>

          <p className="mt-0.5 truncate text-xs text-slate-400">
            {client.company ||
              "Business client"}
          </p>
        </div>
      </div>

      {/* DETAILS */}

      <div className="mt-5 space-y-2.5">
        {client.email && (
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <Mail
              size={14}
              className="shrink-0 text-slate-400"
            />

            <span className="truncate">
              {client.email}
            </span>
          </div>
        )}

        {client.phone && (
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <Phone
              size={14}
              className="shrink-0 text-slate-400"
            />

            <span>
              {client.phone}
            </span>
          </div>
        )}

        {client.address && (
          <div className="flex items-start gap-2.5 text-xs leading-5 text-slate-500">
            <Building2
              size={14}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <span className="line-clamp-2">
              {client.address}
            </span>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Total billed
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            ₹
            {Number(
              client.totalBilled || 0
            ).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/admin/clients/${client.id}`
            )
          }
          className="text-xs font-semibold text-slate-600 transition hover:text-slate-950"
        >
          View client →
        </button>
      </div>
    </motion.div>
  );
}