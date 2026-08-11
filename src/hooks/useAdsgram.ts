import { useCallback, useEffect, useRef } from 'react';

export interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: 'load' | 'render' | 'playing' | 'destroy';
  error: boolean;
}

declare global {
  interface Window {
    Adsgram?: {
      init: (params: { blockId: string }) => {
        show: () => Promise<ShowPromiseResult>;
      };
    };
  }
}

interface UseAdsgramParams {
  blockId?: string;
  onReward: () => void;
  onError?: (result: any) => void;
}

export function useAdsgram({ blockId, onReward, onError }: UseAdsgramParams) {
  const AdControllerRef = useRef<any>(undefined);

  useEffect(() => {
    if (blockId && typeof window !== 'undefined' && window.Adsgram) {
      try {
        AdControllerRef.current = window.Adsgram.init({ blockId });
      } catch (e) {
        console.error('Failed to init Adsgram:', e);
      }
    }
  }, [blockId]);

  return useCallback(async () => {
    if (!blockId) {
      // If no blockId is set, proceed directly
      onReward();
      return;
    }

    if (AdControllerRef.current) {
      AdControllerRef.current
        .show()
        .then(() => {
          onReward();
        })
        .catch((result: any) => {
          console.warn('Adsgram show error or ad skipped:', result);
          if (onError) {
            onError(result);
          } else {
            // In preview mode or if ad blocked by adblocker, fallback gracefully
            if (result?.description?.includes('not loaded') || result?.error) {
              onReward();
            }
          }
        });
    } else {
      console.warn('Adsgram SDK not loaded in window, simulating ad view for testing.');
      onReward();
    }
  }, [blockId, onError, onReward]);
}
