'use client';

import { useState } from 'react';

interface HeaderProps {
  user: {
    name: string | null;
    avatarUrl: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-black/[0.03]">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-golden-sm h-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-[7px] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">bolt</span>
          </div>
          <span className="font-semibold text-[19px] tracking-tight text-[#1d1d1f]">Wechat2feishu</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-black/60">
          <a className="hover:text-black transition-colors" href="#">功能</a>
          <a className="hover:text-black transition-colors" href="#">工作流</a>
          <a className="hover:text-black transition-colors" href="#">定价</a>
        </nav>
        
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <img src={user.avatarUrl || ''} alt="Avatar" className="w-6 h-6 rounded-full" />
              <span className="text-[13px] font-semibold text-[#1d1d1f]">{user.name}</span>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 flex flex-col">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-gray-50"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="px-5 py-1.5 rounded-full border border-black/10 text-[13px] font-semibold hover:bg-black hover:text-white transition-all text-[#1d1d1f]"
          >
            登录飞书
          </button>
        )}
      </div>
    </header>
  );
}
