import { assertNever } from '../../domain/assertNever';
import type { CompassDegrees } from '../../domain/primitives';
import type { VesselMotion } from '../../domain/vessel';

export type CompassCard =
  | {
      readonly kind: 'heading-up';
      readonly heading: CompassDegrees;
      readonly courseOverGround: CompassDegrees;
    }
  | { readonly kind: 'north-up' };

export const compassCardForMotion = (motion: VesselMotion): CompassCard => {
  switch (motion.kind) {
    case 'under-way':
      return {
        kind: 'heading-up',
        heading: motion.heading,
        courseOverGround: motion.courseOverGround,
      };
    case 'stationary':
      return { kind: 'north-up' };
    default:
      return assertNever(motion, 'vessel motion');
  }
};
