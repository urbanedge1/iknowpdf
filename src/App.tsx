import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Layout/Header';
import { HomePage } from './pages/HomePage';
import { ToolsPage } from './pages/ToolsPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  const renderPage = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage setActiveSection={setActiveSection} />;
      case 'tools':
        return <ToolsPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <HomePage setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      {renderPage()}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;