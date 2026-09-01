import type { VesselId } from '../domain/primitives';
import type { Vessel } from '../domain/vessel';
import { SEARCH_PARAM_SELECTED } from './constants';
import type { PressableProps } from './types';
import { updateSearchParams, useSearchParams } from './useSearchParams';
import { pressableProps } from './utils';

export interface UseVesselSelectionResult {
  readonly selectedVessel: Vessel | null;
  readonly selectedId: VesselId | null;
  readonly isSelected: (vessel: Vessel) => boolean;
  readonly select: (vessel: Vessel) => void;
  readonly toggle: (vessel: Vessel) => void;
  readonly clearSelection: () => void;
  readonly getVesselItemProps: (vessel: Vessel) => PressableProps;
}

export const useVesselSelection = (vessels: readonly Vessel[]): UseVesselSelectionResult => {
  const params = useSearchParams();
  const requestedId = params.get(SEARCH_PARAM_SELECTED);
  const selectedVessel = vessels.find((vessel) => vessel.id === requestedId) ?? null;

  const isSelected = (vessel: Vessel): boolean => vessel.id === selectedVessel?.id;

  const select = (vessel: Vessel): void => {
    updateSearchParams({ [SEARCH_PARAM_SELECTED]: vessel.id }, 'push');
  };

  const clearSelection = (): void => {
    updateSearchParams({ [SEARCH_PARAM_SELECTED]: null }, 'push');
  };

  const toggle = (vessel: Vessel): void => {
    if (isSelected(vessel)) clearSelection();
    else select(vessel);
  };

  return {
    selectedVessel,
    selectedId: selectedVessel?.id ?? null,
    isSelected,
    select,
    toggle,
    clearSelection,
    getVesselItemProps: (vessel) => pressableProps(isSelected(vessel), () => toggle(vessel)),
  };
};
