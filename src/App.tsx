import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Gavel, PlusCircle, User2, Activity } from 'lucide-react';

import { Web3Provider } from './context/Web3Context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { AuctionDetails } from './pages/AuctionDetails';
import { CreateAuction } from './pages/CreateAuction';
import { MyAuctions } from './pages/MyAuctions';
import { BlockExplorer } from './pages/BlockExplorer';
import { Profile } from './pages/Profile';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState<string>('home');
  const [activeAuctionId, setActiveAuctionId] = useState<number | null>(null);

  const handleSelectAuction = (id: number) => {
    setActiveAuctionId(id);
    setActiveView('details');
  };

  const handleCreateSuccess = (id: number) => {
    setActiveAuctionId(id);
    setActiveView('details');
  };

  const renderActivePage = () => {
    switch (activeView) {
      case 'home':
        return <Home onNavigate={setActiveView} />;
      case 'marketplace':
        return <Marketplace onSelectAuction={handleSelectAuction} />;
      case 'create':
        return <CreateAuction onSuccess={handleCreateSuccess} />;
      case 'my-auctions':
        return <MyAuctions onSelectAuction={handleSelectAuction} onNavigate={setActiveView} />;
      case 'profile':
        return <Profile onSelectAuction={handleSelectAuction} onNavigate={setActiveView} />;
      case 'explorer':
        return <BlockExplorer />;
      case 'details':
        return activeAuctionId !== null ? (
          <AuctionDetails auctionId={activeAuctionId} onBack={() => setActiveView('marketplace')} />
        ) : (
          <Marketplace onSelectAuction={handleSelectAuction} />
        );
      default:
        return <Home onNavigate={setActiveView} />;
    }
  };

  const pageTransitionVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: 'easeIn' } }
  };

  // Mobile Bottom Navigation tabs list
  const mobileNavItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'marketplace', label: 'Market', icon: Gavel },
    { id: 'create', label: 'Launch', icon: PlusCircle },
    { id: 'my-auctions', label: 'Sellers', icon: User2 },
    { id: 'explorer', label: 'EVM Logs', icon: Activity },
  ];

  // Secure Landing Gate
  if (!isAuthenticated) {
    return (
      <>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#0D0A20',
              color: '#fff',
              borderRadius: '16px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              fontSize: '13px',
              padding: '12px 18px',
            },
          }}
        />
        <LandingPage />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#02000A] text-white flex flex-col font-sans antialiased SelectionColor relative select-none">
      {/* Global Toast notifications overlay */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F0A20',
            color: '#fff',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            fontSize: '13px',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: '#a78bfa',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#fff',
            }
          }
        }}
      />

      {/* Top Navbar */}
      <Navbar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Structural row split */}
      <div className="flex-1 flex flex-row items-stretch">
        
        {/* Desktop Collapsible Sidebar */}
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        {/* Core page body container */}
        <main className="flex-1 flex flex-col justify-between overflow-hidden pb-20 md:pb-0">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView + (activeAuctionId ? `-${activeAuctionId}` : '')}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full h-full"
              >
                {renderActivePage()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Minimal footer */}
          <Footer />
        </main>
      </div>

      {/* Mobile Floating Bottom Rail Navigation */}
      <div className="md:hidden fixed bottom-4 inset-x-4 h-16 rounded-2xl border border-white/10 bg-[#0F172A]/90 backdrop-blur-xl shadow-2xl z-40 flex items-center justify-around px-2 py-1">
        {mobileNavItems.map((item) => {
          const isActive = activeView === item.id || (item.id === 'marketplace' && activeView === 'details');
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                if (item.id !== 'details') setActiveAuctionId(null);
              }}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl cursor-pointer transition-colors relative"
            >
              {isActive && (
                <motion.div 
                  layoutId="mobile-active-blob"
                  className="absolute inset-0 bg-violet-500/10 rounded-xl -z-10 border border-violet-500/25"
                />
              )}
              <Icon className={`h-5 w-5 ${isActive ? 'text-violet-400' : 'text-gray-400 hover:text-white'}`} />
              <span className={`text-[9px] mt-1 font-semibold tracking-wide uppercase ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <MainLayout />
      </Web3Provider>
    </AuthProvider>
  );
}
