
import { GoogleGenAI, Type } from "@google/genai";
import type { InvoiceResult, ReconciliationResult, FinancialReport, LedgerItem, HistoryItem } from "../types";


const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
const model = "gemini-2.5-flash";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};


export const processInvoice = async (file: File): Promise<InvoiceResult> => {
  const imagePart = await fileToGenerativePart(file);

  const prompt = `Analyze the provided invoice image and extract the following information in JSON format:
  - vendor: The name of the company that issued the invoice.
  - invoiceDate: The date the invoice was issued.
  - dueDate: The date the payment is due.
  - totalAmount: The total amount due.
  - category: A suggested expense category for this invoice (e.g., "Office Supplies", "Software", "Utilities", "Travel").
  - taxType: If GST or TDS is mentioned, specify "GST" or "TDS". Otherwise, omit this field.
  - taxAmount: If a tax amount is specified, extract it here. Otherwise, omit this field.
  - lineItems: A list of all items, including description, quantity, unit price, and total amount for each item.
  - summary: A brief one-sentence summary of the invoice.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      vendor: { type: Type.STRING },
      invoiceDate: { type: Type.STRING },
      dueDate: { type: Type.STRING },
      totalAmount: { type: Type.NUMBER },
      category: { type: Type.STRING },
      taxType: { type: Type.STRING, nullable: true },
      taxAmount: { type: Type.NUMBER, nullable: true },
      lineItems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unitPrice: { type: Type.NUMBER },
            amount: { type: Type.NUMBER },
          },
          required: ["description", "amount"]
        }
      },
      summary: { type: Type.STRING },
    },
    required: ["vendor", "totalAmount", "category", "lineItems", "summary"],
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  try {
    const jsonText = (response.text ?? "No response received. Please try again.").trim();
    return JSON.parse(jsonText) as InvoiceResult;
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text ?? "No response received. Please try again.");
    throw new Error("The AI returned an invalid response. Please try again.");
  }
};


export const categorizeExpense = async (description: string, amount: number): Promise<{ category: string, justification: string }> => {
  const prompt = `Categorize the following expense based on its description and amount. Provide a suitable category and a brief justification for your choice.
  Description: "${description}"
  Amount: $${amount}
  
  Possible categories include: Software, Marketing, Office Supplies, Travel, Utilities, Meals & Entertainment, Professional Services, Rent, Other.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING },
      justification: { type: Type.STRING },
    },
    required: ["category", "justification"],
  };

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  try {
    const jsonText = (response.text ?? "No response received. Please try again.").trim();
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text ?? "No response received. Please try again.");
    throw new Error("The AI returned an invalid response. Please try again.");
  }
};


export const reconcileStatement = async (statementText: string, ledgerItems: HistoryItem[]): Promise<ReconciliationResult> => {
  const financialLedgerItems = ledgerItems.flatMap(item => {
    if (item.type === 'invoice') {
      return [{ date: new Date(item.id).toLocaleDateString(), description: `Invoice from ${item.invoiceResult.vendor}`, amount: item.invoiceResult.totalAmount }];
    }
    if (item.type === 'expense') {
      return [{ date: new Date(item.id).toLocaleDateString(), description: item.expenseResult.description, amount: item.expenseResult.amount }];
    }
    return [];
  });

  const prompt = `Reconcile the following bank statement against the provided ledger.
  
  **Bank Statement:**
  \`\`\`
  ${statementText}
  \`\`\`

  **Ledger Items:**
  \`\`\`json
  ${JSON.stringify(financialLedgerItems, null, 2)}
  \`\`\`

  Your task is to:
  1. Identify bank transactions that match ledger items. A match occurs if the amount is very close and the description is related.
  2. List all unmatched bank transactions.
  3. For each unmatched transaction, suggest a likely expense category.

  Return the result in a JSON object.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      matchedTransactions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            bankTransaction: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
              },
              required: ["date", "description", "amount"],
            },
            ledgerItem: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
              },
              required: ["date", "description", "amount"],
            },
          },
        },
      },
      unmatchedTransactions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            bankTransaction: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
              },
              required: ["date", "description", "amount"],
            },
            suggestedCategory: { type: Type.STRING },
          },
        },
      },
    },
    required: ["matchedTransactions", "unmatchedTransactions"],
  };

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  try {
    const jsonText = (response.text ?? "No response received. Please try again.").trim();
    return JSON.parse(jsonText) as ReconciliationResult;
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text ?? "No response received. Please try again.");
    throw new Error("The AI returned an invalid response. Please try again.");
  }
};


export const generateFinancialReport = async (ledger: LedgerItem[]): Promise<FinancialReport> => {
  const prompt = `Analyze the following ledger of financial transactions and generate a detailed report in JSON format.
  
  **Ledger Data:**
  \`\`\`json
  ${JSON.stringify(ledger, null, 2)}
  \`\`\`

  The report should include:
  1.  **executiveSummary**: A concise, 2-3 sentence summary of the overall financial health and key trends.
  2.  **expenseBreakdown**: An array of objects, each with 'category', 'totalAmount', and 'percentage' of total expenses.
  3.  **keyInsights**: An array of 3-5 bullet-point strings identifying notable spending patterns, potential savings, or areas of concern.
  4.  **recommendations**: An array of 3-5 actionable recommendations for financial improvement.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING },
      expenseBreakdown: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            percentage: { type: Type.NUMBER },
          },
          required: ["category", "totalAmount", "percentage"],
        },
      },
      keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["executiveSummary", "expenseBreakdown", "keyInsights", "recommendations"],
  };

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  try {
    const jsonText = (response.text ?? "No response received. Please try again.").trim();
    return JSON.parse(jsonText) as FinancialReport;
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text ?? "No response received. Please try again.");
    throw new Error("The AI returned an invalid response. Please try again.");
  }
};
