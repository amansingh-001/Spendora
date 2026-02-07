export type Page =
  | 'landing'
  | 'dashboard'
  | 'invoice'
  | 'expense'
  | 'reconciliation'
  | 'ledger'
  | 'history'
  | 'tax'
  | 'privacy';

export interface InvoiceResult {
  vendor: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  category: string;
  taxType?: 'GST' | 'TDS';
  taxAmount?: number;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  summary: string;
}

export interface ExpenseResult {
  description: string;
  amount: number;
  category: string;
  justification: string;
}

export interface BankTransaction {
  date: string;
  description: string;
  amount: number;
}

export interface LedgerItem {
  date: string;
  description: string;
  category: string;
  amount: number;
}

export interface ReconciliationResult {
  matchedTransactions: {
    bankTransaction: BankTransaction;
    ledgerItem: LedgerItem;
  }[];
  unmatchedTransactions: {
    bankTransaction: BankTransaction;
    suggestedCategory: string;
  }[];
}

export interface FinancialReport {
  executiveSummary: string;
  expenseBreakdown: {
    category: string;
    totalAmount: number;
    percentage: number;
    color?: string;
  }[];
  keyInsights: string[];
  recommendations: string[];
}

export interface TaxReminder {
  id: number;
  taxType: 'GST' | 'TDS';
  dueDate: string; // YYYY-MM-DD
  amount: number;
  sourceInvoiceFile: string;
  sourceInvoiceId: number;
}

interface BaseHistoryItem {
  id: number;
}

export interface InvoiceHistoryItem extends BaseHistoryItem {
  type: 'invoice';
  fileName: string;
  invoiceResult: InvoiceResult;
}

export interface ExpenseHistoryItem extends BaseHistoryItem {
  type: 'expense';
  expenseResult: ExpenseResult;
}

export interface ReconciliationHistoryItem extends BaseHistoryItem {
  type: 'reconciliation';
  fileName: string;
  reconciliationResult: ReconciliationResult;
}

export type HistoryItem = InvoiceHistoryItem | ExpenseHistoryItem | ReconciliationHistoryItem;

// FIX: Defined explicit "ForCreation" types for each history item and combined them into a new union.
// This resolves excess property checking errors when creating history items via object literals.
export type InvoiceHistoryItemForCreation = Omit<InvoiceHistoryItem, 'id'>;
export type ExpenseHistoryItemForCreation = Omit<ExpenseHistoryItem, 'id'>;
export type ReconciliationHistoryItemForCreation = Omit<ReconciliationHistoryItem, 'id'>;
export type HistoryItemForCreation = InvoiceHistoryItemForCreation | ExpenseHistoryItemForCreation | ReconciliationHistoryItemForCreation;