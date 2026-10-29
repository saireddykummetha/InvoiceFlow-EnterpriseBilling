import {
  Filter as FilterIcon,
  RotateCcw,
} from "lucide-react";

import Select from "./Select";
import Button from "./Button";

export default function Filter({
  filters = [],
  values = {},
  onChange,
  onReset,
  className = "",
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        ${className}
      `}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon
            size={16}
            className="text-slate-500"
          />

          <span className="text-sm font-semibold text-slate-800">
            Filters
          </span>
        </div>

        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={onReset}
          >
            Reset
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filters.map((filter) => (
          <Select
            key={filter.name}
            name={filter.name}
            label={filter.label}
            value={
              values[filter.name] || ""
            }
            options={filter.options || []}
            placeholder={
              filter.placeholder ||
              `All ${filter.label}`
            }
            onChange={(event) =>
              onChange?.(
                filter.name,
                event.target.value
              )
            }
          />
        ))}
      </div>
    </div>
  );
}