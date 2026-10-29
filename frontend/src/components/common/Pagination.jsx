import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];

  const start = Math.max(
    1,
    page - 2
  );

  const end = Math.min(
    totalPages,
    page + 2
  );

  for (
    let current = start;
    current <= end;
    current++
  ) {
    pages.push(current);
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={page === 1}
        onClick={() =>
          onPageChange?.(page - 1)
        }
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          text-slate-500
          transition
          hover:bg-slate-50
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <PageButton
            page={1}
            active={page === 1}
            onClick={onPageChange}
          />

          {start > 2 && (
            <span className="px-1 text-slate-400">
              ...
            </span>
          )}
        </>
      )}

      {pages.map((item) => (
        <PageButton
          key={item}
          page={item}
          active={page === item}
          onClick={onPageChange}
        />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-slate-400">
              ...
            </span>
          )}

          <PageButton
            page={totalPages}
            active={page === totalPages}
            onClick={onPageChange}
          />
        </>
      )}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() =>
          onPageChange?.(page + 1)
        }
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          text-slate-500
          transition
          hover:bg-slate-50
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function PageButton({
  page,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(page)}
      className={`
        flex
        h-9
        min-w-9
        items-center
        justify-center
        rounded-xl
        px-2
        text-sm
        font-semibold
        transition
        ${
          active
            ? "bg-slate-950 text-white"
            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }
      `}
    >
      {page}
    </button>
  );
}