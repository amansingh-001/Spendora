import type { HistoryItem, HistoryItemForCreation, InvoiceHistoryItem, InvoiceHistoryItemForCreation, ExpenseHistoryItem, ExpenseHistoryItemForCreation, ReconciliationHistoryItem, ReconciliationHistoryItemForCreation } from '../types';

const HISTORY_KEY = 'demystify_finance_history';

/**
 * Retrieves the analysis history from local storage.
 * @returns An array of HistoryItem, sorted with the most recent first.
 */
export const getHistory = (): HistoryItem[] => {
  try {
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    if (!rawHistory) {
      return [];
    }
    const history = JSON.parse(rawHistory) as HistoryItem[];
    // Sort by ID (timestamp) descending
    return history.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
};

/**
 * Saves a new item to the history.
 * @param item The history item to save, without an 'id' property.
 * @returns The newly created history item with its ID.
 */
// FIX: Added function overloads to ensure that saveHistoryItem returns a more specific type
// based on the input, allowing for type-safe property access on the returned object.
export function saveHistoryItem(item: InvoiceHistoryItemForCreation): InvoiceHistoryItem;
export function saveHistoryItem(item: ExpenseHistoryItemForCreation): ExpenseHistoryItem;
export function saveHistoryItem(item: ReconciliationHistoryItemForCreation): ReconciliationHistoryItem;
export function saveHistoryItem(item: HistoryItemForCreation): HistoryItem {
  const history = getHistory();
  
  const newHistoryItem: HistoryItem = {
    ...item,
    id: Date.now(),
  } as HistoryItem;

  const updatedHistory = [newHistoryItem, ...history];
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save history item to localStorage", error);
  }
  return newHistoryItem;
};