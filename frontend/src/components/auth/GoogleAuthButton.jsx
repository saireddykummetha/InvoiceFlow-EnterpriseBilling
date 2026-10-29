import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loginWithGoogle } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { authService } from "../../services/authService.js";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "";

/**
 * Loads the Google Identity Services script dynamically if not present.
 */
function loadGoogleGsiScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      resolve(window.google.accounts.id);
      return;
    }

    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      existingScript.addEventListener("load", () =>
        resolve(window.google?.accounts?.id)
      );
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google?.accounts?.id);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

export default function GoogleAuthButton({
  role = "client",
  mode = "login",
  text = "Continue with Google",
  className = "",
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const hiddenBtnRef = useRef(null);
  const roleRef = useRef(role);
  const modeRef = useRef(mode);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const handleGoogleCredentialResponse = useCallback(async (response) => {
    if (!response?.credential) {
      toast.error("Google authentication cancelled or token missing.");
      return;
    }

    setLoading(true);
    try {
      const currentRole = roleRef.current || "client";
      const currentMode = modeRef.current || "login";
      const authResult = await loginWithGoogle(
        response.credential,
        currentRole,
        currentMode
      );
      const user = authResult.user;


      if (!user) {
        toast.error("Invalid user response from server.");
        return;
      }

      if (login) {
        login(user);
      }

      toast.success(
        authResult.message || `Welcome, ${user.name || user.first_name || user.username || "User"}!`
      );

      const userIsAdmin =
        user?.is_staff === true ||
        user?.is_superuser === true ||
        user?.role === "admin";

      if (userIsAdmin) {
        navigate(authService.getDashboardPath(user), { replace: true });
      } else {
        navigate(authService.getDashboardPath(user), { replace: true });
      }
    } catch (error) {
      console.error("Google Auth Backend Error:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Google authentication failed on server.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  useEffect(() => {
    let isMounted = true;

    loadGoogleGsiScript()
      .then((gsi) => {
        if (!isMounted || !gsi || !GOOGLE_CLIENT_ID) return;

        try {
          // Initialize once or when client id changes
          if (!window.__gsi_initialized_client_id || window.__gsi_initialized_client_id !== GOOGLE_CLIENT_ID) {
            gsi.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: (res) => handleGoogleCredentialResponse(res),
              auto_select: false,
              cancel_on_tap_outside: true,
            });
            window.__gsi_initialized_client_id = GOOGLE_CLIENT_ID;
          }

          if (hiddenBtnRef.current) {
            hiddenBtnRef.current.innerHTML = "";
            gsi.renderButton(hiddenBtnRef.current, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 300,
            });
          }
        } catch (err) {
          console.warn("Failed to initialize Google GIS:", err);
        }
      })
      .catch((err) => {
        console.warn("Google GSI script could not load:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [handleGoogleCredentialResponse]);

  const handleCustomButtonClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast(
        "Google OAuth is enabled! To connect to your Google app, set VITE_GOOGLE_CLIENT_ID in your frontend .env file.",
        {
          icon: "⚙️",
          duration: 5000,
        }
      );
      return;
    }

    if (window.google?.accounts?.id) {
      const btn = hiddenBtnRef.current?.querySelector("div[role='button']");
      if (btn) {
        btn.click();
      } else {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("One tap skipped/not displayed:", notification.getNotDisplayedReason());
          }
        });
      }
    } else {
      toast.error("Google services are loading, please try again in a moment.");
    }
  };

  return (
    <div className="w-full relative">
      {/* Hidden container where GIS renders Google element */}
      <div
        ref={hiddenBtnRef}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Styled Custom Button */}
      <button
        type="button"
        onClick={handleCustomButtonClick}
        disabled={disabled || loading}
        className={`w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-60 cursor-pointer ${className}`}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-blue-600" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>{loading ? "Authenticating with Google..." : text}</span>
      </button>
    </div>
  );
}
