import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { type CreateSpendingEntryInput, type SpendingEntry } from '../schema';

export const createSpendingEntry = async (input: CreateSpendingEntryInput): Promise<SpendingEntry> => {
  try {
    // Insert spending entry record
    const result = await db.insert(spendingEntriesTable)
      .values({
        date: input.date.toISOString().split('T')[0], // Convert Date to string for date column
        category: input.category,
        amount: input.amount.toString(), // Convert number to string for numeric column
        description: input.description
      })  
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const entry = result[0];
    return {
      ...entry,
      amount: parseFloat(entry.amount), // Convert string back to number
      date: new Date(entry.date), // Convert string back to Date
      created_at: new Date(entry.created_at) // Ensure proper Date object
    };
  } catch (error) {
    console.error('Spending entry creation failed:', error);
    throw error;
  }
};