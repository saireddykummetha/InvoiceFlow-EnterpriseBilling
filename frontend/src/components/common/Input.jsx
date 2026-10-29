import { AlertCircle } from "lucide-react";

export default function Input({
  label,
  name,
  value = "",
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  disabled = false,
  error = "",
  hint = "",
  icon: Icon,
  className = "",
  autoComplete,
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
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`
            input-base
            ${Icon ? "pl-10" : ""}
            ${error
              ? "border-red-300 focus:border-red-400 focus:ring-red-50"
              : ""}
            ${disabled
              ? "cursor-not-allowed bg-slate-50"
              : ""}
          `}
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