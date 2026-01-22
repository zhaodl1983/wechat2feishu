
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
          {user && (
             <div className="relative group">
                <a className="text-black font-semibold" href="/">我的转存</a>
                <span className="absolute -bottom-2.5 left-1/2 w-1 h-1 -translate-x-1/2 rounded-full bg-black"></span>
             </div>
          )}
          <a className="hover:text-black transition-colors" href="/changelog">迭代记录</a>
        </nav>
        
        {status === "authenticated" && user ? (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/5 border border-black/[0.03] hover:bg-black/10 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[16px] text-black/40">person</span>
                )}
              </div>
              <span className="text-[13px] font-medium text-black/70">{user.name || user.email?.split('@')[0]}</span>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 flex flex-col z-[60]">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-gray-50 transition-colors"
                >
                  退出登录
                </button>
              </div>
            )}
            
            {/* Overlay for closing menu */}
            {showMenu && (
              <div 
                className="fixed inset-0 z-[-1]" 
                onClick={() => setShowMenu(false)}
              ></div>
            )}
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="px-5 py-1.5 rounded-full border border-black/10 text-[13px] font-semibold hover:bg-black hover:text-white transition-all text-[#1d1d1f] bg-white shadow-sm"
          >
            登录 / 注册
          </button>
        )}
      </div>
    </header>
  );
}
