
'use client';

export function Sidebar() {
  return (
    <aside className="w-64 glass-sidebar hidden lg:flex flex-col z-20 h-full fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-[7px] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[18px]">bolt</span>
          </div>
          <span className="font-semibold text-[19px] tracking-tight text-[#1d1d1f]">Wechat2doc</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <a className="flex items-center gap-3 px-3 py-2.5 bg-black/[0.04] rounded-xl text-[14px] font-semibold text-black" href="#">
          <span className="material-symbols-outlined text-[20px]">grid_view</span>
          我的知识库
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 hover:bg-black/[0.02] rounded-xl text-[14px] font-medium text-black/60 hover:text-black transition-colors" href="#">
          <span className="material-symbols-outlined text-[20px]">history</span>
          转存历史
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 hover:bg-black/[0.02] rounded-xl text-[14px] font-medium text-black/60 hover:text-black transition-colors" href="#">
          <span className="material-symbols-outlined text-[20px]">settings</span>
          偏好设置
        </a>
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="bg-black/[0.03] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-black/40 uppercase">存储空间</span>
            <span className="text-[12px] font-bold">45%</span>
          </div>
          <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
            <div className="h-full bg-black w-[45%]"></div>
          </div>
          <p className="mt-3 text-[11px] text-black/40 leading-relaxed">
            已存 2.3 GB / 共 5 GB
          </p>
        </div>
      </div>
    </aside>
  );
}
