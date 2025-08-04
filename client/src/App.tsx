import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { SpendingEntry, CreateSpendingEntryInput, SpendingSummary } from '../../server/src/schema';
import './App.css';

function App() {
  const [entries, setEntries] = useState<SpendingEntry[]>([]);
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state with proper typing
  const [formData, setFormData] = useState<CreateSpendingEntryInput>({
    date: new Date(),
    category: 'Beer',
    amount: 0,
    description: null
  });

  // Load data functions
  const loadEntries = useCallback(async () => {
    try {
      const result = await trpc.getSpendingEntries.query();
      setEntries(result);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const result = await trpc.getSpendingSummary.query();
      setSummary(result);
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadEntries();
    loadSummary();
  }, [loadEntries, loadSummary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createSpendingEntry.mutate(formData);
      setEntries((prev: SpendingEntry[]) => [response, ...prev]);
      // Reload summary after adding entry
      await loadSummary();
      // Reset form
      setFormData({
        date: new Date(),
        category: 'Beer',
        amount: 0,
        description: null
      });
    } catch (error) {
      console.error('Failed to create entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for emojis and display
  const getCategoryEmoji = (category: string) => {
    return category === 'Beer' ? '🍺' : '💪';
  };

  const getPersonalityEmoji = (personalityType: string) => {
    switch (personalityType) {
      case 'more an alcoholic':
        return '🍺';
      case 'more a fitness enthusiast':
        return '💪';
      case 'balanced':
        return '⚖️';
      default:
        return '🤷';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💰 Personal Spending Tracker 💰
          </h1>
          <p className="text-gray-600">
            Track your Beer 🍺 and Gym 💪 expenses to discover your lifestyle balance!
          </p>
        </div>

        {/* Summary Dashboard */}
        {summary && (
          <Card className="mb-8 bg-white shadow-lg card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-center gradient-text">
                📊 Spending Summary Dashboard 📊
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-200 card-hover">
                  <div className="text-4xl mb-2 emoji-bounce">🍺</div>
                  <div className="text-3xl font-bold text-amber-600">
                    ${summary.beerTotal.toFixed(2)}
                  </div>
                  <div className="text-sm text-amber-700 font-medium">🍻 Beer Spending</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 card-hover">
                  <div className="text-4xl mb-2 emoji-bounce">💪</div>
                  <div className="text-3xl font-bold text-green-600">
                    ${summary.gymTotal.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-700 font-medium">🏋️ Gym Spending</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 card-hover">
                  <div className="text-4xl mb-2 emoji-pulse">💸</div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${summary.totalSpending.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">💰 Total Spending</div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Personality Type Display */}
              <div className="personality-card text-center p-8 rounded-xl">
                <div className="text-8xl mb-4 emoji-pulse">
                  {getPersonalityEmoji(summary.personalityType)}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-3">
                  🎭 Your Personality Type:
                </div>
                <Badge variant="secondary" className="text-xl px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
                  {getPersonalityEmoji(summary.personalityType)} {summary.personalityType}
                </Badge>
                <div className="text-base text-gray-700 mt-4 max-w-md mx-auto">
                  {summary.personalityType === 'more an alcoholic' && 
                    "🍻 You love your beverages! Maybe balance it out with some gym time? 💪✨"}
                  {summary.personalityType === 'more a fitness enthusiast' && 
                    "🏋️‍♀️ You're crushing your fitness goals! A celebratory drink won't hurt 🍺🎉"}
                  {summary.personalityType === 'balanced' && 
                    "🎯 Perfect balance! You know how to enjoy life while staying healthy! 🌟🙌"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Entry Form */}
          <Card className="bg-white shadow-lg card-hover">
            <CardHeader>
              <CardTitle className="text-xl">✨ Add New Spending Entry 📝</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📅 Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date.toISOString().split('T')[0]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateSpendingEntryInput) => ({
                        ...prev,
                        date: new Date(e.target.value)
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🏷️ Category
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: 'Beer' | 'Gym') =>
                      setFormData((prev: CreateSpendingEntryInput) => ({
                        ...prev,
                        category: value
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beer">🍺 Beer</SelectItem>
                      <SelectItem value="Gym">💪 Gym</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    💵 Amount ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateSpendingEntryInput) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0
                      }))
                    }
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📝 Description (Optional)
                  </label>
                  <Input
                    placeholder="Optional description..."
                    value={formData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateSpendingEntryInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  {isLoading ? '⏳ Adding Entry...' : '✨ Add Entry 🎯'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Spending Entries List */}
          <Card className="bg-white shadow-lg card-hover">
            <CardHeader>
              <CardTitle className="text-xl">📋 Recent Spending Entries 📈</CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🤷‍♂️</div>
                  <p className="text-lg font-medium">No spending entries yet!</p>
                  <p className="text-sm mt-2">Add your first entry to get started 🚀✨</p>
                  <div className="mt-4 text-2xl">💫</div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {entries.map((entry: SpendingEntry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:border-purple-200 transition-all duration-300 card-hover"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {getCategoryEmoji(entry.category)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {getCategoryEmoji(entry.category)} {entry.category}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            📅 {formatDate(entry.date)}
                          </div>
                          {entry.description && (
                            <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                              💭 <span className="italic">{entry.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600 flex items-center justify-end gap-1">
                          💰 ${entry.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center justify-end gap-1">
                          🕒 {entry.created_at.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t-2 border-gray-200">
          <p className="text-gray-600 text-lg font-medium">
            🎯 Track responsibly, live balanced! 🌟✨
          </p>
          <div className="mt-2 text-2xl">🚀💪🍺⚖️</div>
        </div>
      </div>
    </div>
  );
}

export default App;