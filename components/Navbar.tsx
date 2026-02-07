import React from 'react';
import { SpendoraIcon, DashboardIcon, InvoiceIcon, ExpenseIcon, ReconciliationIcon, LedgerIcon, HistoryIcon, TaxIcon } from './icons';
import type { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { page: Page; label: string; icon: React.FC<any> }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { page: 'invoice', label: 'Process Invoice', icon: InvoiceIcon },
    { page: 'expense', label: 'Categorize Expense', icon: ExpenseIcon },
    { page: 'reconciliation', label: 'Reconcile', icon: ReconciliationIcon },
    { page: 'ledger', label: 'Ledger', icon: LedgerIcon },
    { page: 'history', label: 'History', icon: HistoryIcon },
    { page: 'tax', label: 'Tax Reminders', icon: TaxIcon },
];

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="w-64 bg-gray-900/80 border-r border-gray-800 flex-flex-col p-4">
      <div 
        className="flex items-center space-x-2 mb-8 cursor-pointer"
        onClick={() => onNavigate('landing')}
      >
        <SpendoraIcon className="w-8 h-8 text-green-400" />
        <span className="text-2xl font-bold text-white">Spendora</span>
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.page}>
            <button
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${currentPage === item.page
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
