import { MainLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { ThemeToggle } from '@/components/common';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const Settings = () => {
  const { theme } = useTheme();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">Settings</h1>
          <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
            Manage your application preferences and settings
          </p>
        </div>

        {/* Appearance Settings */}
        <Card>
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">Appearance</h2>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    Customize the look and feel of your dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-3">
                Theme
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-border rounded-xl bg-gray-50 dark:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {theme === 'light' ? (
                          <Sun className="w-5 h-5 text-amber-500" />
                        ) : (
                          <Moon className="w-5 h-5 text-blue-500" />
                        )}
                        <span className="font-semibold text-gray-900 dark:text-foreground">
                          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        {theme === 'light' 
                          ? 'Light theme with bright colors and high contrast'
                          : 'Dark theme with reduced eye strain in low light'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Light Mode Preview */}
              <div className={`p-4 rounded-xl border-2 transition-all ${
                theme === 'light' 
                  ? 'border-primary-500 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-200 dark:border-border bg-white dark:bg-card'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-muted-foreground'}`} />
                  <span className={`text-sm font-semibold ${theme === 'light' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-muted-foreground'}`}>
                    Light Mode
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-muted rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-muted rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-muted rounded w-1/2" />
                </div>
              </div>

              {/* Dark Mode Preview */}
              <div className={`p-4 rounded-xl border-2 transition-all ${
                theme === 'dark' 
                  ? 'border-primary-500 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-200 dark:border-border bg-white dark:bg-card'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-muted-foreground'}`} />
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-muted-foreground'}`}>
                    Dark Mode
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-800 dark:bg-muted rounded w-full" />
                  <div className="h-3 bg-gray-800 dark:bg-muted rounded w-3/4" />
                  <div className="h-3 bg-gray-800 dark:bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

