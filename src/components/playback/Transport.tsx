import { parsePlaybackRate, PLAYBACK_RATES } from '../../domain/playback';
import type { Vessel } from '../../domain/vessel';
import type { Voyage, VoyageSample } from '../../domain/voyage';
import type { UseVoyagePlaybackResult } from '../../hooks/useVoyagePlayback';
import { BUTTON, FIELD_CONTROL } from '../styles';
import { colorForVesselType } from '../vesselStyle';
import { timelineValueText, transportLabel, transportReadings } from './utils';

const Transport = ({
  vessel,
  voyage,
  sample,
  playback,
}: {
  readonly vessel: Vessel;
  readonly voyage: Voyage;
  readonly sample: VoyageSample;
  readonly playback: UseVoyagePlaybackResult;
}) => {
  return (
    <>
      <p className="flex items-center gap-[0.4rem] text-[0.85rem] font-semibold">
        <span
          className="inline-block size-[0.6rem] rounded-[2px]"
          style={{ backgroundColor: colorForVesselType(vessel.type) }}
          aria-hidden="true"
        />
        {`${vessel.name} — ${voyage.from} to ${voyage.to}`}
      </p>

      <div className="flex items-center gap-[0.6rem]">
        <button
          type="button"
          className={`${BUTTON} min-w-[4.75rem] self-auto text-center`}
          onClick={playback.togglePlayback}
        >
          {transportLabel(playback)}
        </button>

        <input
          className="m-0 min-w-24 flex-1"
          style={{ accentColor: colorForVesselType(vessel.type) }}
          aria-label="Voyage timeline"
          aria-valuetext={timelineValueText(sample)}
          {...playback.getTimelineProps()}
        />

        <label>
          <span className="sr-only">Playback speed</span>
          <select
            className={`${FIELD_CONTROL} px-[0.45rem] py-[0.3rem] text-[0.8rem]`}
            value={playback.rate}
            onChange={(event) => playback.setRate(parsePlaybackRate(event.target.value))}
          >
            {PLAYBACK_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {`${rate} h/s`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <dl className="flex flex-wrap gap-x-[1.1rem] gap-y-[0.1rem] text-[0.78rem]">
        {transportReadings(voyage, sample).map((reading) => (
          <div className="flex items-baseline gap-[0.35rem]" key={reading.term}>
            <dt className="text-ink-muted">{reading.term}</dt>
            <dd className="tabular-nums">{reading.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
};

export default Transport;
