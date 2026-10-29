import authApi, {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser as apiGetCurrentUser,
  refreshToken as apiRefreshToken,
  logout as apiLogout,
  changePassword as apiChangePassword,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  loginWithGoogle as apiLoginWithGoogle,
  requestSignupOtp as apiRequestSignupOtp,
  verifySignupOtp as apiVerifySignupOtp,
  resendSignupOtp as apiResendSignupOtp,
  resendPasswordResetOtp as apiResendPasswordResetOtp,
} from "../api/auth.js";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user") || localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const isAuthenticated = () => {
  return Boolean(localStorage.getItem("access_token") && getStoredUser());
};

const getRole = () => {
  const user = getStoredUser();
  if (user?.is_superuser || user?.role === "super_admin") {
    return "super_admin";
  }
  if (user?.is_staff || user?.role === "admin") {
    return "admin";
  }
  if (user?.role === "vendor") {
    return "vendor";
  }
  return "client";
};

const getDashboardPath = (user) => {
  const currentUser = user || getStoredUser();
  if (currentUser?.is_superuser || currentUser?.role === "super_admin") {
    return "/super-admin/dashboard";
  }
  if (currentUser?.is_staff || currentUser?.role === "admin") {
    return "/admin/dashboard";
  }
  if (currentUser?.role === "vendor") {
    return "/vendor/dashboard";
  }
  return "/client/dashboard";
};

export const authService = {
  login: apiLogin,
  register: apiRegister,
  getCurrentUser: apiGetCurrentUser,
  refreshToken: apiRefreshToken,
  logout: apiLogout,
  changePassword: apiChangePassword,
  forgotPassword: apiForgotPassword,
  resetPassword: apiResetPassword,
  loginWithGoogle: apiLoginWithGoogle || authApi?.loginWithGoogle,
  requestSignupOtp: apiRequestSignupOtp || authApi?.requestSignupOtp,
  verifySignupOtp: apiVerifySignupOtp || authApi?.verifySignupOtp,
  resendSignupOtp: apiResendSignupOtp || authApi?.resendSignupOtp,
  resendPasswordResetOtp: apiResendPasswordResetOtp || authApi?.resendPasswordResetOtp,
  getStoredUser,
  isAuthenticated,
  getRole,
  getDashboardPath,
};

export default authService;