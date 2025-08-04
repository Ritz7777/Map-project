import React, { createContext, useContext } from 'react';
import { DataContextType } from '../types';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ 
  children: React.ReactNode; 
  value: DataContextType;
}> = ({ children, value }) => {
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
