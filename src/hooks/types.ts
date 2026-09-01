import type { CabinAction, DuressCode, DuressWatch } from '../domain/duress';
import type { Vessel } from '../domain/vessel';
import type { VesselTypeFilter } from './constants';

export interface ValueChangeEvent {
  readonly target: { readonly value: string };
}

export interface PressableProps {
  readonly type: 'button';
  readonly 'aria-pressed': boolean;
  readonly onClick: () => void;
}

export interface SearchInputProps {
  readonly type: 'search';
  readonly value: string;
  readonly onChange: (event: ValueChangeEvent) => void;
}

export interface TypeSelectProps {
  readonly value: VesselTypeFilter;
  readonly onChange: (event: ValueChangeEvent) => void;
}

export interface TimelineProps {
  readonly type: 'range';
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly value: number;
  readonly onChange: (event: ValueChangeEvent) => void;
}

export type SearchParamPatch = Readonly<Record<string, string | null>>;

export type HistoryMode = 'push' | 'replace';

export interface VesselDuress {
  readonly vessel: Vessel;
  readonly code: DuressCode | null;
  readonly watch: DuressWatch;
  readonly progress: number;
  readonly required: number;
  readonly isArmed: boolean;
  readonly isRaised: boolean;
  readonly arm: () => void;
  readonly disarm: () => void;
  readonly toggleArmed: () => void;
  readonly acknowledge: () => void;
  readonly report: (action: CabinAction) => void;
}
