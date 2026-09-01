import { describe, expect, it } from 'vitest';
import { duressCodeFor } from '../../data/duressCodes';
import { SEED_VESSELS } from '../../data/seedVessels';
import {
  acknowledgeWatch,
  armWatch,
  cabinEvent,
  codeLength,
  codeProgress,
  disarmWatch,
  DURESS_WINDOW,
  expandCode,
  recordCabinEvent,
  WATCH_OFF,
} from '../duress';
import type { CabinAction, DuressCode, DuressWatch } from '../duress';

const CODE: DuressCode = [
  { action: 'toilet-flush', times: 5 },
  { action: 'toilet-light', times: 2 },
];

const START = 1_000_000;

const play = (
  watch: DuressWatch,
  actions: readonly CabinAction[],
  gap = 1_000,
  from = START,
): DuressWatch => {
  return actions.reduce(
    (current, action, index) =>
      recordCabinEvent(current, cabinEvent(action, from + index * gap), CODE),
    watch,
  );
};

const FLUSH: CabinAction = 'toilet-flush';
const LIGHT: CabinAction = 'toilet-light';
const TAP: CabinAction = 'wash-basin-tap';

const COMBINATION: readonly CabinAction[] = [FLUSH, FLUSH, FLUSH, FLUSH, FLUSH, LIGHT, LIGHT];

describe('the code itself', () => {
  it('expands to the run of actions the sensors would report', () => {
    expect(expandCode(CODE)).toEqual(COMBINATION);
    expect(codeLength(CODE)).toBe(7);
  });

  it('counts how much of the combination the tail spells out', () => {
    const at = (actions: readonly CabinAction[]) =>
      codeProgress(
        actions.map((action, index) => cabinEvent(action, START + index * 1_000)),
        CODE,
      );

    expect(at([])).toBe(0);
    expect(at([FLUSH, FLUSH, FLUSH])).toBe(3);
    expect(at(COMBINATION)).toBe(7);
    expect(at([TAP, LIGHT, FLUSH, FLUSH])).toBe(2);
  });

  it('drops the run when something out of sequence happens', () => {
    const at = (actions: readonly CabinAction[]) =>
      codeProgress(
        actions.map((action, index) => cabinEvent(action, START + index * 1_000)),
        CODE,
      );

    expect(at([FLUSH, FLUSH, FLUSH, FLUSH])).toBe(4);
    expect(at([FLUSH, FLUSH, FLUSH, FLUSH, TAP])).toBe(0);
    expect(at([FLUSH, FLUSH, LIGHT])).toBe(0);
  });
});

describe('raising the alarm', () => {
  it('raises on the last action of the combination, and not before', () => {
    const armed = armWatch(WATCH_OFF);

    expect(play(armed, COMBINATION.slice(0, 6)).kind).toBe('watching');

    const raised = play(armed, COMBINATION);
    expect(raised.kind).toBe('raised');
    if (raised.kind !== 'raised') throw new Error('expected a raised alarm');
    expect(raised.at).toBe(START + 6 * 1_000);
  });

  it('hears nothing while the watch is closed', () => {
    expect(play(WATCH_OFF, COMBINATION)).toEqual(WATCH_OFF);
  });

  it('will not raise on the combination spread beyond the window', () => {
    const slow = play(armWatch(WATCH_OFF), COMBINATION, DURESS_WINDOW / 5);
    expect(slow.kind).toBe('watching');
  });

  it('raises on a combination completed inside the window', () => {
    const brisk = play(armWatch(WATCH_OFF), COMBINATION, DURESS_WINDOW / 10);
    expect(brisk.kind).toBe('raised');
  });

  it('forgets events that have aged out, so the log cannot grow forever', () => {
    const stale = play(armWatch(WATCH_OFF), [TAP, TAP, TAP], DURESS_WINDOW + 1);
    if (stale.kind !== 'watching') throw new Error('expected an open watch');
    expect(stale.recent).toHaveLength(1);
  });
});

describe('an alarm cannot be taken back', () => {
  const raised = play(armWatch(WATCH_OFF), COMBINATION);

  it('survives the watch being switched off', () => {
    expect(disarmWatch(raised)).toEqual(raised);
  });

  it('survives further activity in the cabin', () => {
    expect(play(raised, [TAP, FLUSH, LIGHT])).toEqual(raised);
  });

  it('is not re-raised or re-stamped by arming again', () => {
    expect(armWatch(raised)).toEqual(raised);
  });

  it('clears only on an explicit acknowledgement, and keeps watching after', () => {
    const cleared = acknowledgeWatch(raised);
    expect(cleared.kind).toBe('watching');
    if (cleared.kind !== 'watching') throw new Error('expected an open watch');
    expect(cleared.recent).toEqual([]);
  });
});

describe('the owner’s register', () => {
  it('holds a combination for every vessel in the fleet', () => {
    for (const vessel of SEED_VESSELS) {
      expect(duressCodeFor(vessel.id)).not.toBeNull();
    }
  });

  it('gives every master a different one', () => {
    const codes = SEED_VESSELS.map((vessel) => JSON.stringify(duressCodeFor(vessel.id)));
    expect(new Set(codes).size).toBe(SEED_VESSELS.length);
  });

  it('makes every combination long enough not to be stumbled into', () => {
    for (const vessel of SEED_VESSELS) {
      const code = duressCodeFor(vessel.id);
      if (code === null) throw new Error(`${vessel.name} has no code`);
      expect(codeLength(code)).toBeGreaterThanOrEqual(6);
      expect(new Set(code.map((step) => step.action)).size).toBeGreaterThanOrEqual(2);
    }
  });
});
