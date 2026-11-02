import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-900/90 text-emerald-100 border-emerald-500/50',
    error: 'bg-rose-900/90 text-rose-100 border-rose-500/50',
    info: 'bg-cyan-900/90 text-cyan-100 border-cyan-500/50',
  }[toast.type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }[toast.type];

  return (
    <div
      id="global-toast-notification"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md border text-sm font-medium animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className={`p-1.5 rounded-lg ${bgStyles}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-slate-100 font-sans">{toast.message}</span>
    </div>
  );
};
