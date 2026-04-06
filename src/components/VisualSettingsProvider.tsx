import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService, VisualIdentity } from '../services/settings.service';

interface VisualSettingsContextType {
  settings: VisualIdentity;
  updateSettings: (newSettings: Partial<VisualIdentity>) => Promise<void>;
  isLoading: boolean;
}

const VisualSettingsContext = createContext<VisualSettingsContextType | undefined>(undefined);

export const VisualSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VisualIdentity>({
    logo_url: '',
    primary_color: '#0F8B8D',
    success_color: '#10B981',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getVisualIdentity();
        setSettings(data);
        applyColors(data);
      } catch (error) {
        console.error('Erro ao buscar configurações visuais:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const applyColors = (identity: VisualIdentity) => {
    const root = document.documentElement;
    if (identity.primary_color) {
      root.style.setProperty('--color-primary', identity.primary_color);
      // For button gradients and other components that might use custom variants
      root.style.setProperty('--primary', identity.primary_color);
    }
    if (identity.success_color) {
      root.style.setProperty('--color-secondary', identity.success_color);
      root.style.setProperty('--secondary', identity.success_color);
    }
  };

  const updateSettings = async (newSettings: Partial<VisualIdentity>) => {
    try {
      const updated = await settingsService.updateVisualIdentity(newSettings);
      setSettings(updated);
      applyColors(updated);
    } catch (error) {
      console.error('Erro ao atualizar configurações visuais:', error);
      throw error;
    }
  };

  return (
    <VisualSettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </VisualSettingsContext.Provider>
  );
};

export const useVisualSettings = () => {
  const context = useContext(VisualSettingsContext);
  if (context === undefined) {
    throw new Error('useVisualSettings must be used within a VisualSettingsProvider');
  }
  return context;
};