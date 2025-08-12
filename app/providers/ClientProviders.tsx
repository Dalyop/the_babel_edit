'use client';

import React from 'react';
import { StoreProvider } from './StoreProvider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export const ClientProviders: React.FC<ClientProvidersProps> = ({ children }) => {
  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  );
};
