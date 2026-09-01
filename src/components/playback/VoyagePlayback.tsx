import type { Vessel } from '../../domain/vessel';
import type { UseVoyagePlaybackResult } from '../../hooks/useVoyagePlayback';
import { SECTION_TITLE } from '../styles';
import Transport from './Transport';

export interface VoyagePlaybackProps {
  readonly vessel: Vessel | null;
  readonly playback: UseVoyagePlaybackResult;
}

const VoyagePlayback = ({ vessel, playback }: VoyagePlaybackProps) => {
  const { voyage, sample } = playback;

  return (
    <section
      className="flex flex-col gap-[0.4rem] border-t border-line px-4 pt-[0.6rem] pb-[0.7rem]"
      aria-label="Voyage playback"
    >
      <h2 className={`${SECTION_TITLE} text-ink-muted`}>Voyage playback</h2>
      {vessel === null || voyage === null || sample === null ? (
        <p className="text-[0.8rem] text-ink-muted">
          {vessel === null
            ? 'Select a vessel to replay the passage that brought it here.'
            : `No track on record for ${vessel.name}.`}
        </p>
      ) : (
        <Transport vessel={vessel} voyage={voyage} sample={sample} playback={playback} />
      )}
    </section>
  );
};

export default VoyagePlayback;
