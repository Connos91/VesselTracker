import { DivIcon } from 'leaflet';
import { assertNever } from '../../domain/assertNever';
import type { VesselGlyph } from '../../domain/vessel';
import type { VesselType } from '../../domain/vessel';
import { colorForVesselType } from '../vesselStyle';

const ICON_SIZE = 34;
const CENTER = ICON_SIZE / 2;

export interface VesselIconSpec {
  readonly glyph: VesselGlyph;
  readonly type: VesselType;
  readonly selected: boolean;
  readonly dimmed: boolean;
}

const renderGlyph = (glyph: VesselGlyph, color: string): string => {
  switch (glyph.shape) {
    case 'arrow':
      return `<g transform="rotate(${glyph.rotationDegrees} ${CENTER} ${CENTER})"><path d="M17 5 L24.5 27 L17 22 L9.5 27 Z" style="fill:${color};stroke:var(--marker-outline)" stroke-width="1.75" stroke-linejoin="round"/></g>`;
    case 'circle':
      return `<circle cx="${CENTER}" cy="${CENTER}" r="6.5" style="fill:${color};stroke:var(--marker-outline)" stroke-width="2.5"/><circle cx="${CENTER}" cy="${CENTER}" r="2" style="fill:var(--marker-outline)"/>`;
    default:
      return assertNever(glyph, 'vessel glyph');
  }
};

const renderSelectionRing = (): string => {
  return `<circle cx="${CENTER}" cy="${CENTER}" r="14" fill="none" style="stroke:var(--marker-outline)" stroke-width="4"/><circle cx="${CENTER}" cy="${CENTER}" r="14" fill="none" style="stroke:var(--marker-ring)" stroke-width="2" stroke-dasharray="4 3"/>`;
};

const buildHtml = ({ glyph, type, selected, dimmed }: VesselIconSpec): string => {
  const color = colorForVesselType(type);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" aria-hidden="true" focusable="false" opacity="${dimmed ? 0.35 : 1}">`,
    selected ? renderSelectionRing() : '',
    renderGlyph(glyph, color),
    '</svg>',
  ].join('');
};

const iconCache = new Map<string, DivIcon>();

export const vesselIcon = (spec: VesselIconSpec): DivIcon => {
  const rotation = spec.glyph.shape === 'arrow' ? spec.glyph.rotationDegrees : -1;
  const key = `${spec.type}|${spec.glyph.shape}|${rotation}|${spec.selected}|${spec.dimmed}`;

  const cached = iconCache.get(key);
  if (cached !== undefined) return cached;

  const icon = new DivIcon({
    html: buildHtml(spec),
    className: 'vessel-marker',
    iconSize: [ICON_SIZE, ICON_SIZE],
    iconAnchor: [CENTER, CENTER],
  });
  iconCache.set(key, icon);
  return icon;
};

const PULSE_SIZE = 68;
const PULSE_CENTER = PULSE_SIZE / 2;

const pulseCache = new Map<VesselType, DivIcon>();

export const pulseIcon = (type: VesselType): DivIcon => {
  const cached = pulseCache.get(type);
  if (cached !== undefined) return cached;

  const icon = new DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${PULSE_SIZE}" height="${PULSE_SIZE}" viewBox="0 0 ${PULSE_SIZE} ${PULSE_SIZE}" aria-hidden="true" focusable="false"><circle class="vessel-pulse" cx="${PULSE_CENTER}" cy="${PULSE_CENTER}" r="10" fill="none" style="stroke:${colorForVesselType(type)}" stroke-width="2.5"/></svg>`,
    className: 'vessel-marker',
    iconSize: [PULSE_SIZE, PULSE_SIZE],
    iconAnchor: [PULSE_CENTER, PULSE_CENTER],
  });
  pulseCache.set(type, icon);
  return icon;
};
