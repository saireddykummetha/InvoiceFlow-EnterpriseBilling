import {
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Mail,
  Send,
  Trash2,
} from "lucide-react";

import Button from "../common/Button";

export default function QuoteActions({
  quote,
  onEdit,
  onSend,
  onApprove,
  onDuplicate,
  onDelete,
  onDownload,
  onEmail,
  loading = false,
}) {
  const status =
    String(
      quote?.status || "draft"
    ).toLowerCase();

  const canSend =
    status === "draft";

  const canApprove =
    ["sent", "viewed"].includes(
      status
    );

  return (
    <div className="flex flex-wrap gap-2">
      {onEdit && (
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
          Send quote
        </Button>
      )}

      {canApprove && onApprove && (
        <Button
          variant="success"
          size="sm"
          icon={
            <CheckCircle2 size={15} />
          }
          onClick={onApprove}
          loading={loading}
        >
          Approve
        </Button>
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
          icon={
            <Download size={15} />
          }
          onClick={onDownload}
          disabled={loading}
        >
          PDF
        </Button>
      )}

      {onDuplicate && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Copy size={15} />}
          onClick={onDuplicate}
          disabled={loading}
        >
          Duplicate
        </Button>
      )}

      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          icon={
            <Trash2
              size={15}
            />
          }
          onClick={onDelete}
          disabled={loading}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Delete
        </Button>
      )}
    </div>
  );
}