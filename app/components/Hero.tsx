'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HeroProps {
  onSyncSuccess: () => void;
  isLoggedIn?: boolean;
}

export function Hero({ onSyncSuccess, isLoggedIn }: HeroProps) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSync = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

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
      onSyncSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1200px] mx-auto px-golden-sm text-center mb-golden-xl pt-32">
      <h1 className="headline-gradient text-[56px] md:text-[72px] font-bold leading-[1.05] mb-golden-sm mx-auto max-w-[900px] dark:text-white">
        极致打磨，<br />让微信灵感瞬时归档。
      </h1>
      <p className="text-[21px] md:text-[24px] text-black/45 dark:text-white/45 font-medium max-w-[640px] mx-auto mb-golden-lg leading-relaxed">
        以最优雅的方式，将深度好文保存至你的知识库。
        <span className="block text-black/30 dark:text-white/30">登录即刻开启高效转存之旅。</span>
      </p>

      <div className="max-w-[680px] mx-auto">
        <div className="recessed-input dark:bg-white/5 p-2 rounded-[22px] flex items-center gap-2 group transition-all focus-within:ring-4 focus-within:ring-black/5 dark:focus-within:ring-white/10">
          <div className="pl-4 flex items-center justify-center">
            <span className="material-symbols-outlined laser-icon text-[20px] dark:text-white/60">link</span>
          </div>
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-[17px] font-medium placeholder:text-black/25 dark:placeholder:text-white/25 py-3 outline-none text-[#1d1d1f] dark:text-white"
            placeholder="粘贴微信文章链接..."
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleSync}
            disabled={loading}
            className="tactile-button h-12 px-8 rounded-[14px] text-white text-[15px] font-semibold tracking-wide flex items-center justify-center"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin-slow text-[20px]">progress_activity</span>
            ) : (
              '一键转存'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 text-vibrant-red bg-red-50/50 px-4 py-2 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2.5 text-[13px] text-black/45 dark:text-white/45 font-medium group cursor-default">
            <div className="glass-finish-icon dark:bg-white/10 dark:border-white/5">
              <span className="material-symbols-outlined feature-tag-icon text-[19px] dark:text-white/60">auto_fix_high</span>
            </div>
            <span className="tracking-tight group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors">智能去噪正文提取</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-black/45 dark:text-white/45 font-medium group cursor-default">
            <div className="glass-finish-icon dark:bg-white/10 dark:border-white/5">
              <span className="material-symbols-outlined feature-tag-icon text-[19px] dark:text-white/60">grid_view</span>
            </div>
            <span className="tracking-tight group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors">像素级高保真渲染</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-black/45 dark:text-white/45 font-medium group cursor-default">
            <div className="glass-finish-icon dark:bg-white/10 dark:border-white/5">
              <span className="material-symbols-outlined feature-tag-icon text-[19px] dark:text-white/60" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>lock</span>
            </div>
            <span className="tracking-tight group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors">全链路隐私加密保护</span>
          </div>
        </div>
      </div>
    </section>
  );
}