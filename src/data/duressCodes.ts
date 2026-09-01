import type { DuressCode } from '../domain/duress';
import type { VesselId } from '../domain/primitives';
import { toVesselId } from '../domain/primitives';

const REGISTER: readonly (readonly [string, DuressCode])[] = [
  [
    'vessel-001',
    [
      { action: 'toilet-flush', times: 5 },
      { action: 'toilet-light', times: 2 },
    ],
  ],
  [
    'vessel-002',
    [
      { action: 'toilet-light', times: 3 },
      { action: 'wash-basin-tap', times: 3 },
    ],
  ],
  [
    'vessel-003',
    [
      { action: 'cabin-light', times: 2 },
      { action: 'toilet-flush', times: 3 },
      { action: 'cabin-light', times: 2 },
    ],
  ],
  [
    'vessel-004',
    [
      { action: 'wash-basin-tap', times: 4 },
      { action: 'toilet-flush', times: 2 },
    ],
  ],
  [
    'vessel-005',
    [
      { action: 'toilet-flush', times: 5 },
      { action: 'cabin-light', times: 2 },
    ],
  ],
  [
    'vessel-006',
    [
      { action: 'cabin-light', times: 4 },
      { action: 'toilet-light', times: 2 },
    ],
  ],
  [
    'vessel-007',
    [
      { action: 'toilet-light', times: 2 },
      { action: 'wash-basin-tap', times: 3 },
      { action: 'toilet-flush', times: 2 },
    ],
  ],
  [
    'vessel-008',
    [
      { action: 'wash-basin-tap', times: 5 },
      { action: 'toilet-light', times: 2 },
    ],
  ],
  [
    'vessel-009',
    [
      { action: 'toilet-flush', times: 3 },
      { action: 'wash-basin-tap', times: 2 },
      { action: 'toilet-light', times: 2 },
    ],
  ],
];

const CODES: ReadonlyMap<VesselId, DuressCode> = new Map(
  REGISTER.map(([id, code]) => [toVesselId(id), code]),
);

export const duressCodeFor = (id: VesselId): DuressCode | null => {
  return CODES.get(id) ?? null;
};
