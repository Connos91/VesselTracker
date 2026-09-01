import type { DivIcon } from 'leaflet';
import { describe, expect, it } from 'vitest';
import { SEED_VESSELS } from '../../data/seedVessels';
import { glyphForMotion, type Vessel } from '../../domain/vessel';
import { pulseIcon, vesselIcon } from './vesselIcon';
import { VESSEL_TYPE_COLOR } from '../vesselStyle';

const vesselNamed = (name: string): Vessel => {
  const vessel = SEED_VESSELS.find((candidate) => candidate.name === name);
  if (vessel === undefined) throw new Error(`No seed vessel named ${name}`);
  return vessel;
};

const iconFor = (name: string, selected = false, dimmed = false): DivIcon => {
  const vessel = vesselNamed(name);
  return vesselIcon({
    glyph: glyphForMotion(vessel.motion),
    type: vessel.type,
    selected,
    dimmed,
  });
};

const htmlOf = (icon: DivIcon): string => {
  const { html } = icon.options;
  if (typeof html !== 'string') throw new Error('Expected the div icon to carry SVG markup');
  return html;
};

describe('vesselIcon', () => {
  it('draws an under-way vessel as an arrow rotated to its heading', () => {
    const html = htmlOf(iconFor('Aegean Star'));
    expect(html).toContain('rotate(85 17 17)');
    expect(html).toContain('<path');
    expect(html).toContain(VESSEL_TYPE_COLOR.Cargo);
  });

  it('draws a moored vessel as a circle with no rotation', () => {
    const html = htmlOf(iconFor('Port Sentinel'));
    expect(html).not.toContain('rotate(');
    expect(html).not.toContain('<path');
    expect(html).toContain('<circle');
    expect(html).toContain(VESSEL_TYPE_COLOR.Tug);
  });

  it('colour-codes by vessel type', () => {
    expect(htmlOf(iconFor('Ocean Pearl'))).toContain(VESSEL_TYPE_COLOR.Tanker);
    expect(htmlOf(iconFor('Blue Horizon'))).toContain(VESSEL_TYPE_COLOR.Passenger);
    expect(htmlOf(iconFor('Anemos'))).toContain(VESSEL_TYPE_COLOR.Sailing);
  });

  it('marks the selection with a dashed ring, not colour alone', () => {
    const plain = htmlOf(iconFor('Blue Horizon'));
    const selected = htmlOf(iconFor('Blue Horizon', true));
    expect(plain).not.toContain('stroke-dasharray');
    expect(selected).toContain('stroke-dasharray');
  });

  it('de-emphasises vessels excluded by the current filters', () => {
    expect(htmlOf(iconFor('Levanto', false, true))).toContain('opacity="0.35"');
    expect(htmlOf(iconFor('Levanto'))).toContain('opacity="1"');
  });

  it('returns a referentially identical icon for an identical spec', () => {
    expect(iconFor('Cyprus Trader')).toBe(iconFor('Cyprus Trader'));
    expect(iconFor('Cyprus Trader')).not.toBe(iconFor('Cyprus Trader', true));
    expect(iconFor('Cyprus Trader')).not.toBe(iconFor('Aegean Star'));
  });

  it('never interpolates free text into the markup', () => {
    for (const vessel of SEED_VESSELS) {
      const html = htmlOf(
        vesselIcon({
          glyph: glyphForMotion(vessel.motion),
          type: vessel.type,
          selected: true,
          dimmed: false,
        }),
      );
      expect(html).not.toContain(vessel.name);
      expect(html).not.toContain(vessel.destination);
      expect(html).not.toContain(vessel.mmsi);
    }
  });
});

describe('the attention pulse', () => {
  it('is a layer of its own, not part of the vessel marker', () => {
    // It has to be separate: a selected vessel with a track is drawn by the
    // marker that walks its passage, and that marker takes a fresh icon at
    // every change of course.
    expect(htmlOf(iconFor('Cyprus Trader', true))).not.toContain('vessel-pulse');
    expect(htmlOf(pulseIcon('Cargo'))).toContain('vessel-pulse');
  });

  it('takes the vessel type’s own colour', () => {
    expect(htmlOf(pulseIcon('Passenger'))).toContain('stroke:var(--vessel-passenger)');
    expect(htmlOf(pulseIcon('Tanker'))).toContain('stroke:var(--vessel-tanker)');
  });

  it('is cached per type, like the vessel icons are', () => {
    expect(pulseIcon('Cargo')).toBe(pulseIcon('Cargo'));
    expect(pulseIcon('Cargo')).not.toBe(pulseIcon('Tug'));
  });

  it('never interpolates free text into its markup either', () => {
    for (const vessel of SEED_VESSELS) {
      const html = htmlOf(pulseIcon(vessel.type));
      expect(html).not.toContain(vessel.name);
      expect(html).not.toContain(vessel.destination);
      expect(html).not.toContain(vessel.mmsi);
    }
  });
});
