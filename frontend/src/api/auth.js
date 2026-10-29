import api, { clearLocalAuth } from "./api.js";

// ============================================================
// LOGIN
// ============================================================

export async function login(email, password, role = "admin") {
  const response = await api.post("auth/login/", {
    email: email.trim().toLowerCase(),
    password,
    role,
  });

  const access =
    response.data?.access ||
    response.data?.data?.tokens?.access ||
    response.data?.data?.access;

  const refresh =
    response.data?.refresh ||
    response.data?.data?.tokens?.refresh ||
    response.data?.data?.refresh;

  const user = response.data?.data?.user || response.data?.user;

  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_user", JSON.stringify(user));
  }

  window.dispatchEvent(new Event("auth-changed"));

  return {
    ...response.data,
    access,
    refresh,
    user,
  };
}

// ============================================================
// REGISTER
// ============================================================

export async function requestSignupOtp(dataOrUsername, email, password, password_confirm, role = "client") {
  let payload;
  if (typeof dataOrUsername === "object" && dataOrUsername !== null) {
    payload = {
      name: String(dataOrUsername.name || dataOrUsername.username || "").trim(),
      email: String(dataOrUsername.email || "").trim().toLowerCase(),
      password: dataOrUsername.password,
      password_confirm: dataOrUsername.password_confirm || dataOrUsername.confirmPassword || dataOrUsername.password,
      role: dataOrUsername.role || "client",
      company_name: dataOrUsername.company_name || dataOrUsername.companyName || undefined,
    };
  } else {
    payload = {
      username: String(dataOrUsername || "").trim(),
      email: String(email || "").trim().toLowerCase(),
      password,
      password_confirm: password_confirm || password,
      role,
    };
  }

  const response = await api.post("auth/register/request-otp/", payload);
  return response.data;
}

export async function verifySignupOtp(email, otp) {
  const response = await api.post("auth/register/verify-otp/", {
    email: email?.trim().toLowerCase(),
    otp: String(otp).trim(),
  });

  const access =
    response.data?.access ||
    response.data?.data?.tokens?.access ||
    response.data?.data?.access;

  const refresh =
    response.data?.refresh ||
    response.data?.data?.tokens?.refresh ||
    response.data?.data?.refresh;

  const user = response.data?.data?.user || response.data?.user;

  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_user", JSON.stringify(user));
  }

  window.dispatchEvent(new Event("auth-changed"));

  return {
    ...response.data,
    access,
    refresh,
    user,
  };
}

export async function resendSignupOtp(email) {
  const response = await api.post("auth/register/resend-otp/", {
    email: email?.trim().toLowerCase(),
  });
  return response.data;
}

export async function register(dataOrUsername, email, password, password_confirm, role = "admin") {
  let payload;
  if (typeof dataOrUsername === "object" && dataOrUsername !== null) {
    payload = {
      username: dataOrUsername.username || dataOrUsername.name,
      email: dataOrUsername.email?.trim().toLowerCase(),
      password: dataOrUsername.password,
      password_confirm: dataOrUsername.password_confirm || dataOrUsername.confirmPassword || dataOrUsername.password,
      role: dataOrUsername.role || "admin",
    };
  } else {
    payload = {
      username: dataOrUsername,
      email: email?.trim().toLowerCase(),
      password,
      password_confirm: password_confirm || password,
      role,
    };
  }

  const response = await api.post("auth/register/", payload);

  const access =
    response.data?.access ||
    response.data?.data?.tokens?.access ||
    response.data?.data?.access;

  const refresh =
    response.data?.refresh ||
    response.data?.data?.tokens?.refresh ||
    response.data?.data?.refresh;

  const user = response.data?.data?.user || response.data?.user;

  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_user", JSON.stringify(user));
  }

  window.dispatchEvent(new Event("auth-changed"));

  return {
    ...response.data,
    access,
    refresh,
    user,
  };

}

// ============================================================
// CURRENT USER
// ============================================================

export async function getCurrentUser() {
  const response = await api.get("auth/me/");
  const user = response.data?.data?.user || response.data?.user || response.data?.data;
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_user", JSON.stringify(user));
  }
  return user;
}

// ============================================================
// REFRESH TOKEN
// ============================================================

export async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    throw new Error("No refresh token available.");
  }

  const response = await api.post("auth/refresh/", { refresh });
  const access =
    response.data?.access ||
    response.data?.data?.access ||
    response.data?.data?.tokens?.access;

  if (access) {
    localStorage.setItem("access_token", access);
  }
  return response.data;
}

// ============================================================
// LOGOUT
// ============================================================

export async function logout() {
  const refresh = localStorage.getItem("refresh_token");
  try {
    if (refresh) {
      await api.post("auth/logout/", { refresh });
    }
  } catch (err) {
    console.warn("Backend logout error (safe to proceed):", err);
  } finally {
    clearLocalAuth();
  }
}

// ============================================================
// CHANGE PASSWORD
// ============================================================

export async function changePassword(data) {
  const response = await api.post("auth/change-password/", data);
  return response.data;
}

// ============================================================
// FORGOT PASSWORD
// ============================================================

export async function forgotPassword(email) {
  const response = await api.post("auth/forgot-password/", {
    email: email.trim().toLowerCase(),
  });
  return response.data;
}

export async function resendPasswordResetOtp(email) {
  const response = await api.post("auth/forgot-password/resend-otp/", {
    email: email.trim().toLowerCase(),
  });
  return response.data;
}

// ============================================================
// RESET PASSWORD
// ============================================================

export async function resetPassword(data) {
  const response = await api.post("auth/reset-password/", data);
  return response.data;
}


// ============================================================
// GOOGLE AUTH
// ============================================================

export async function loginWithGoogle(credential, role = "client", mode = "login") {
  const response = await api.post("auth/google/", {
    credential,
    role,
    mode,
  });

  const access =
    response.data?.access ||
    response.data?.data?.tokens?.access ||
    response.data?.data?.access;

  const refresh =
    response.data?.refresh ||
    response.data?.data?.tokens?.refresh ||
    response.data?.data?.refresh;

  const user = response.data?.data?.user || response.data?.user;

  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_user", JSON.stringify(user));
  }

  window.dispatchEvent(new Event("auth-changed"));

  return {
    ...response.data,
    access,
    refresh,
    user,
  };
}

export default {
  login,
  register,
  loginWithGoogle,
  requestSignupOtp,
  verifySignupOtp,
  resendSignupOtp,
  resendPasswordResetOtp,
  getCurrentUser,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};