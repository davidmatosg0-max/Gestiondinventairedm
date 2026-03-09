import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useBalance, BalanceConfig, BalanceData } from '../hooks/useBalance';

interface BalanceContextType {
  isSupported: boolean;
  isConnected: boolean;
  currentWeight: BalanceData | null;
  error: string | null;
  detectedProtocol: string;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  isReconnecting: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  updateConfig: (newConfig: Partial<BalanceConfig>) => void;
  listPorts: () => Promise<SerialPort[]>;
  config: BalanceConfig;
  availablePorts: SerialPort[];
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const balanceData = useBalance();

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