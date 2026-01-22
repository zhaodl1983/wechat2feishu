import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ClientWrapper } from './components/ClientWrapper';

export default async function Home() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <Header />
      <ClientWrapper />
      <Footer />
    </main>
  );
}