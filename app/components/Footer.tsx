export function Footer() {
    return (
      <footer className="py-golden-lg border-t border-black/[0.03] mt-golden-xl">
        <div className="max-w-[1200px] mx-auto px-golden-sm flex flex-col items-center">
          <div className="flex gap-12 text-[14px] font-medium text-black/40 mb-10">
            <a className="hover:text-black transition-colors" href="#">隐私条款</a>
            <a className="hover:text-black transition-colors" href="#">使用协议</a>
            <a className="hover:text-black transition-colors" href="#">开发文档</a>
            <a className="hover:text-black transition-colors" href="#">联系我们</a>
          </div>
          <div className="flex items-center gap-3 text-black/25">
            <span className="text-[12px] font-semibold tracking-widest uppercase">Wechat2feishu</span>
            <span className="w-1 h-1 rounded-full bg-black/10"></span>
            <span className="text-[13px]">Designed for perfection.</span>
          </div>
        </div>
      </footer>
    );
  }