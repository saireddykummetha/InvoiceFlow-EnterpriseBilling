import {
  AlertTriangle,
  Trash2,
} from "lucide-react";

import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description =
    "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  danger = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      showClose={false}
    >
      <div className="text-center">
        <div
          className={`
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            ${
              danger
                ? "bg-red-50 text-red-600"
                : "bg-amber-50 text-amber-600"
            }
          `}
        >
          {danger ? (
            <Trash2 size={23} />
          ) : (
            <AlertTriangle
              size={23}
            />
          )}
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-7 flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={
              danger
                ? "danger"
                : "primary"
            }
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}