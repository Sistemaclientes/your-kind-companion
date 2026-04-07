import React, { createContext, useContext } from 'react';

interface VisualIdentity {
  logo_url: string;
  primary_color: string;
  success_color: string;
}

interface VisualSettingsContextType {
  settings: VisualIdentity;
  updateSettings: (newSettings: Partial<VisualIdentity>) => Promise<void>;
  isLoading: boolean;
}

const defaults: VisualIdentity = {
  logo_url: '',
  primary_color: '#0F8B8D',
  success_color: '#10B981',
};

const VisualSettingsContext = createContext<VisualSettingsContextType | undefined>(undefined);

export const VisualSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const updateSettings = async (_newSettings: Partial<VisualIdentity>) => {
    // No-op since configuracoes table doesn't exist
  };

  return (
    <VisualSettingsContext.Provider value={{ settings: defaults, updateSettings, isLoading: false }}>
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
