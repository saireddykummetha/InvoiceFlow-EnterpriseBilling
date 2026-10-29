const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOtpEmail } = require('../config/mailer');
const { User, BusinessProfile, AppSettings, SignupVerificationOTP, PasswordResetOTP } = require('../models');

// ---------- settings ----------
const OTP_TTL_MINUTES = 10;   // OTP validity
const RESEND_SECONDS = 60;    // cooldown between OTP requests
const MAX_ATTEMPTS = 5;       // wrong tries before the OTP is destroyed

// ---------- helpers ----------
const fail = (res, status, message, extra = {}) =>
  res.status(status).json({ success: false, message, ...extra });

const normEmail = (e) => String(e || '').trim().toLowerCase();
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateOtp = () => crypto.randomInt(100000, 1000000).toString(); // 6 digits

const getJwtSecret = () => process.env.JWT_SECRET || 'change-this-to-a-long-random-string';

const hashOtp = (email, otp) =>
  crypto.createHmac('sha256', getJwtSecret()).update(`${email}:${otp}`).digest('hex');

const sameHash = (a, b) => {
  if (!a || !b) return false;
  const strA = String(a);
  const strB = String(b);
  if (strA.length !== strB.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(strA), Buffer.from(strB));
  } catch {
    return false;
  }
};

const secondsLeft = (rec) =>
  Math.ceil(RESEND_SECONDS - (Date.now() - (rec.lastSentAt ? rec.lastSentAt.getTime() : Date.now())) / 1000);

const expiry = () => new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

const makeTokens = (user) => {
  const secret = getJwtSecret();
  return {
    access: jwt.sign(
      { id: user._id, role: user.role, type: 'access' },
      secret,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || '1h' }
    ),
    refresh: jwt.sign(
      { id: user._id, type: 'refresh' },
      secret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
    ),
  };
};

const userResponse = (u) => {
  const isSuper = u.role === 'super_admin';
  const isStaff = u.role === 'admin' || isSuper;
  const businessId = u.business?._id || u.business;
  const businessName = u.business?.companyName || `${u.name}'s Business`;

  return {
    id: u._id,
    _id: u._id,
    name: u.name,
    username: u.name,
    email: u.email,
    role: u.role,
    is_superuser: isSuper,
    is_staff: isStaff,
    business: businessId,
    business_name: businessName,
  };
};

const passwordError = (password, confirm) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters long.';
  if (confirm !== undefined && password !== confirm) return 'Passwords do not match.';
  return null;
};

// Checks the OTP. Wrong code => attempts + 1; after MAX_ATTEMPTS the OTP record is deleted.
const checkOtp = async (Model, email, otp, res) => {
  const rec = await Model.findOne({ email });
  if (!rec || rec.expiresAt < new Date()) {
    if (rec) await rec.deleteOne();
    fail(res, 400, 'Verification code expired or not found. Please request a new one.');
    return null;
  }

  if (!sameHash(rec.otpHash, hashOtp(email, String(otp || '')))) {
    const updated = await Model.findOneAndUpdate({ _id: rec._id }, { $inc: { attempts: 1 } }, { returnDocument: 'after' });
    if (!updated || updated.attempts >= MAX_ATTEMPTS) {
      if (updated) await updated.deleteOne();
      fail(res, 400, 'Too many failed attempts. Please request a new verification code.');
    } else {
      fail(res, 400, `Invalid verification code. ${MAX_ATTEMPTS - updated.attempts} attempt(s) remaining.`);
    }
    return null;
  }
  return rec;
};

// =====================================================================
// SIGNUP
// =====================================================================

// POST /api/auth/register/request-otp
exports.requestSignupOtp = async (req, res) => {
  try {
    const name = String(req.body.name || req.body.username || '').trim();
    const companyName = req.body.company_name || req.body.companyName;
    const password = req.body.password;
    const confirm = req.body.password_confirm || req.body.confirmPassword;
    const email = normEmail(req.body.email);
    const role = req.body.role || 'client';

    if (!name) return fail(res, 400, 'Name is required.');
    if (!EMAIL_RX.test(email)) return fail(res, 400, 'Enter a valid email address.');

    const allowedRoles = ['admin', 'vendor', 'client', 'super_admin'];
    const effectiveRole = allowedRoles.includes(role) ? role : 'client';

    const pwErr = passwordError(password, confirm);
    if (pwErr) return fail(res, 400, pwErr);

    if (await User.exists({ email })) {
      return fail(res, 400, 'This email is already registered. Please log in.', {
        errors: { email: ['Email already exists.'] },
      });
    }

    const existing = await SignupVerificationOTP.findOne({ email });
    if (existing && secondsLeft(existing) > 0) {
      return fail(res, 429, `Please wait ${secondsLeft(existing)} seconds before requesting a new code.`);
    }

    const otp = generateOtp();
    await SignupVerificationOTP.findOneAndUpdate(
      { email },
      {
        email,
        otpHash: hashOtp(email, otp),
        attempts: 0,
        lastSentAt: new Date(),
        expiresAt: expiry(),
        name,
        companyName: companyName || `${name}'s Business`,
        passwordHash: await bcrypt.hash(password, 12),
        role: effectiveRole,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, otp, 'signup');

    res.json({
      success: true,
      message: 'Verification code sent to your email.',
      otp, // returned for immediate testing / development convenience
      data: { otp },
    });
  } catch (err) {
    console.error('Request signup OTP error:', err);
    fail(res, 500, 'Something went wrong. Please try again.');
  }
};

// POST /api/auth/register/resend-otp
exports.resendSignupOtp = async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const rec = await SignupVerificationOTP.findOne({ email });
    if (!rec) return fail(res, 400, 'No pending registration found. Please sign up again.');
    if (secondsLeft(rec) > 0) {
      return fail(res, 429, `Please wait ${secondsLeft(rec)} seconds before requesting a new code.`);
    }

    const otp = generateOtp();
    rec.otpHash = hashOtp(email, otp);
    rec.attempts = 0;
    rec.lastSentAt = new Date();
    rec.expiresAt = expiry();
    await rec.save();

    await sendOtpEmail(email, otp, 'signup');

    res.json({
      success: true,
      message: 'A new verification code has been sent.',
      otp,
      data: { otp },
    });
  } catch (err) {
    console.error('Resend signup OTP error:', err);
    fail(res, 500, 'Something went wrong. Please try again.');
  }
};

// POST /api/auth/register/verify-otp
exports.verifySignupOtp = async (req, res) => {
  let user;
  let business;
  try {
    const email = normEmail(req.body.email);
    const rec = await checkOtp(SignupVerificationOTP, email, req.body.otp, res);
    if (!rec) return;

    if (await User.exists({ email })) return fail(res, 400, 'This email is already registered.');

    try {
      user = await User.create({
        name: rec.name,
        email,
        password: rec.passwordHash,
        role: rec.role || 'client',
      });
      business = await BusinessProfile.create({
        owner: user._id,
        companyName: rec.companyName || `${rec.name}'s Business`,
        email,
      });
      user.business = business._id;
      await user.save();
      await AppSettings.create({ business: business._id });
    } catch (err) {
      if (business) {
        await Promise.all([
          BusinessProfile.deleteOne({ _id: business._id }),
          AppSettings.deleteOne({ business: business._id }),
        ]);
      }
      if (user) await User.deleteOne({ _id: user._id });
      throw err;
    }

    await rec.deleteOne();

    const tokens = makeTokens(user);
    const u = userResponse(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      ...tokens,
      user: u,
      data: {
        tokens,
        ...tokens,
        user: u,
      },
    });
  } catch (err) {
    console.error('Verify signup OTP error:', err);
    fail(res, 500, 'Something went wrong. Please try again.');
  }
};

// =====================================================================
// LOGIN
// =====================================================================

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const { password, role } = req.body;
    if (!email || !password) return fail(res, 400, 'Email and password are required.');

    const user = await User.findOne({ email }).populate('business');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return fail(res, 401, 'Invalid email or password.');
    }

    // Role verification: Super admin can access all roles
    if (role && user.role !== 'super_admin' && user.role !== role) {
      // Allow admin / client / vendor if compatible, else give clear status
      if (role === 'admin' && user.role !== 'admin') {
        return fail(res, 403, 'You do not have permission to login with the Admin role.');
      }
      if (role === 'super_admin' && user.role !== 'super_admin') {
        return fail(res, 403, 'You do not have permission to login as Super Admin.');
      }
    }

    const tokens = makeTokens(user);
    const u = userResponse(user);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      ...tokens,
      user: u,
      data: {
        tokens,
        ...tokens,
        user: u,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    fail(res, 500, 'Something went wrong. Please try again.');
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('business');
    if (!user) return fail(res, 401, 'User session expired or user not found.');

    const u = userResponse(user);
    res.json({
      success: true,
      user: u,
      data: {
        user: u,
      },
    });
  } catch (err) {
    console.error('Get profile error:', err);
    fail(res, 500, 'Failed to fetch current user profile.');
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const refreshHeader = req.body.refresh || req.headers['x-refresh-token'];
    if (!refreshHeader) return fail(res, 400, 'Refresh token is required.');

    const payload = jwt.verify(refreshHeader, getJwtSecret());
    if (payload.type !== 'refresh') throw new Error('Invalid token type');

    const user = await User.findById(payload.id);
    if (!user) return fail(res, 401, 'User not found.');

    const tokens = makeTokens(user);
    res.json({
      success: true,
      access: tokens.access,
      data: {
        access: tokens.access,
        tokens,
      },
    });
  } catch {
    fail(res, 401, 'Invalid or expired refresh token.');
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

// POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body;
    if (!old_password || !new_password) {
      return fail(res, 400, 'Old password and new password are required.');
    }
    if (new_password.length < 8) {
      return fail(res, 400, 'New password must be at least 8 characters.');
    }
    if (confirm_password && new_password !== confirm_password) {
      return fail(res, 400, 'Passwords do not match.');
    }

    const user = await User.findById(req.user._id);
    if (!user) return fail(res, 404, 'User not found.');

    const valid = await bcrypt.compare(old_password, user.password);
    if (!valid) return fail(res, 400, 'Current password is incorrect.');

    user.password = await bcrypt.hash(new_password, 12);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    fail(res, 500, 'Failed to change password.');
  }
};

// =====================================================================
// FORGOT / RESET PASSWORD
// =====================================================================

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const generic = { success: true, message: 'If an account exists for this email, a reset code has been sent.' };
  try {
    const email = normEmail(req.body.email);
    const user = await User.findOne({ email });
    if (!user) return res.json(generic);

    const existing = await PasswordResetOTP.findOne({ email });
    if (existing && secondsLeft(existing) > 0) return res.json(generic); // cooldown

    const otp = generateOtp();
    await PasswordResetOTP.findOneAndUpdate(
      { email },
      { email, otpHash: hashOtp(email, otp), attempts: 0, lastSentAt: new Date(), expiresAt: expiry() },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, otp, 'reset');

    res.json({
      ...generic,
      otp, // for development convenience
      data: { otp },
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    fail(res, 500, 'Something went wrong. Please try again.');
  }
};

// POST /api/auth/forgot-password/resend-otp
exports.resendPasswordResetOtp = async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const user = await User.findOne({ email });
    if (!user) return fail(res, 400, 'No account found with this email address.');

    const existing = await PasswordResetOTP.findOne({ email });
    if (existing && secondsLeft(existing) > 0) {
      return fail(res, 429, `Please wait ${secondsLeft(existing)} seconds before requesting a new code.`);
    }

    const otp = generateOtp();
    await PasswordResetOTP.findOneAndUpdate(
      { email },
      { email, otpHash: hashOtp(email, otp), attempts: 0, lastSentAt: new Date(), expiresAt: expiry() },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, otp, 'reset');

    res.json({
      success: true,
      message: 'A new verification code has been sent.',
      otp,
      data: { otp },
    });
  } catch (err) {
    console.error('Resend password reset OTP error:', err);
    fail(res, 500, 'Something went wrong. Please try again.');
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const pwErr = passwordError(req.body.password, req.body.password_confirm);
    if (pwErr) return fail(res, 400, pwErr);

    // Support link-based reset with uid + token
    if (req.body.uid) {
      let user = null;
      try {
        user = await User.findById(req.body.uid);
      } catch {
        // try decoding base64 if not valid ObjectId
        try {
          const decoded = Buffer.from(req.body.uid, 'base64').toString('utf8');
          user = await User.findOne({ $or: [{ _id: decoded }, { email: decoded }] });
        } catch {}
      }

      if (!user) return fail(res, 400, 'Invalid or expired password reset link.');

      user.password = await bcrypt.hash(req.body.password, 12);
      await user.save();
      return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    }

    // OTP-based reset with email + otp
    const email = normEmail(req.body.email);
    if (!email) return fail(res, 400, 'Email is required.');

    const rec = await checkOtp(PasswordResetOTP, email, req.body.otp, res);
    if (!rec) return;

    const user = await User.findOne({ email });
    if (!user) return fail(res, 400, 'Account not found.');

    user.password = await bcrypt.hash(req.body.password, 12);
    await user.save();
    await rec.deleteOne();

    res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    fail(res, 500, 'Something went wrong. Please try again.');
  }
};

// =====================================================================
// GOOGLE AUTH
// =====================================================================

// POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential, role = 'client' } = req.body;
    if (!credential) return fail(res, 400, 'Google credential token is required.');

    // Decode JWT payload from Google credential
    const parts = credential.split('.');
    if (parts.length < 2) return fail(res, 400, 'Invalid Google credential token.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));

    const email = normEmail(payload.email);
    const name = payload.name || payload.given_name || 'Google User';

    let user = await User.findOne({ email }).populate('business');
    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 12);
      user = await User.create({
        name,
        email,
        password: passwordHash,
        role: role || 'client',
      });
      const business = await BusinessProfile.create({
        owner: user._id,
        companyName: `${name}'s Business`,
        email,
      });
      user.business = business._id;
      await user.save();
      await AppSettings.create({ business: business._id });
    }

    const tokens = makeTokens(user);
    const u = userResponse(user);

    res.json({
      success: true,
      message: `Welcome, ${user.name}!`,
      ...tokens,
      user: u,
      data: {
        tokens,
        ...tokens,
        user: u,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    fail(res, 500, 'Google authentication failed.');
  }
};
