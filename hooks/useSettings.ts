'use client';

import { useState } from 'react';

interface UserSettings {
  customGithubToken?: string;
  theme?: 'dark' | 'light';
}

export const useSettings = () => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('xandalyze_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse settings', e);
        }
      }
    }
    return null;
  });

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...userSettings, ...newSettings };
    setUserSettings(updated);
    localStorage.setItem('xandalyze_settings', JSON.stringify(updated));
  };

  return { userSettings, updateSettings };
};
