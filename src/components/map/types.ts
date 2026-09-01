import type { Vessel } from '../../domain/vessel';
import type { Voyage, VoyageSample } from '../../domain/voyage';

export interface MapPlayback {
  readonly vessel: Vessel;
  readonly voyage: Voyage;
  readonly sample: VoyageSample;
}
