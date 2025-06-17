'use client';

import { ProgressProvider } from '@bprogress/next/app';

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height="3px"
      color="#3b82f6"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};

export default ClientProviders;
