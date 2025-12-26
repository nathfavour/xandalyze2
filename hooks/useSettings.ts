'use client';

import { useState, useEffect } from 'react';

interface UserSettings {
  customGeminiKey?: string;
  theme?: 'dark' | 'light';
}

export const useSettings = () => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    // Load settings from localStorage on mount
    const saved = localStorage.getItem('xandalyze_settings');
    if (saved) {
      try {
        setUserSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...userSettings, ...newSettings };
    setUserSettings(updated);
    localStorage.setItem('xandalyze_settings', JSON.stringify(updated));
  };

  return { userSettings, updateSettings };
};
