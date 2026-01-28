
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

interface QuotaData {
  current: number;
  limit: number;
  percentage: number;
  remaining: number;
}

interface SidebarProps {
  refreshTrigger?: number;
}

export function Sidebar({ refreshTrigger = 0 }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [quota, setQuota] = useState<QuotaData>({
    current: 0,
    limit: 20,
    percentage: 0,
    remaining: 20
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchQuota();
    }
  }, [session, refreshTrigger]);

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/user/quota');
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
      }
    } catch (error) {
      console.error('Failed to fetch quota:', error);
    } finally {
      setLoading(false);
    }
  };

  // Smart Logo click handler: 
  // - Deep pages (e.g., /articles/123) → navigate back to list (/)
  // - List page (/) → scroll to top
  const handleLogoClick = () => {
    const isDeepPage = pathname !== '/' && pathname.includes('/');

    if (isDeepPage) {
      router.push('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <aside className="w-64 glass-sidebar hidden lg:flex flex-col z-20 h-full fixed left-0 top-0 transition-colors">
      <div className="h-16 flex items-center px-6 mb-4">
        {/* Logo: Smart navigation - deep page → list, list → scroll top */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          title={pathname === '/' ? '回到顶部' : '返回列表'}
        >
          <div className="w-8 h-8 bg-black dark:bg-white rounded-[7px] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white dark:text-black text-[18px]">bolt</span>
          </div>
          <span className="font-semibold text-[19px] tracking-tight text-[#1d1d1f] dark:text-white">Wechat2doc</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <a className="flex items-center gap-3 px-3 py-2.5 bg-black/[0.04] dark:bg-white/10 rounded-xl text-[14px] font-semibold text-black dark:text-white transition-colors" href="#">
          <span className="material-symbols-outlined text-[20px]">grid_view</span>
          我的知识库
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl text-[14px] font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors" href="#">
          <span className="material-symbols-outlined text-[20px]">history</span>
          转存历史
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl text-[14px] font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors" href="#">
          <span className="material-symbols-outlined text-[20px]">settings</span>
          偏好设置
        </a>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-black/[0.03] dark:bg-white/5 rounded-2xl p-4 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-black/40 dark:text-white/40 uppercase">存储配额</span>
            <span className="text-[12px] font-bold dark:text-vibrant-blue">
              {loading ? '...' : `${quota.percentage}%`}
            </span>
          </div>
          <div className="w-full h-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-black dark:bg-vibrant-blue dark:shadow-[0_0_8px_rgba(10,132,255,0.4)] transition-all duration-300"
              style={{ width: `${quota.percentage}%` }}
            ></div>
          </div>
          <p className="mt-3 text-[11px] text-black/40 dark:text-white/40 leading-relaxed">
            {loading ? (
              '加载中...'
            ) : (
              <>
                已存 {quota.current} 篇 / 共 {quota.limit} 篇
                {quota.remaining > 0 && (
                  <span className="block mt-1 text-black/30 dark:text-white/30">
                    还可存储 {quota.remaining} 篇
                  </span>
                )}
                {quota.remaining === 0 && (
                  <span className="block mt-1 text-vibrant-red/80 font-medium">
                    配额已满
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </aside>
  );
}
