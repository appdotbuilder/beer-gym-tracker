import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { type SpendingEntry } from '../schema';
import { desc } from 'drizzle-orm';

export const getSpendingEntries = async (): Promise<SpendingEntry[]> => {
  try {
    // Fetch all spending entries ordered by date (most recent first)
    const results = await db.select()
      .from(spendingEntriesTable)
      .orderBy(desc(spendingEntriesTable.date))
      .execute();

    // Convert numeric fields back to numbers and dates to Date objects
    return results.map(entry => ({
      ...entry,
      amount: parseFloat(entry.amount), // Convert string back to number
      date: new Date(entry.date), // Convert string back to Date
      created_at: new Date(entry.created_at) // Ensure proper Date object
    }));
  } catch (error) {
    console.error('Failed to fetch spending entries:', error);
    throw error;
  }
};