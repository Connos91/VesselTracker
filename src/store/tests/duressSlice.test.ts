import { describe, expect, it } from 'vitest';
import type { CabinAction } from '../../domain/duress';
import { toVesselId } from '../../domain/primitives';
import {
  alertAcknowledged,
  cabinActionReported,
  watchClosed,
  watchOpened,
  watchToggled,
} from '../duressSlice';
import { makeStore } from '../store';

const AEGEAN_STAR = toVesselId('vessel-001');
const BLUE_HORIZON = toVesselId('vessel-003');
const UNREGISTERED = toVesselId('vessel-999');

const COMBINATION: readonly CabinAction[] = [
  'toilet-flush',
  'toilet-flush',
  'toilet-flush',
  'toilet-flush',
  'toilet-flush',
  'toilet-light',
  'toilet-light',
];

type Store = ReturnType<typeof makeStore>;

const watchOf = (store: Store, vesselId: ReturnType<typeof toVesselId>) => {
  return store.getState().duress.watches[vesselId];
};

const signal = (
  store: Store,
  vesselId: ReturnType<typeof toVesselId>,
  actions: readonly CabinAction[],
) => {
  actions.forEach((action, index) => {
    store.dispatch(cabinActionReported({ vesselId, action, at: 1_000_000 + index * 1_000 }));
  });
};

describe('the duress slice', () => {
  it('starts with nothing watched', () => {
    expect(makeStore().getState().duress.watches).toEqual({});
  });

  it('opens and closes a watch on one vessel', () => {
    const store = makeStore();

    store.dispatch(watchOpened(AEGEAN_STAR));
    expect(watchOf(store, AEGEAN_STAR)?.kind).toBe('watching');

    store.dispatch(watchClosed(AEGEAN_STAR));
    expect(watchOf(store, AEGEAN_STAR)?.kind).toBe('off');
  });

  it('toggles from whichever state it is in', () => {
    const store = makeStore();

    store.dispatch(watchToggled(AEGEAN_STAR));
    expect(watchOf(store, AEGEAN_STAR)?.kind).toBe('watching');

    store.dispatch(watchToggled(AEGEAN_STAR));
    expect(watchOf(store, AEGEAN_STAR)?.kind).toBe('off');
  });

  it('raises the alarm on the registered combination', () => {
    const store = makeStore();
    store.dispatch(watchOpened(AEGEAN_STAR));

    signal(store, AEGEAN_STAR, COMBINATION.slice(0, 6));
    expect(watchOf(store, AEGEAN_STAR)?.kind).toBe('watching');

    signal(store, AEGEAN_STAR, COMBINATION.slice(6));
    expect(watchOf(store, AEGEAN_STAR)?.kind).toBe('raised');
  });

  it('will not let a raised alarm be closed', () => {
    const store = makeStore();
    store.dispatch(watchOpened(AEGEAN_STAR));
    signal(store, AEGEAN_STAR, COMBINATION);

    store.dispatch(watchClosed(AEGEAN_STAR));
    store.dispatch(watchToggled(AEGEAN_STAR));

    expect(watchOf(store, AEGEAN_STAR)?.kind).toBe('raised');
  });

  it('clears only on acknowledgement', () => {
    const store = makeStore();
    store.dispatch(watchOpened(AEGEAN_STAR));
    signal(store, AEGEAN_STAR, COMBINATION);

    store.dispatch(alertAcknowledged(AEGEAN_STAR));
    expect(watchOf(store, AEGEAN_STAR)?.kind).toBe('watching');
  });

  it('keeps one vessel’s cabin out of another’s watch', () => {
    const store = makeStore();
    store.dispatch(watchOpened(AEGEAN_STAR));
    store.dispatch(watchOpened(BLUE_HORIZON));

    signal(store, AEGEAN_STAR, COMBINATION);

    expect(watchOf(store, AEGEAN_STAR)?.kind).toBe('raised');
    expect(watchOf(store, BLUE_HORIZON)?.kind).toBe('watching');
  });

  it('ignores reports for a vessel with no combination on file', () => {
    const store = makeStore();
    store.dispatch(watchOpened(UNREGISTERED));
    signal(store, UNREGISTERED, COMBINATION);

    expect(watchOf(store, UNREGISTERED)?.kind).toBe('watching');
  });

  it('gives every store its own state, so nothing leaks between them', () => {
    const first = makeStore();
    first.dispatch(watchOpened(AEGEAN_STAR));
    signal(first, AEGEAN_STAR, COMBINATION);

    expect(makeStore().getState().duress.watches).toEqual({});
  });
});
