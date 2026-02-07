import React, { useState, useCallback } from 'react';
import type { Page, HistoryItem } from './types';
import SharedLayout from './layouts/SharedLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import InvoiceProcessorPage from './pages/InvoiceProcessorPage';
import ExpenseManagerPage from './pages/ExpenseManagerPage';
import ReconciliationPage from './pages/ReconciliationPage';
import LedgerPage from './pages/LedgerPage';
import HistoryPage from './pages/HistoryPage';
import TaxRemindersPage from './pages/TaxRemindersPage';
import PrivacyPage from './pages/PrivacyPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [historyItemToView, setHistoryItemToView] = useState<HistoryItem | null>(null);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
    setHistoryItemToView(null); // Reset item view on navigation
  }, []);
  
  const handleViewHistoryItem = useCallback((item: HistoryItem) => {
    setHistoryItemToView(item);
    // Navigate to the correct page for the item type
    if (item.type === 'invoice') {
      setCurrentPage('invoice');
    } else if (item.type === 'expense') {
      setCurrentPage('expense');
    } else if (item.type === 'reconciliation') {
      setCurrentPage('reconciliation');
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'invoice':
        return <InvoiceProcessorPage historyItem={historyItemToView?.type === 'invoice' ? historyItemToView : null} onViewHistoryItem={setHistoryItemToView} />;
      case 'expense':
        return <ExpenseManagerPage historyItem={historyItemToView?.type === 'expense' ? historyItemToView : null} onViewHistoryItem={setHistoryItemToView} />;
      case 'reconciliation':
        return <ReconciliationPage historyItem={historyItemToView?.type === 'reconciliation' ? historyItemToView : null} />;
      case 'ledger':
        return <LedgerPage />;
      case 'history':
        return <HistoryPage onViewItem={handleViewHistoryItem} />;
      case 'tax':
        return <TaxRemindersPage />;
      case 'privacy':
        return <PrivacyPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  if (currentPage === 'landing' || currentPage === 'privacy') {
    return renderPage();
  }

  return (
    <SharedLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </SharedLayout>
  );
};

export default App;
