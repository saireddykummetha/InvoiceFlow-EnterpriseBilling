import {
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Mail,
  MoreHorizontal,
  Send,
  Trash2,
  CreditCard,
} from "lucide-react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Button from "../common/Button";

export default function InvoiceActions({
  invoice,
  onEdit,
  onSend,
  onPay,
  onDuplicate,
  onDelete,
  onDownload,
  onEmail,
  onMarkPaid,
  loading = false,
}) {
  const [open, setOpen] = useState(false);

  const status = String(
    invoice?.status || "draft"
  ).toLowerCase();

  const canSend =
    status === "draft";

  const canPay =
    ["sent", "pending", "partial", "overdue"].includes(
      status
    );

  const canMarkPaid =
    ["sent", "pending", "partial", "overdue"].includes(
      status
    );

  const isPaid =
    status === "paid";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onEdit && !isPaid && (
        <Button
          variant="secondary"
          size="sm"
          icon={<Edit3 size={15} />}
          onClick={onEdit}
          disabled={loading}
        >
          Edit
        </Button>
      )}

      {canSend && onSend && (
        <Button
          variant="primary"
          size="sm"
          icon={<Send size={15} />}
          onClick={onSend}
          loading={loading}
        >
          Send invoice
        </Button>
      )}

      {canPay && onPay && (
        <Button
          variant="success"
          size="sm"
          icon={<CreditCard size={15} />}
          onClick={onPay}
          disabled={loading}
        >
          Pay now
        </Button>
      )}

      {isPaid && (
        <div className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-700">
          <CheckCircle2 size={15} />
          Paid
        </div>
      )}

      {onEmail && (
        <Button
          variant="secondary"
          size="sm"
          icon={<Mail size={15} />}
          onClick={onEmail}
          disabled={loading}
        >
          Email
        </Button>
      )}

      {onDownload && (
        <Button
          variant="secondary"
          size="sm"
          icon={<Download size={15} />}
          onClick={onDownload}
          disabled={loading}
        >
          PDF
        </Button>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setOpen((value) => !value)
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <MoreHorizontal size={17} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: -4,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -4,
              }}
              className="absolute right-0 top-11 z-30 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
            >
              {onMarkPaid &&
                canMarkPaid && (
                  <MenuButton
                    icon={CheckCircle2}
                    label="Mark as paid"
                    onClick={() => {
                      setOpen(false);
                      onMarkPaid();
                    }}
                  />
                )}

              {onDuplicate && (
                <MenuButton
                  icon={Copy}
                  label="Duplicate invoice"
                  onClick={() => {
                    setOpen(false);
                    onDuplicate();
                  }}
                />
              )}

              {onDelete && !isPaid && (
                <MenuButton
                  icon={Trash2}
                  label="Delete invoice"
                  danger
                  onClick={() => {
                    setOpen(false);
                    onDelete();
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}