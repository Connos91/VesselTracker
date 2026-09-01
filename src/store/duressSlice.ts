import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { duressCodeFor } from '../data/duressCodes';
import {
  acknowledgeWatch,
  armWatch,
  disarmWatch,
  recordCabinEvent,
  WATCH_OFF,
} from '../domain/duress';
import type { CabinAction, DuressWatch } from '../domain/duress';
import type { VesselId } from '../domain/primitives';
import { toTimestamp } from '../domain/primitives';

export interface DuressState {
  watches: Record<VesselId, DuressWatch>;
}

const initialState: DuressState = { watches: {} };

export interface CabinReport {
  readonly vesselId: VesselId;
  readonly action: CabinAction;
  readonly at: number;
}

const withWatch = (
  state: DuressState,
  vesselId: VesselId,
  change: (watch: DuressWatch) => DuressWatch,
): DuressState => {
  return {
    watches: { ...state.watches, [vesselId]: change(state.watches[vesselId] ?? WATCH_OFF) },
  };
};

const duressSlice = createSlice({
  name: 'duress',
  initialState,
  reducers: {
    watchOpened(state, { payload }: PayloadAction<VesselId>) {
      return withWatch(state, payload, armWatch);
    },

    watchClosed(state, { payload }: PayloadAction<VesselId>) {
      return withWatch(state, payload, disarmWatch);
    },

    watchToggled(state, { payload }: PayloadAction<VesselId>) {
      return withWatch(state, payload, (watch) =>
        watch.kind === 'watching' ? disarmWatch(watch) : armWatch(watch),
      );
    },

    alertAcknowledged(state, { payload }: PayloadAction<VesselId>) {
      return withWatch(state, payload, acknowledgeWatch);
    },

    cabinActionReported(state, { payload }: PayloadAction<CabinReport>) {
      const code = duressCodeFor(payload.vesselId);
      if (code === null) return state;

      return withWatch(state, payload.vesselId, (watch) =>
        recordCabinEvent(watch, { action: payload.action, at: toTimestamp(payload.at) }, code),
      );
    },
  },
  selectors: {
    selectWatches: (state): Record<VesselId, DuressWatch> => state.watches,
  },
});

export const {
  watchOpened,
  watchClosed,
  watchToggled,
  alertAcknowledged,
  cabinActionReported,
} = duressSlice.actions;

export const { selectWatches } = duressSlice.selectors;

export const duressReducer = duressSlice.reducer;
