import React from 'react';
import type { Page } from '../types';
import { SpendoraIcon, InvoiceIcon, ExpenseIcon, ReconciliationIcon, ShieldCheckIcon } from '../components/icons';
import { motion } from "framer-motion";


interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

const features = [
  {
    icon: InvoiceIcon,
    title: 'Automated Invoice Processing',
    description: 'Upload an invoice, and our AI will instantly extract vendor details, line items, totals, and due dates, saving you hours of manual data entry.',
  },
  {
    icon: ExpenseIcon,
    title: 'Intelligent Expense Categorization',
    description: 'Simply describe an expense, and our AI will suggest the most appropriate category, complete with a justification for its choice.',
  },
  {
    icon: ReconciliationIcon,
    title: 'Effortless Reconciliation',
    description: 'Upload a bank statement, and our system will automatically match transactions against your ledger, highlighting discrepancies for your review.',
  },
   {
    icon: ShieldCheckIcon,
    title: 'Private & Secure',
    description: 'Your data is processed ephemerally and is never stored on our servers. We use industry-standard encryption and privacy-focused AI services.',
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-black text-gray-300 flex flex-col">
      <header className="py-4 px-8 border-b border-gray-800">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <SpendoraIcon className="w-8 h-8 text-green-400" />
            <span
            
            className="text-2xl font-bold text-white">Spendora</span>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 text-sm font-semibold rounded-md text-black bg-green-400 hover:bg-green-500"
          >
            Go to App
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="max-w-4xl">
          <motion.h1 
           initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            AI-Powered Financial Tools, <span className="text-green-400">Simplified</span>.
          </motion.h1>
          <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-gray-400">
            From invoice processing to expense categorization, Spendora uses the power of Google Gemini to automate your tedious financial tasks, giving you more time to focus on what matters.
          </motion.p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="mt-10 px-8 py-4 text-lg font-semibold rounded-lg text-black bg-green-400 hover:bg-green-500 shadow-lg"
          >
            Get Started
          </button>
        </div>

        <div className="mt-24 w-full max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {features.map((feature) => (
              
              <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              key={feature.title} className="p-6 bg-gray-900/80 border border-gray-800 rounded-lg">
                <feature.icon className="w-8 h-8 mb-4 text-green-400" />
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
       <footer className="w-full py-6 text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <span>&copy; {new Date().getFullYear()} Spendora. All rights reserved.</span>
          <span className="mx-2 text-gray-700">|</span>
          <button onClick={() => onNavigate('privacy')} className="hover:text-green-400 hover:underline transition-colors">
            Privacy & Security
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
