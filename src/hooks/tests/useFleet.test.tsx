import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fetchFleet } from '../../data/aisFeed';
import { SEED_VESSELS } from '../../data/seedVessels';
import { useFleet } from '../useFleet';

vi.mock('../../data/aisFeed', async () => {
  const actual =
    await vi.importActual<typeof import('../../data/aisFeed')>('../../data/aisFeed');
  return { ...actual, fetchFleet: vi.fn() };
});

const polled = vi.mocked(fetchFleet);

const renderFleet = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });
  return renderHook(() => useFleet(), {
    wrapper: ({ children }: { readonly children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
};

describe('useFleet', () => {
  it('serves the bundled snapshot at once, without polling for it', () => {
    const { result } = renderFleet();

    expect(result.current.vessels).toEqual(SEED_VESSELS);
    expect(result.current.isRefreshing).toBe(false);
    expect(polled).not.toHaveBeenCalled();
  });

  it('takes the fleet from the poll when one is asked for', async () => {
    const arriving = SEED_VESSELS.slice(0, 2);
    polled.mockResolvedValueOnce(arriving);

    const { result } = renderFleet();
    result.current.refresh();

    await waitFor(() => expect(result.current.vessels).toEqual(arriving));
    expect(polled).toHaveBeenCalledTimes(1);
  });

  it('keeps the last good fleet when a poll fails, and says so', async () => {
    polled.mockRejectedValueOnce(new Error('shore station unreachable'));

    const { result } = renderFleet();
    result.current.refresh();

    await waitFor(() => expect(result.current.hasFeedError).toBe(true));
    expect(result.current.vessels).toEqual(SEED_VESSELS);
  });
});
