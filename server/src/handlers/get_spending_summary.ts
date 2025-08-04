import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { type SpendingSummary } from '../schema';
import { eq, sum } from 'drizzle-orm';

export const getSpendingSummary = async (): Promise<SpendingSummary> => {
  try {
    // Get Beer total
    const beerResults = await db.select({
      total: sum(spendingEntriesTable.amount)
    })
      .from(spendingEntriesTable)
      .where(eq(spendingEntriesTable.category, 'Beer'))
      .execute();

    // Get Gym total
    const gymResults = await db.select({
      total: sum(spendingEntriesTable.amount)
    })
      .from(spendingEntriesTable)
      .where(eq(spendingEntriesTable.category, 'Gym'))
      .execute();

    const beerTotal = parseFloat(beerResults[0]?.total || '0');
    const gymTotal = parseFloat(gymResults[0]?.total || '0');
    const totalSpending = beerTotal + gymTotal;

    // Determine personality type based on spending patterns
    let personalityType: 'more an alcoholic' | 'more a fitness enthusiast' | 'balanced';
    
    if (beerTotal > gymTotal) {
      personalityType = 'more an alcoholic';
    } else if (gymTotal > beerTotal) {
      personalityType = 'more a fitness enthusiast';
    } else {
      personalityType = 'balanced';
    }

    return {
      beerTotal,
      gymTotal,
      totalSpending,
      personalityType
    };
  } catch (error) {
    console.error('Failed to get spending summary:', error);
    throw error;
  }
};