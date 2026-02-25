import React, { createContext, useContext, ReactNode } from 'react';
import { useBalance, BalanceConfig, BalanceData } from '../hooks/useBalance';

interface BalanceContextType {
  isSupported: boolean;
  isConnected: boolean;
  currentWeight: BalanceData | null;
  error: string | null;
  detectedProtocol: string;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  updateConfig: (newConfig: Partial<BalanceConfig>) => void;
  config: BalanceConfig;
  availablePorts: SerialPort[];
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const balanceData = useBalance();
  
  // Debug logs
  React.useEffect(() => {
    console.log('🔌 BalanceProvider - Estado actualizado:', {
      isConnected: balanceData.isConnected,
      currentWeight: balanceData.currentWeight,
      weight: balanceData.currentWeight?.weight,
      stable: balanceData.currentWeight?.stable
    });
  }, [balanceData.isConnected, balanceData.currentWeight]);

  return (
    <BalanceContext.Provider value={balanceData}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalanceContext() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalanceContext must be used within a BalanceProvider');
  }
  return context;
}
