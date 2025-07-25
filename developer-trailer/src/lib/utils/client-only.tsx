'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to ensure component only renders on client side
 * Prevents hydration errors for components with dynamic content
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Component wrapper that only renders children on client side
 * Useful for components that use Date.now(), Math.random(), etc.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Generate UUID only on client side to avoid hydration errors
 */
export function useClientUUID() {
  const [uuid, setUuid] = useState<string>('');
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      setUuid(generateUUID());
    }
  }, [isClient]);

  return uuid;
}
