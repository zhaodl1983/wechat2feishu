'use client';

import { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const user = session?.user;
  const isLoggedIn = status === "authenticated";

  // Dashboard Header Style
  if (isLoggedIn) {
    return (
      <header className="h-16 glass-nav border-b border-black/[0.03] px-6 flex items-center justify-between z-10 sticky top-0">
        {/* Mobile Logo */}
        <div className="flex items-center gap-4 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-[7px] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[18px]">bolt</span>
            </div>
            <span className="font-semibold text-[19px] tracking-tight text-[#1d1d1f]">Wechat2doc</span>
          </div>
        </div>

        {/* Desktop Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-[14px] font-medium text-black/40">知识库</span>
          <span className="material-symbols-outlined text-[16px] text-black/20">chevron_right</span>
          <span className="text-[14px] font-semibold">所有文档</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-black/30">search</span>
            <input 
              className="bg-black/[0.03] border-none rounded-full py-1.5 pl-10 pr-4 text-[13px] w-64 focus:ring-1 focus:ring-black/10 transition-all placeholder:text-black/30" 
              placeholder="搜索文档..." 
              type="text"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-apple-gray border border-black/5 overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/5 text-black/40">
                     <span className="material-symbols-outlined text-[18px]">person</span>
                  </div>
                )}
              </div>
              <span className="text-[13px] font-semibold hidden sm:block">{user?.name || user?.email?.split('@')[0]}</span>
            </button>

            {showMenu && (
              <>
                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 flex flex-col z-[60]">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-gray-50 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
                <div className="fixed inset-0 z-50 cursor-default" onClick={() => setShowMenu(false)}></div>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Public Header Style
  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-black/[0.03]">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-golden-sm h-16">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-black rounded-[7px] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">bolt</span>
          </div>
          <span className="font-semibold text-[19px] tracking-tight text-[#1d1d1f]">Wechat2doc</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-black/60">
          <a className="hover:text-black transition-colors" href="/">首页</a>
          <a className="hover:text-black transition-colors" href="/changelog">迭代记录</a>
        </nav>
        
        <button 
          onClick={handleLogin}
          className="px-5 py-1.5 rounded-full border border-black/10 text-[13px] font-semibold hover:bg-black hover:text-white transition-all text-[#1d1d1f] bg-white shadow-sm"
        >
          登录 / 注册
        </button>
      </div>
    </header>
  );
}