import type { TaxReminder } from '../types';

const TAX_REMINDERS_KEY = 'spendora_tax_reminders';

/**
 * Retrieves tax reminders from local storage.
 * @returns An array of TaxReminder, sorted by due date.
 */
export const getReminders = (): TaxReminder[] => {
  try {
    const rawReminders = localStorage.getItem(TAX_REMINDERS_KEY);
    if (!rawReminders) {
      return [];
    }
    const reminders = JSON.parse(rawReminders) as TaxReminder[];
    // Sort by due date ascending (soonest first)
    return reminders.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  } catch (error) {
    console.error("Failed to parse tax reminders from localStorage", error);
    return [];
  }
};

/**
 * Saves a new reminder.
 * @param reminder The reminder to save.
 */
export const addReminder = (reminder: Omit<TaxReminder, 'id'>): void => {
  try {
    const reminders = getReminders();
    const newReminder: TaxReminder = {
      ...reminder,
      id: Date.now(),
    };
    const updatedReminders = [...reminders, newReminder];
    localStorage.setItem(TAX_REMINDERS_KEY, JSON.stringify(updatedReminders));
  } catch (error) {
    console.error("Failed to save tax reminder to localStorage", error);
  }
};

/**
 * Calculates the due date for a given tax type based on an invoice date.
 * @param invoiceDate The date of the source invoice.
 * @param taxType The type of tax (GST or TDS).
 * @returns A Date object representing the due date.
 */
export const calculateDueDate = (invoiceDate: Date, taxType: 'GST' | 'TDS'): Date => {
  const date = new Date(invoiceDate);
  // Move to the next month
  date.setMonth(date.getMonth() + 1);

  if (taxType === 'GST') {
    date.setDate(20);
  } else if (taxType === 'TDS') {
    date.setDate(7);
  }
  
  
  date.setHours(0, 0, 0, 0);
  
  return date;
};
