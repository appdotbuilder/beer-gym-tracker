import { z } from 'zod';

// Category enum for spending entries
export const categoryEnum = z.enum(['Beer', 'Gym']);
export type Category = z.infer<typeof categoryEnum>;

// Spending entry schema
export const spendingEntrySchema = z.object({
  id: z.number(),
  date: z.coerce.date(),
  category: categoryEnum,
  amount: z.number(),
  description: z.string().nullable(),
  created_at: z.coerce.date()
});

export type SpendingEntry = z.infer<typeof spendingEntrySchema>;

// Input schema for creating spending entries
export const createSpendingEntryInputSchema = z.object({
  date: z.coerce.date(),
  category: categoryEnum,
  amount: z.number().positive(),
  description: z.string().nullable()
});

export type CreateSpendingEntryInput = z.infer<typeof createSpendingEntryInputSchema>;

// Summary schema for dashboard
export const spendingSummarySchema = z.object({
  beerTotal: z.number(),
  gymTotal: z.number(),
  totalSpending: z.number(),
  personalityType: z.enum(['more an alcoholic', 'more a fitness enthusiast', 'balanced'])
});

export type SpendingSummary = z.infer<typeof spendingSummarySchema>;