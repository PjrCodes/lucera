"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface HeaderContextType {
  headerTitle: string;
  setHeaderTitle: (title: string) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerTitle, setHeaderTitle] = useState<string>("LUCERA"); // Default title

  return (
    <HeaderContext.Provider value={{ headerTitle, setHeaderTitle }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};
