import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SHOWROOM_LIST } from '../../data/mockData';
import {
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Laptop,
  Monitor,
  CheckCircle,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const ServiceBookingPage: React.FC = () => {
  const { currentUser, showToast } = useApp();

  const [customerName, setCustomerName] = useState(currentUser.fullName || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [deviceType, setDeviceType] = useState<'PC' | 'LAPTOP'>('PC');
  const [showroom, setShowroom] = useState(SHOWROOM_LIST[0].name);
  const [appointmentDate, setAppointmentDate] = useState('2026-03-25');
  const [appointmentTime, setAppointmentTime] = useState('14:30');
  const [deviceCondition, setDeviceCondition] = useState('Máy nóng, quạt kêu to, bám nhiều bụi sau 6 tháng sử dụng');

  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      showToast('Vui lòng điền đầy đủ họ tên và số điện thoại', 'error');
      return;
    }

    const bookingCode = `GT-CARE-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingSuccess({
      code: bookingCode,
      name: customerName,
      phone,
      email,
      deviceType,
      showroom,
      date: appointmentDate,
      time: appointmentTime,
    });
    showToast('Đăng ký lịch vệ sinh máy miễn phí thành công!', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Đặt Lịch Vệ Sinh Máy & Tra Keo Tản Nhiệt Miễn Phí
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Dịch vụ đặc quyền 100% miễn phí trọn đời tại hệ thống Showroom GearTech: hút bụi tĩnh điện, tra keo gốm MX4 cao cấp và kiểm tra nhiệt độ linh kiện.
        </p>
      </div>

      {bookingSuccess ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Xác Nhận Đặt Lịch Thành Công
            </span>
            <h2 className="text-2xl font-black text-white">Mã Đặt Lịch: {bookingSuccess.code}</h2>
            <p className="text-xs text-slate-400">
              Mã xác nhận và hướng dẫn đã được gửi tới SĐT <strong>{bookingSuccess.phone}</strong> và Email <strong>{bookingSuccess.email}</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 text-slate-300">
            <p><strong>Khách hàng:</strong> {bookingSuccess.name} ({bookingSuccess.phone})</p>
            <p><strong>Thiết bị:</strong> {bookingSuccess.deviceType === 'PC' ? 'Dàn Máy Tính Để Bàn (Desktop PC)' : 'Máy Tính Xách Tay (Laptop Gaming / Văn Phòng)'}</p>
            <p><strong>Địa điểm tiếp nhận:</strong> {bookingSuccess.showroom}</p>
            <p><strong>Khung giờ hẹn:</strong> {bookingSuccess.time} ngày {new Date(bookingSuccess.date).toLocaleDateString('vi-VN')}</p>
            <p className="text-amber-400 font-semibold pt-1">
              * Quý khách vui lòng mang thiết bị đến trước 10 phút để chuyên viên kỹ thuật tiếp nhận máy nhanh nhất.
            </p>
          </div>

          <button
            onClick={() => setBookingSuccess(null)}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Đăng Ký Cho Thiết Bị Khác
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Device Type Toggle */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
              Chọn Loại Thiết Bị Cần Chăm Sóc
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeviceType('PC')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  deviceType === 'PC'
                    ? 'bg-rose-950/40 border-rose-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Monitor className={`w-6 h-6 ${deviceType === 'PC' ? 'text-rose-500' : 'text-slate-500'}`} />
                <div>
                  <p className="text-xs font-bold text-white">Máy Tính Bàn (PC)</p>
                  <span className="text-[10px] text-slate-400">Vệ sinh thùng máy & card đồ họa</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('LAPTOP')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  deviceType === 'LAPTOP'
                    ? 'bg-rose-950/40 border-rose-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Laptop className={`w-6 h-6 ${deviceType === 'LAPTOP' ? 'text-rose-500' : 'text-slate-500'}`} />
                <div>
                  <p className="text-xs font-bold text-white">Laptop Gaming / Văn Phòng</p>
                  <span className="text-[10px] text-slate-400">Vệ sinh quạt gió & tra keo tản nhiệt</span>
                </div>
              </button>
            </div>
          </div>

          {/* Showroom & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-300 block mb-1">Chọn Showroom Thuận Tiện Nhất *</label>
              <select
                value={showroom}
                onChange={e => setShowroom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                {SHOWROOM_LIST.map((sr, idx) => (
                  <option key={idx} value={sr.name}>
                    {sr.name} - {sr.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Ngày Hẹn Tiếp Nhận</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Khung Giờ Hẹn</label>
              <select
                value={appointmentTime}
                onChange={e => setAppointmentTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="09:00">09:00 - Sáng</option>
                <option value="10:30">10:30 - Sáng</option>
                <option value="14:00">14:00 - Chiều</option>
                <option value="15:30">15:30 - Chiều</option>
                <option value="17:00">17:00 - Chiều</option>
                <option value="19:00">19:00 - Tối</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Thời Lượng Dự Kiến</label>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-semibold">
                30 - 45 Phút (Lấy Ngay)
              </div>
            </div>
          </div>

          {/* Customer Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Họ Tên Quý Khách *</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Số Điện Thoại Nhận SMS *</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ví dụ: 0988667788"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">Mô Tả Tình Trạng Thiết Bị</label>
              <textarea
                rows={2}
                value={deviceCondition}
                onChange={e => setDeviceCondition(e.target.value)}
                placeholder="Ví dụ: Máy nóng, quạt kêu to, bám nhiều bụi..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-cyan-600/25 transition-all uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Xác Nhận Đặt Lịch Miễn Phí</span>
          </button>
        </form>
      )}
    </div>
  );
};
