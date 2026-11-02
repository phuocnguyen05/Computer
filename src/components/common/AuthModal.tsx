import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RotateCcw,
  AlertCircle,
  Check,
  Headphones,
  ShoppingBag,
} from 'lucide-react';
import { User, UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    authPromptReason,
    setAuthPromptReason,
    handleContinueAsGuest,
    login,
    loginWithGoogle,
    register,
    switchRole,
    users,
    showToast,
    resetPassword,
    setCurrentView,
    isLoggedIn,
    setPendingGuestAction,
  } = useApp();

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
    setPendingGuestAction(null); // Clear pending action so it never runs in background
    setAuthPromptReason(null);
    showToast('Đã hủy yêu cầu đăng nhập', 'info');
  };

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);
  const [regError, setRegError] = useState('');

  // Forgot Password flow states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify_and_reset' | 'success'>('request');
  const [forgotOtp, setForgotOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('889966');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    const query = forgotEmail.trim().toLowerCase();
    if (!query) {
      setForgotError('Vui lòng nhập email hoặc số điện thoại của bạn');
      return;
    }

    const found = users.find(
      u => u.email.toLowerCase() === query || u.phone === query || u.username.toLowerCase() === query
    );

    if (!found) {
      setForgotError('Không tìm thấy tài khoản với email hoặc số điện thoại này trên hệ thống');
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setMatchedUser(found);
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotStep('verify_and_reset');
    showToast(`Mã xác minh OTP đã được gửi đến: ${found.email}`, 'info');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotOtp.trim()) {
      setForgotError('Vui lòng nhập mã xác minh OTP');
      return;
    }

    if (forgotOtp.trim() !== generatedOtp && forgotOtp.trim() !== '889966') {
      setForgotError('Mã OTP không chính xác. Vui lòng nhập đúng mã');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }

    setIsSubmittingForgot(true);
    try {
      const res = await resetPassword(matchedUser ? matchedUser.email : forgotEmail, forgotNewPassword);
      if (res.success) {
        setForgotStep('success');
      } else {
        setForgotError(res.message);
      }
    } catch {
      setForgotError('Đã xảy ra lỗi khi đặt lại mật khẩu.');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    await loginWithGoogle();
    setIsSubmitting(false);
  };

  const renderGoogleButton = () => (
    <div className="space-y-3 pt-2">
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="flex-shrink mx-4 text-[11px] text-slate-500 uppercase tracking-widest">Hoặc tiếp tục với</span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
        className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Đăng Nhập Google</span>
      </button>
    </div>
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim()) {
      setLoginError('Vui lòng nhập Email hoặc Tên đăng nhập');
      return;
    }
    setIsSubmitting(true);
    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (!res.success) {
      setLoginError(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim()) {
      setRegError('Vui lòng nhập họ và tên của bạn');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Vui lòng nhập email hợp lệ');
      return;
    }
    if (!regPhone.trim() || regPhone.length < 9) {
      setRegError('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Mật khẩu tối thiểu từ 6 ký tự trở lên');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!regAgreeTerms) {
      setRegError('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      fullName: regFullName,
      email: regEmail,
      phone: regPhone,
      address: regAddress || 'Việt Nam',
      password: regPassword,
    });
    setIsSubmitting(false);
    if (!res.success) {
      setRegError(res.message);
    }
  };

  const handleFastDemoLogin = (role: UserRole) => {
    switchRole(role);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        id="auth-modal-container"
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <button
            id="btn-close-auth-modal"
            onClick={handleCloseAuth}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white shadow-md shadow-rose-600/30">
              GT
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Cổng Tài Khoản <span className="text-rose-500">GearTech</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Hệ thống phân quyền 3 cấp độ: <span className="text-rose-400 font-semibold">ADMIN</span> •{' '}
            <span className="text-amber-400 font-semibold">STAFF</span> •{' '}
            <span className="text-emerald-400 font-semibold">USER</span>
          </p>

          {/* Tab Switcher */}
          {authModalTab === 'forgot' ? (
            <div className="mt-4 flex items-center justify-between p-2 bg-slate-950/80 rounded-xl border border-rose-500/30">
              <button
                type="button"
                id="btn-back-to-login"
                onClick={() => {
                  setAuthModalTab('login');
                  setForgotError('');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại Đăng Nhập
              </button>
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-500" /> Khôi Phục Mật Khẩu
              </span>
            </div>
          ) : (
            <div className="mt-4 flex p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                id="auth-tab-btn-login"
                onClick={() => {
                  setAuthModalTab('login');
                  setLoginError('');
                }}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  authModalTab === 'login'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                id="auth-tab-btn-register"
                onClick={() => {
                  setAuthModalTab('register');
                  setRegError('');
                }}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  authModalTab === 'register'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đăng Ký Tài Khoản Mới
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">



          {/* TAB 1: LOGIN FORM */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email hoặc Tên Đăng Nhập
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-email"
                    type="text"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="admin@geartech.vn, staff@geartech.vn hoặc user@geartech.vn"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Mật Khẩu</label>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@geartech.vn');
                      setLoginPassword('admin');
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300"
                  >
                    Điền mẫu Admin
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Mật khẩu demo: admin / staff / user (hoặc bất kỳ)"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                </label>
                <button
                  type="button"
                  id="btn-forgot-password-link"
                  onClick={() => {
                    setAuthModalTab('forgot');
                    setForgotError('');
                    setForgotStep('request');
                    if (loginEmail.trim()) {
                      setForgotEmail(loginEmail.trim());
                    }
                  }}
                  className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer text-xs transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                id="btn-submit-login"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Đang xác thực...</span>
                ) : (
                  <>
                    <span>Đăng Nhập Hệ Thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {renderGoogleButton()}
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và Tên Quý Khách <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-reg-fullname"
                    type="text"
                    required
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="Ví dụ: Hoàng Đức Minh"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Địa Chỉ Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="email@vidu.com"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số Điện Thoại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-reg-phone"
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Địa Chỉ Nhận Hàng Mặc Định
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-reg-address"
                    type="text"
                    value={regAddress}
                    onChange={e => setRegAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, Quận/Huyện, Tỉnh/TP"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mật Khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-reg-password"
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Xác Nhận Mật Khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-reg-confirmpass"
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Welcome Bonus Notice */}
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Đăng ký ngay hôm nay để nhận ngay <strong className="text-amber-300">50 Điểm Thưởng VIP</strong> và mã giảm giá 100K cho đơn hàng đầu tiên!
                </span>
              </div>

              {/* Agreement */}
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regAgreeTerms}
                  onChange={e => setRegAgreeTerms(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500"
                />
                <span>
                  Tôi đồng ý với <span className="text-rose-400 underline">Điều khoản dịch vụ</span> & <span className="text-rose-400 underline">Chính sách bảo mật</span> của GearTech.
                </span>
              </label>

              <button
                type="submit"
                id="btn-submit-register"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Đang khởi tạo tài khoản...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tạo Tài Khoản Khách Hàng (User)</span>
                  </>
                )}
              </button>
              {renderGoogleButton()}
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD FLOW */}
          {authModalTab === 'forgot' && (
            <div className="space-y-4">
              {forgotError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {/* Step 1: Input email / phone */}
              {forgotStep === 'request' && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                    <p className="text-xs text-slate-300 font-medium">
                      Nhập địa chỉ email hoặc số điện thoại bạn đã đăng ký để tìm tài khoản và nhận mã xác minh OTP.
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400">Gợi ý tài khoản mẫu:</span>
                      {users.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setForgotEmail(u.email);
                            setForgotError('');
                          }}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                        >
                          {u.email}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                      Email hoặc Số Điện Thoại
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="VD: customer@gmail.com hoặc 0988667788"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setForgotError('');
                      }}
                      className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
                    >
                      <span>Tiếp Tục Xác Minh</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Verify OTP & Reset Password */}
              {forgotStep === 'verify_and_reset' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {matchedUser && (
                    <div className="p-3 bg-slate-950/80 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {matchedUser.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{matchedUser.fullName}</p>
                          <p className="text-[11px] text-slate-400">{matchedUser.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {matchedUser.role}
                      </span>
                    </div>
                  )}

                  {/* OTP Helper Banner */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                    <div className="text-xs text-amber-200">
                      Mã xác nhận thử nghiệm: <strong className="font-mono text-sm tracking-wider text-amber-300">{generatedOtp}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotOtp(generatedOtp)}
                      className="px-2 py-1 text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 transition-colors"
                    >
                      Điền nhanh mã OTP
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                      Mã Xác Minh OTP (6 số)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotOtp}
                        onChange={e => setForgotOtp(e.target.value)}
                        placeholder="Nhập 6 số mã OTP"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                      Mật Khẩu Mới (Tối thiểu 6 ký tự)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                      Xác Nhận Mật Khẩu Mới
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={forgotConfirmPassword}
                        onChange={e => setForgotConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Bước trước</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingForgot}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                    >
                      {isSubmittingForgot ? (
                        <span>Đang xử lý...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Lưu Mật Khẩu Mới</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Success */}
              {forgotStep === 'success' && (
                <div className="p-6 bg-slate-950/80 border border-emerald-500/40 rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Khôi Phục Mật Khẩu Thành Công!</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Mật khẩu của tài khoản <strong className="text-emerald-400">{matchedUser?.fullName || forgotEmail}</strong> đã được cập nhật thành công.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (matchedUser && forgotNewPassword) {
                          setLoginEmail(matchedUser.email);
                          setLoginPassword(forgotNewPassword);
                          setAuthModalTab('login');
                          await login(matchedUser.email, forgotNewPassword);
                        } else {
                          setAuthModalTab('login');
                        }
                      }}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                    >
                      <span>Đăng Nhập Ngay Với Mật Khẩu Mới</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
