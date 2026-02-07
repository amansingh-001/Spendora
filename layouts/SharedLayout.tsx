import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import type { Page } from '../types';
import PageHeader from '../components/PageHeader';

interface SharedLayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  landing: { title: '', subtitle: '' },
  dashboard: { title: 'Dashboard', subtitle: 'A financial overview of your activities.' },
  invoice: { title: 'Process Invoice', subtitle: 'Upload an invoice to extract key information using AI.' },
  expense: { title: 'Categorize Expense', subtitle: 'Enter an expense to have AI categorize it for you.' },
  reconciliation: { title: 'Reconcile Statement', subtitle: 'Upload a bank statement to match against your ledger.' },
  ledger: { title: 'Financial Ledger', subtitle: 'A complete history of your processed invoices and expenses.' },
  history: { title: 'Processing History', subtitle: 'Review all past AI analysis and processing events.' },
  tax: { title: 'Tax Reminders', subtitle: 'Automatically generated reminders for GST and TDS filings.' },
  privacy: { title: '', subtitle: '' },
};

const SharedLayout: React.FC<SharedLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { title, subtitle } = pageTitles[currentPage] ?? { title: 'Spendora', subtitle: 'Smart Financial Tools' };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex">
      <div className="no-print">
        <Navbar currentPage={currentPage} onNavigate={onNavigate} />
      </div>
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <div className="no-print">
                  <PageHeader title={title} subtitle={subtitle} />
                </div>
                {children}
            </div>
        </main>
        <div className="no-print">
          <Footer onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};

export default SharedLayout;