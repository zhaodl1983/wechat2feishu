'use client';

import React, { useEffect, useState } from 'react';

interface Article {
  id: number;
  title: string;
  publishDate: string;
  status: string;
  feishuUrl?: string;
  createdAt: string;
}

interface HistoryListProps {
    refreshTrigger: number;
    isLoggedIn?: boolean;
}

export function HistoryList({ refreshTrigger, isLoggedIn }: HistoryListProps) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
          if (data.data) setArticles(data.data);
      })
      .catch(console.error);
  }, [refreshTrigger, isLoggedIn]);

  const handleDelete = async (id: number) => {
      if (!confirm('确定删除这条记录吗？')) return;
      try {
          await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
          setArticles(prev => prev.filter(a => a.id !== id));
      } catch (e) {
          console.error('Delete failed', e);
      }
  };

  const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return '刚刚';
      if (diffMins < 60) return `${diffMins}分钟前`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}小时前`;
      return date.toLocaleDateString();
  };

  if (articles.length === 0) {
      return (
        <section className="max-w-[1024px] mx-auto px-golden-sm pb-golden-xl">
            <div className="bg-white/40 backdrop-blur-md rounded-[24px] border border-black/[0.04] overflow-hidden min-h-[400px] flex flex-col items-center justify-center py-20 px-8 text-center shadow-sm">
                <div className="w-24 h-24 mb-6 rounded-[28px] bg-black/[0.02] border border-black/[0.04] flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-[48px] text-black/[0.08]">history</span>
                    <div className="absolute -right-2 -bottom-2 w-10 h-10 rounded-full bg-white shadow-sm border border-black/[0.05] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px] text-black/20">search</span>
                    </div>
                </div>
                <h4 className="text-[19px] font-semibold text-black/60 mb-2">暂无转存记录</h4>
                <p className="text-[14px] text-black/30 max-w-[280px] leading-relaxed mx-auto">
                    粘贴微信文章链接，开启你的第一个高保真知识库归档。
                </p>
                <button className="mt-8 px-6 py-2 rounded-full border border-black/10 text-[13px] font-medium text-black/60 hover:bg-black hover:text-white transition-all">
                    了解如何使用
                </button>
            </div>
        </section>
      );
  }

  return (
    <section className="max-w-[1024px] mx-auto px-golden-sm pb-golden-xl">
      <div className="flex items-center justify-between mb-8 px-2">
        {isLoggedIn ? (
            <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-black/30 tracking-[0.1em] uppercase">我的转存历史</h3>
                <span className="px-2 py-0.5 rounded-full bg-black/5 text-[11px] font-bold text-black/30">{articles.length}</span>
            </div>
        ) : (
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-vibrant-amber">trending_up</span>
                <h3 className="text-[14px] font-semibold text-black/30 tracking-[0.1em] uppercase">热门转存</h3>
            </div>
        )}
        
        {isLoggedIn ? (
            <button className="text-[13px] font-medium text-black/30 hover:text-vibrant-red transition-colors flex items-center gap-1.5 px-2">
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                清除记录
            </button>
        ) : (
            <span className="text-[12px] font-medium text-black/25">实时更新</span>
        )}
      </div>
      
      <div className="bg-white/40 backdrop-blur-md rounded-[24px] border border-black/[0.04] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[12px] font-bold text-black/30 uppercase tracking-wider">
              <th className="px-8 py-5">文章标题</th>
              <th className="px-8 py-5 hidden md:table-cell">{isLoggedIn ? '转存时间' : '转存时间'}</th>
              <th className={`px-8 py-5 ${isLoggedIn ? 'text-right pr-12' : 'text-center'}`}>{isLoggedIn ? '状态与操作' : '状态'}</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, index) => (
                <React.Fragment key={article.id}>
                    <tr className="group hover:bg-black/[0.02] transition-colors">
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                            {!isLoggedIn && (
                                <span className="rank-badge text-[13px] font-bold text-black/20 w-4">{String(index + 1).padStart(2, '0')}</span>
                            )}
                            <div className="flex flex-col gap-1">
                                <a 
                                    href={article.feishuUrl || '#'} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[16px] font-semibold text-black/85 leading-tight hover:text-black transition-colors line-clamp-1"
                                >
                                    {article.title || '正在处理...'}
                                </a>
                                <span className="md:hidden text-[13px] text-black/40">
                                    {formatTime(article.createdAt)}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                        <span className="text-[14px] text-black/40 font-medium">
                            {formatTime(article.createdAt)}
                        </span>
                    </td>
                    <td className={`px-8 py-6 ${isLoggedIn ? 'text-right pr-12' : ''}`}>
                        <div className={`flex items-center gap-5 ${isLoggedIn ? 'justify-end' : 'justify-center'}`}>
                            {isLoggedIn && (
                                <div className="flex items-center gap-4 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
                                    {article.feishuUrl && (
                                        <a className="action-icon" href={article.feishuUrl} target="_blank" rel="noreferrer" title="在飞书中查看">
                                            <span className="material-symbols-outlined text-[22px]">open_in_new</span>
                                        </a>
                                    )}
                                    <button className="action-icon delete" title="删除记录" onClick={() => handleDelete(article.id)}>
                                        <span className="material-symbols-outlined text-[22px]">delete</span>
                                    </button>
                                </div>
                            )}
                            
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden glass-icon-shade shrink-0 ${isLoggedIn ? 'group-hover:opacity-30 transition-opacity duration-300' : ''}`}>
                                {article.status === 'completed' ? (
                                    <span className="material-symbols-outlined text-[20px] text-vibrant-green status-glow-green">check_circle</span>
                                ) : article.status === 'error' ? (
                                    <span className="material-symbols-outlined text-[20px] text-vibrant-red status-glow-red">error</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[20px] text-vibrant-amber status-glow-amber animate-spin-slow">progress_activity</span>
                                )}
                            </div>
                        </div>
                    </td>
                    </tr>
                    {index < articles.length - 1 && (
                        <tr><td colSpan={3}><div className="sub-pixel-divider mx-8"></div></td></tr>
                    )}
                </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
