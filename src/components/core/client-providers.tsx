'use client';

import { ProgressProvider } from '@bprogress/next/app';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="4px"
      color="#432325"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
