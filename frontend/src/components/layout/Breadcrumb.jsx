import {
  ChevronRight,
  Home,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

function formatSegment(segment) {
  if (!segment) {
    return "";
  }

  return segment
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

export default function Breadcrumb({
  items,
}) {
  const location =
    useLocation();

  const generatedItems =
    location.pathname
      .split("/")
      .filter(Boolean)
      .map((segment, index, array) => ({
        label:
          formatSegment(segment),
        path:
          "/" +
          array
            .slice(0, index + 1)
            .join("/"),
      }));

  const breadcrumbItems =
    items || generatedItems;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 overflow-x-auto text-xs"
    >
      <Link
        to={
          location.pathname.startsWith(
            "/client"
          )
            ? "/client/dashboard"
            : "/admin/dashboard"
        }
        className="flex shrink-0 items-center gap-1.5 text-slate-400 transition hover:text-slate-700"
      >
        <Home size={14} />
        Home
      </Link>

      {breadcrumbItems.map(
        (item, index) => {
          const last =
            index ===
            breadcrumbItems.length - 1;

          return (
            <div
              key={`${item.path}-${index}`}
              className="flex shrink-0 items-center gap-1.5"
            >
              <ChevronRight
                size={13}
                className="text-slate-300"
              />

              {last ? (
                <span className="font-medium text-slate-700">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-slate-400 transition hover:text-slate-700"
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        }
      )}
    </nav>
  );
}