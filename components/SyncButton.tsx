'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, UploadCloud } from 'lucide-react';

interface SyncButtonProps {
    articleId: string;
    initialStatus: string;
    feishuUrl?: string | null;
}

export default function SyncButton({ articleId, initialStatus, feishuUrl }: SyncButtonProps) {
    const [status, setStatus] = useState(initialStatus); // stored, syncing, synced, error
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/articles/${articleId}/sync`, { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setStatus('synced');
            router.refresh(); // Refresh to potentially show new data if page uses it

            // Optional: Open in new tab
            if (data.feishuUrl) {
                window.open(data.feishuUrl, '_blank');
            }

        } catch (error) {
            console.error('Sync failed', error);
            alert('同步失败，请重试');
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'synced' || status === 'completed') {
        return (
            <a
                href={feishuUrl || '#'}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] text-black/60 rounded-full text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
            >
                <CheckCircle className="w-4 h-4 text-green-500" />
                已同步至飞书
            </a>
        );
    }

    return (
        <button
            onClick={handleSync}
            disabled={isLoading || status === 'syncing'}
            className={`
        relative overflow-hidden
        inline-flex items-center gap-2 px-5 py-2.5 
        bg-black text-white rounded-full text-sm font-semibold tracking-wide
        shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95 transition-all
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    同步中...
                </>
            ) : (
                <>
                    <UploadCloud className="w-4 h-4" />
                    推送到飞书
                </>
            )}
        </button>
    );
}
