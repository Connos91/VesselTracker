import { Marker } from 'react-leaflet';
import { toCompassDegrees } from '../../domain/primitives';
import type { VesselId } from '../../domain/primitives';
import { glyphForMotion } from '../../domain/vessel';
import type { Vessel } from '../../domain/vessel';
import { PULSE_Z, SELECTED_Z } from './constants';
import type { MapPlayback } from './types';
import { toTuple } from './utils';
import { pulseIcon, vesselIcon } from './vesselIcon';

export const FleetMarkers = ({
  vessels,
  selectedVessel,
  matchedIds,
  onSelectVessel,
  playedBackId,
}: {
  readonly vessels: readonly Vessel[];
  readonly selectedVessel: Vessel | null;
  readonly matchedIds: ReadonlySet<VesselId>;
  readonly onSelectVessel: (vessel: Vessel) => void;
  readonly playedBackId: VesselId | null;
}) => {
  return (
    <>
      {vessels.map((vessel) => {
        if (vessel.id === playedBackId) return null;

        const selected = vessel.id === selectedVessel?.id;
        return (
          <Marker
            key={vessel.id}
            position={toTuple(vessel.position)}
            icon={vesselIcon({
              glyph: glyphForMotion(vessel.motion),
              type: vessel.type,
              selected,
              dimmed: !matchedIds.has(vessel.id),
            })}
            keyboard
            title={`${vessel.name} — ${vessel.type}, ${vessel.motion.status}`}
            alt={`${vessel.name}, ${vessel.type}`}
            zIndexOffset={selected ? SELECTED_Z : 0}
            eventHandlers={{ click: () => onSelectVessel(vessel) }}
          />
        );
      })}
    </>
  );
};

export const SelectionPulse = ({ vessel }: { readonly vessel: Vessel }) => {
  return (
    <Marker
      key={vessel.id}
      position={toTuple(vessel.position)}
      icon={pulseIcon(vessel.type)}
      interactive={false}
      keyboard={false}
      zIndexOffset={PULSE_Z}
    />
  );
};

export const PlaybackMarker = ({ playback }: { readonly playback: MapPlayback }) => {
  const { vessel, voyage, sample } = playback;
  const rotationDegrees = toCompassDegrees(Math.round(sample.course) % 360);

  return (
    <Marker
      position={toTuple(sample.position)}
      icon={vesselIcon({
        glyph: { shape: 'arrow', rotationDegrees },
        type: vessel.type,
        selected: true,
        dimmed: false,
      })}
      keyboard={false}
      title={`${vessel.name} — track playback, ${voyage.from} to ${voyage.to}`}
      alt={`${vessel.name} on its track`}
      zIndexOffset={SELECTED_Z}
      interactive={false}
    />
  );
};
