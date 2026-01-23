
'use client';

import { useState } from 'react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SyncModal({ isOpen, onClose, onSuccess }: SyncModalProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSync = async () => {
    if (!url) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Sync failed');
      }

      setUrl('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-white w-full max-w-[640px] rounded-[24px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <h3 className="text-[22px] font-bold tracking-tight">新转存</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors text-black/40 hover:text-black"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-8 pb-10">
          <p className="text-[15px] text-black/45 font-medium mb-8 leading-relaxed">
            粘贴微信公众号文章链接，瞬间归档至你的个人知识库。
          </p>

          <div className="flex flex-col gap-4">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[20px] text-black/25 group-focus-within:text-black/60 transition-colors">link</span>
              </div>
              <input
                className="w-full h-16 pl-14 pr-32 rounded-2xl recessed-input border-none focus:ring-1 focus:ring-black/5 text-[15px] font-medium placeholder:text-black/20 transition-all"
                placeholder="在此粘贴微信文章链接..."
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  onClick={handleSync}
                  disabled={loading}
                  className="tactile-button h-12 px-6 rounded-xl text-white text-[14px] font-semibold disabled:opacity-70"
                >
                  {loading ? '处理中...' : '一键转存'}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium px-2">{error}</div>
            )}

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-1.5 opacity-40">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span className="text-[12px] font-medium">智能提取</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-40">
                <span className="material-symbols-outlined text-[16px]">high_quality</span>
                <span className="text-[12px] font-medium">像素级还原</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-40">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span className="text-[12px] font-medium">隐私保护</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-black/[0.02] to-transparent"></div>
      </div>
    </div>
  );
}
