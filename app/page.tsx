import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HistoryList } from './components/HistoryList';
import { Footer } from './components/Footer';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export default async function Home() {
  const session = await getSession();
  let user = null;
  if (session) {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, avatarUrl: true, id: true }
    });
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <Header user={user} />
      <ClientWrapper user={user} />
      <Footer />
    </main>
  );
}

// Separate client logic
import { ClientWrapper } from './components/ClientWrapper';