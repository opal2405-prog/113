import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Share2, Smartphone, Globe, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import { Language } from '../types/planner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, lang }) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dedicated public shared URL for this app
  const shareUrl = 'https://ais-pre-weqbafsd5mnagrk5helgcm-736046421162.asia-northeast1.run.app';

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        shareUrl,
        {
          width: 180,
          margin: 1.5,
          color: {
            dark: '#1e1b4b', // deep indigo/ink
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Smart Study Planner · นิสิตแพทย์',
          text: 'ระบบจัดสรรตารางติวและคำนวณเวลาอ่านหนังสืออัจฉริยะ สำหรับนิสิตคณะแพทยศาสตร์',
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'th' ? 'แชร์เว็บไซต์ให้เพื่อนลองเล่น' : 'Share Website with Friends'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          {/* QR Code Canvas */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs inline-block">
              <canvas ref={canvasRef} className="rounded" />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 justify-center">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {lang === 'th'
                  ? 'ใช้กล้องมือถือหรือ LINE สแกนเปิดได้ทันที'
                  : 'Scan with mobile camera to open instantly'}
              </span>
            </p>
          </div>

          {/* Link box */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 block">
              {lang === 'th' ? 'ลิงก์เว็บไซต์สาธารณะ (Shared URL)' : 'Public Shared URL'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (lang === 'th' ? 'คัดลอกแล้ว!' : 'Copied!') : (lang === 'th' ? 'คัดลอก' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleNativeShare}
              className="flex-1 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{lang === 'th' ? 'แชร์ผ่านแอปอื่น' : 'Share via App'}</span>
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{lang === 'th' ? 'เปิดดูเว็บจริง' : 'Open Link'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Guidance note */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 text-left text-[11px] text-indigo-900 space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'th' ? 'คนอื่นเปิดเล่นได้ทันทีโดยไม่ต้องโหลดอะไร' : 'Ready to use without install'}</span>
            </p>
            <p className="text-indigo-800/80 leading-relaxed">
              {lang === 'th'
                ? 'เพื่อนของคุณสามารถเปิดผ่าน Google Chrome, Safari บนมือถือหรือไอแพด เพื่อลองจัดตารางติวและเช็คลิสต์ได้แบบเรียลไทม์'
                : 'Anyone with this link can test the scheduler, check off daily sessions, and tune study goals.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
