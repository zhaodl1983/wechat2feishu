import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export default async function Changelog() {
  // Fetch user for Header
  const session = await getSession();
  let user = null;
  if (session) {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, avatarUrl: true, id: true }
    });
  }

  const versions = [
    {
      version: "V0.5",
      status: "planning",
      title: "社区与探索",
      desc: "上线透明数据看板、社区榜单系统与多用户探索模式。",
      date: "规划中"
    },
    {
      version: "V0.4",
      status: "progress",
      title: "SaaS 服务化",
      desc: "完善 SaaS 闭环，打磨内容还原质量。",
      date: "进行中"
    },
    {
      version: "V0.3",
      status: "done",
      title: "Web 界面化",
      desc: "构建了 Apple 极简风格的 Web 仪表盘，支持个性化欢迎语、可视化操作与转存历史管理。",
      date: "已上线"
    },
    {
      version: "V0.2",
      status: "done",
      title: "飞书深度集成",
      desc: "打通了飞书 API 集成，实现了图片自动上传与云文档的一键生成。",
      date: "已上线"
    },
    {
      version: "V0.1",
      status: "done",
      title: "核心归档器",
      desc: "实现了核心抓取引擎与 HTML 转 Markdown 的本地归档逻辑。",
      date: "已上线"
    }
  ];

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <Header user={user} />
      
      <div className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-[40px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
              迭代记录
            </h1>
            <p className="text-[19px] text-black/60 font-medium">
              Wechat2doc 的进化之路。
            </p>
          </div>

          <div className="space-y-12 relative before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-[2px] before:bg-black/[0.05]">
            {versions.map((v, i) => (
              <div key={i} className="relative flex gap-8 group">
                {/* Timeline Dot */}
                <div className={`
                  mt-1.5 w-[14px] h-[14px] rounded-full border-[3px] bg-white z-10 shrink-0 ml-[20px] transition-colors duration-300
                  ${v.status === 'planning' ? 'border-gray-300' : 
                    v.status === 'progress' ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 
                    'border-[#1d1d1f]'}
                `}></div>

                {/* Content */}
                <div className="flex-1 -mt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[24px] font-semibold text-[#1d1d1f] tracking-tight">
                      {v.version}
                    </span>
                    <span className={`
                      px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide
                      ${v.status === 'planning' ? 'bg-gray-100 text-gray-500' : 
                        v.status === 'progress' ? 'bg-blue-50 text-blue-600' : 
                        'bg-black/5 text-black/60'}
                    `}>
                      {v.date}
                    </span>
                  </div>
                  
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1">
                    {v.title}
                  </h3>
                  
                  <p className="text-[15px] leading-relaxed text-black/60">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
