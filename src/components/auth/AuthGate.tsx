import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
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
  Shield,
  UserCheck,
  Cpu,
  Zap,
  ShoppingBag,
  Check,
  KeyRound,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { User, UserRole } from '../../types';

export const AuthGate: React.FC = () => {
  const {
    login,
    register,
    switchRole,
    users,
    resetPassword,
    showToast,
    setCurrentView,
    pendingGuestAction,
    handleContinueAsGuest,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');

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
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);
  const [regError, setRegError] = useState('');

  // Forgot Password form state
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
    showToast(`Mã xác minh OTP đã được tạo cho tài khoản: ${found.email}`, 'info');
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

  const finishAuthNavigation = () => {
    if (pendingGuestAction) {
      handleContinueAsGuest();
    } else {
      setCurrentView('home');
    }
  };

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
    } else {
      finishAuthNavigation();
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
      setRegError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    if (!regPhone.trim() || regPhone.length < 9) {
      setRegError('Vui lòng nhập số điện thoại hợp lệ (từ 9 số trở lên)');
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
    } else {
      finishAuthNavigation();
    }
  };

  const handleSelectQuickAccount = async (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    const res = await login(email, pass);
    if (res.success) {
      finishAuthNavigation();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-rose-600 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto relative z-10">
        {/* TOP BACK TO HOME BUTTON */}
        <div className="flex items-center justify-between mb-8">
          <button
            id="btn-auth-back-home"
            onClick={() => setCurrentView('home')}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-2xl border border-slate-700/80 font-extrabold text-xs sm:text-sm shadow-xl transition-all cursor-pointer group"
            title="Trở về trang chủ nếu không muốn đăng nhập"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500 group-hover:-translate-x-1 transition-transform" />
            <span>Quay Lại Màn Hình Chính</span>
          </button>
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            Hệ Thống Đăng Nhập GearTech Hi-End
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-rose-600/30 ring-2 ring-rose-500/30">
              GT
            </div>
            <div className="text-left">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white block leading-none">
                GEARTECH <span className="text-rose-500">HI-END</span>
              </span>
              <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase block mt-1">
                Hệ Thống Phân Phối Máy Tính & Linh Kiện Gaming
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Vui lòng <strong className="text-rose-400">Đăng Nhập</strong> hoặc <strong className="text-rose-400">Đăng Ký</strong> để truy cập hệ thống theo đúng phân quyền tài khoản của bạn.
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>1. ĐĂNG NHẬP HỆ THỐNG</span>
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>2. ĐĂNG KÝ TÀI KHOẢN MỚI</span>
            </button>
            <button
              id="auth-tab-forgot"
              type="button"
              onClick={() => {
                setActiveTab('forgot');
                setForgotError('');
                setForgotStep('request');
                if (loginEmail.trim()) {
                  setForgotEmail(loginEmail.trim());
                }
              }}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'forgot'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>3. QUÊN MẬT KHẨU</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* 1. LOGIN VIEW */}
            {activeTab === 'login' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Login Form (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="border-b border-slate-800/80 pb-3">
                    <h2 className="text-lg font-black text-white">Đăng Nhập Tài Khoản</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Nhập email/tên đăng nhập và mật khẩu để bắt đầu phiên làm việc</p>
                  </div>

                  {loginError && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Email hoặc Tên đăng nhập <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="login-input-email"
                          type="text"
                          required
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="admin@geartech.vn / staff@geartech.vn / user@geartech.vn"
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-3 pl-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-300">
                          Mật khẩu <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-500">Mặc định: admin / staff / user</span>
                      </div>
                      <div className="relative">
                        <input
                          id="login-input-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="Nhập mật khẩu của bạn..."
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-3 pl-10 pr-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500/20"
                        />
                        <span>Ghi nhớ đăng nhập</span>
                      </label>
                      <button
                        type="button"
                        id="authgate-btn-forgot-password"
                        onClick={() => {
                          setActiveTab('forgot');
                          setForgotError('');
                          setForgotStep('request');
                          if (loginEmail.trim()) {
                            setForgotEmail(loginEmail.trim());
                          }
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    <button
                      id="btn-submit-login"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'ĐANG XÁC THỰC...' : 'ĐĂNG NHẬP VÀO HỆ THỐNG'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </div>

                {/* Right: 3 Accounts Permission Guide & 1-Click Login (5 cols) */}
                <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-slate-800 pb-2.5">
                    <p className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Đăng Nhập Nhanh 3 Tài Khoản Mẫu:</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Bấm vào từng tài khoản bên dưới để tự động điền & đăng nhập kiểm tra phân quyền:
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Account 1: ADMIN */}
                    <button
                      type="button"
                      onClick={() => handleSelectQuickAccount('admin@geartech.vn', 'admin')}
                      className="w-full text-left p-3 rounded-xl bg-slate-900 border border-rose-500/40 hover:border-rose-500 hover:bg-slate-850 transition-all group shadow-sm hover:shadow-rose-600/10"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-black uppercase tracking-wider">
                          1. Quản Trị Viên (ADMIN)
                        </span>
                        <span className="text-[10px] font-bold text-rose-400 group-hover:underline">Bấm để vào →</span>
                      </div>
                      <p className="text-xs font-bold text-white">Lê Quản Trị</p>
                      <p className="text-[11px] text-slate-400 font-mono">admin@geartech.vn • pass: admin</p>
                      <p className="text-[10px] text-slate-300 mt-1.5 border-t border-slate-800 pt-1.5 leading-relaxed">
                        <strong className="text-rose-400">Quyền hạn:</strong> Toàn quyền 10 phân hệ Admin, doanh thu, quản lý nhân sự, phân quyền, cấu hình trang chủ.
                      </p>
                    </button>

                    {/* Account 2: STAFF */}
                    <button
                      type="button"
                      onClick={() => handleSelectQuickAccount('staff@geartech.vn', 'staff')}
                      className="w-full text-left p-3 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-amber-500 hover:bg-slate-850 transition-all group shadow-sm hover:shadow-amber-600/10"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black uppercase tracking-wider">
                          2. Nhân Viên (STAFF)
                        </span>
                        <span className="text-[10px] font-bold text-amber-400 group-hover:underline">Bấm để vào →</span>
                      </div>
                      <p className="text-xs font-bold text-white">Trần Thị Bích (Kho & CSKH)</p>
                      <p className="text-[11px] text-slate-400 font-mono">staff@geartech.vn • pass: staff</p>
                      <p className="text-[10px] text-slate-300 mt-1.5 border-t border-slate-800 pt-1.5 leading-relaxed">
                        <strong className="text-amber-400">Quyền hạn:</strong> Xử lý đơn hàng, nhập thêm kho hàng, phản hồi đánh giá khách. Bị khóa quyền đổi Role & Homepage.
                      </p>
                    </button>

                    {/* Account 3: USER */}
                    <button
                      type="button"
                      onClick={() => handleSelectQuickAccount('user@geartech.vn', 'user')}
                      className="w-full text-left p-3 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-500 hover:bg-slate-850 transition-all group shadow-sm hover:shadow-emerald-600/10"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black uppercase tracking-wider">
                          3. Khách Hàng (USER)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 group-hover:underline">Bấm để vào →</span>
                      </div>
                      <p className="text-xs font-bold text-white">Nguyễn Văn An (Khách Mua Hàng)</p>
                      <p className="text-[11px] text-slate-400 font-mono">user@geartech.vn • pass: user</p>
                      <p className="text-[10px] text-slate-300 mt-1.5 border-t border-slate-800 pt-1.5 leading-relaxed">
                        <strong className="text-emerald-400">Quyền hạn:</strong> Mua sắm linh kiện, đặt đơn COD/VNPAY, công cụ PC Builder, tích điểm. Không vào được Admin.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. REGISTER VIEW */}
            {activeTab === 'register' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-white">Đăng Ký Tài Khoản Khách Hàng (USER)</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Tạo tài khoản thành viên ngay hôm nay để nhận ngay <strong className="text-amber-400">50 GT-Points</strong> chào mừng và tích điểm nâng hạng VIP!
                  </p>
                </div>

                {regError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Họ và tên của bạn <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="reg-input-name"
                          type="text"
                          required
                          value={regFullName}
                          onChange={e => setRegFullName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn Hoàng"
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Số điện thoại liên hệ <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="reg-input-phone"
                          type="tel"
                          required
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          placeholder="0988 123 456"
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Địa chỉ Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-input-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="email.cuaban@example.com"
                        className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Mật khẩu bảo vệ <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="reg-input-password"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="Tối thiểu 6 ký tự..."
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Xác nhận lại mật khẩu <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="reg-input-confirm-password"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu trên..."
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Địa chỉ nhận hàng mặc định (Tùy chọn)
                    </label>
                    <div className="relative">
                      <input
                        id="reg-input-address"
                        type="text"
                        value={regAddress}
                        onChange={e => setRegAddress(e.target.value)}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400 select-none">
                      <input
                        type="checkbox"
                        checked={regAgreeTerms}
                        onChange={e => setRegAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500/20"
                      />
                      <span>
                        Tôi đồng ý với <strong className="text-rose-400">Điều khoản dịch vụ</strong> và <strong className="text-rose-400">Chính sách bảo mật thông tin</strong> của GearTech.
                      </span>
                    </label>
                  </div>

                  <button
                    id="btn-submit-register"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{isSubmitting ? 'ĐANG TẠO TÀI KHOẢN...' : 'HOÀN TẤT ĐĂNG KÝ (NHẬN 50 ĐIỂM)'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-rose-400 font-bold hover:underline"
                    >
                      Đăng nhập ngay
                    </button>
                  </p>
                </form>
              </div>
            )}

            {/* 3. FORGOT PASSWORD VIEW */}
            {activeTab === 'forgot' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="text-center border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-2">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-white">Khôi Phục Mật Khẩu Tài Khoản</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Nhập email hoặc số điện thoại đã đăng ký để xác minh và thiết lập lại mật khẩu mới
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {/* Step 1: Input email / phone */}
                {forgotStep === 'request' && (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5">
                      <p className="text-xs text-slate-300 font-medium">
                        Chọn hoặc nhập địa chỉ email/số điện thoại của bạn để hệ thống tìm kiếm tài khoản:
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-slate-400 font-semibold">Tài khoản mẫu:</span>
                        {users.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setForgotEmail(u.email);
                              setForgotError('');
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-mono"
                          >
                            {u.email}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Email hoặc Số Điện Thoại <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="forgot-input-email"
                          type="text"
                          required
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="Ví dụ: customer@gmail.com hoặc 0988 123 456"
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-3 pl-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setForgotError('');
                        }}
                        className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại</span>
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
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
                      <div className="p-3.5 bg-slate-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                            {matchedUser.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{matchedUser.fullName}</p>
                            <p className="text-[11px] text-slate-400">{matchedUser.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {matchedUser.role}
                        </span>
                      </div>
                    )}

                    {/* OTP helper banner */}
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                      <div className="text-xs text-amber-200">
                        Mã OTP thử nghiệm: <strong className="font-mono text-sm tracking-wider text-amber-300">{generatedOtp}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForgotOtp(generatedOtp)}
                        className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 transition-colors"
                      >
                        Điền nhanh mã OTP
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Mã Xác Minh OTP (6 số) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="forgot-input-otp"
                          type="text"
                          required
                          maxLength={6}
                          value={forgotOtp}
                          onChange={e => setForgotOtp(e.target.value)}
                          placeholder="Nhập 6 số OTP"
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-3 pl-10 text-sm font-mono tracking-widest text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Mật Khẩu Mới (Tối thiểu 6 ký tự) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="forgot-input-new-password"
                          type={showForgotNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={forgotNewPassword}
                          onChange={e => setForgotNewPassword(e.target.value)}
                          placeholder="Nhập mật khẩu mới"
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-3 pl-10 pr-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Xác Nhận Mật Khẩu Mới <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="forgot-input-confirm-password"
                          type={showForgotConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={forgotConfirmPassword}
                          onChange={e => setForgotConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu mới"
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 rounded-xl px-4 py-3 pl-10 pr-10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setForgotStep('request')}
                        className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Bước trước</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingForgot}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                      >
                        {isSubmittingForgot ? (
                          <span>Đang lưu...</span>
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
                  <div className="p-8 bg-slate-950/80 border border-emerald-500/40 rounded-3xl text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Khôi Phục Mật Khẩu Thành Công!</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Mật khẩu cho tài khoản <strong className="text-emerald-400">{matchedUser?.fullName || forgotEmail}</strong> đã được đổi thành công.
                      </p>
                    </div>
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (matchedUser && forgotNewPassword) {
                            setLoginEmail(matchedUser.email);
                            setLoginPassword(forgotNewPassword);
                            setActiveTab('login');
                            await login(matchedUser.email, forgotNewPassword);
                          } else {
                            setActiveTab('login');
                          }
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
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

          {/* Bottom Trust Guarantee */}
          <div className="bg-slate-950 px-6 py-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> 100% Linh kiện chính hãng
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Check className="w-3.5 h-3.5" /> Bảo hành đổi mới 1:1
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <Check className="w-3.5 h-3.5" /> Vệ sinh PC trọn đời
              </span>
            </div>
            <div className="text-slate-500">
              Hotline hỗ trợ: <strong className="text-slate-300">1800 6868</strong> (8:00 - 21:30)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
