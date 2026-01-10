'use client';

import { useEffect, useState } from 'react';

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
}

export function HistoryList({ refreshTrigger }: HistoryListProps) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
          if (data.data) setArticles(data.data);
      })
      .catch(console.error);
  }, [refreshTrigger]);

  if (articles.length === 0) return null;

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

  return (
    <section className="max-w-[980px] mx-auto px-golden-sm pb-golden-xl">
      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="text-[14px] font-semibold text-black/30 tracking-[0.1em] uppercase">转存历史</h3>
        <button className="text-[13px] font-medium text-black/40 hover:text-black transition-colors">清除全部</button>
      </div>
      
      <div className="bg-white/40 backdrop-blur-md rounded-[24px] border border-black/[0.04] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[12px] font-bold text-black/30 uppercase tracking-wider">
              <th className="px-8 py-5">文章标题</th>
              <th className="px-8 py-5 hidden md:table-cell">转存时间</th>
              <th className="px-8 py-5 text-center">状态</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, index) => (
                <div key={article.id} style={{ display: 'contents' }}>
                    <tr className="group hover:bg-black/[0.02] transition-colors">
                    <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                        <a 
                            href={article.feishuUrl || '#'} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[16px] font-semibold text-black/85 leading-tight hover:text-black transition-colors"
                        >
                            {article.title || '正在处理...'}
                        </a>
                        <span className="md:hidden text-[13px] text-black/40">
                             {formatTime(article.createdAt)}
                        </span>
                        </div>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                        <span className="text-[14px] text-black/40 font-medium">
                            {formatTime(article.createdAt)}
                        </span>
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center justify-center">
                            {article.status === 'completed' ? (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center status-glow-green text-vibrant-green relative overflow-hidden glass-icon-shade">
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                </div>
                            ) : article.status === 'error' ? (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center status-glow-red text-vibrant-red relative overflow-hidden glass-icon-shade">
                                    <span className="material-symbols-outlined text-[20px]">error</span>
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center status-glow-amber text-vibrant-amber relative overflow-hidden glass-icon-shade">
                                    <span className="material-symbols-outlined text-[20px] animate-spin-slow">progress_activity</span>
                                </div>
                            )}
                        </div>
                    </td>
                    </tr>
                    {index < articles.length - 1 && (
                        <tr><td colSpan={3}><div className="sub-pixel-divider mx-8"></div></td></tr>
                    )}
                </div>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}