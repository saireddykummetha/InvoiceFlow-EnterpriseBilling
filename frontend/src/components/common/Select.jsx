import { AlertCircle, ChevronDown } from "lucide-react";

export default function Select({
  label,
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "Select...",
  required = false,
  disabled = false,
  error = "",
  hint = "",
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="label-base"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            input-base
            appearance-none
            pr-10
            ${
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                : ""
            }
            ${
              disabled
                ? "cursor-not-allowed bg-slate-50"
                : ""
            }
          `}
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => {
            const item =
              typeof option === "string"
                ? {
                    value: option,
                    label: option,
                  }
                : option;

            return (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            );
          })}
        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}

      {!error && hint && (
        <p className="mt-1.5 text-xs text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}