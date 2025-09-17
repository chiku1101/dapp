import React, { useState } from 'react';
import WalletConnection from './components/WalletConnection';
import IssuerInterface from './components/IssuerInterface';
import VerifierInterface from './components/VerifierInterface';
import SubjectInterface from './components/SubjectInterface';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('issuer');
  const [isConnected, setIsConnected] = useState(false);

  const tabs = [
    { 
      id: 'issuer', 
      label: 'Issue Credentials', 
      icon: '📋',
      description: 'Create and issue verifiable credentials'
    },
    { 
      id: 'verifier', 
      label: 'Verify Credentials', 
      icon: '✅',
      description: 'Verify the authenticity of credentials'
    },
    { 
      id: 'subject', 
      label: 'My Identity', 
      icon: '👤',
      description: 'Manage your digital identity'
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'issuer':
        return <IssuerInterface />;
      case 'verifier':
        return <VerifierInterface />;
      case 'subject':
        return <SubjectInterface />;
      default:
        return <IssuerInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">🔐</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DID Blockchain Wallet</h1>
                <p className="text-sm text-gray-600">Decentralized Identity Management</p>
              </div>
            </div>
            <WalletConnection onConnectionChange={setIsConnected} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            🚀 Next-Gen Identity Solution
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Secure Digital Identity
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage verifiable credentials on the blockchain with complete privacy and security
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={tab.description}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Tab Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
            <span className="text-2xl mr-2">{tabs.find(tab => tab.id === activeTab)?.icon}</span>
            <span className="font-medium text-gray-700">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </span>
          </div>
        </div>

        {/* Content Area with Animation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {!isConnected ? (
            <div className="text-center py-16 px-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Wallet</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Connect your MetaMask wallet to start managing your decentralized identity and verifiable credentials
              </p>
            </div>
          ) : (
            <div className="p-8 tab-content-animation">
              {renderTabContent()}
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: '🔒', title: 'Secure', desc: 'Blockchain-based security' },
            { icon: '⚡', title: 'Fast', desc: 'Instant verification' },
            { icon: '🌐', title: 'Decentralized', desc: 'No central authority' }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-600">© 2024 DID Blockchain Wallet | Secure Identity Management</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
