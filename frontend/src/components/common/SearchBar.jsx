import {
  Search,
  X,
} from "lucide-react";

export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div
      className={`
        relative
        w-full
        sm:w-[280px]
        ${className}
      `}
    >
      <Search
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
        placeholder={placeholder}
        className="
          h-10
          w-full
          rounded-xl
          border
          border-slate-200
          bg-white
          pl-10
          pr-10
          text-sm
          text-slate-900
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-slate-400
          focus:ring-4
          focus:ring-slate-100
        "
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="
            absolute
            right-2
            top-1/2
            flex
            h-7
            w-7
            -translate-y-1/2
            items-center
            justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-700
          "
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}