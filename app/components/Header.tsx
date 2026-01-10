export function Header() {
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
          <button className="px-5 py-1.5 rounded-full border border-black/10 text-[13px] font-semibold hover:bg-black hover:text-white transition-all text-[#1d1d1f]">
            登录飞书
          </button>
        </div>
      </header>
    );
  }