import './App.css';
import { FeedStatus } from './components/feed';
import { MapLegend } from './components/legend';
import { VoyagePlayback } from './components/playback';
import { ThemeToggle } from './components/theme';
import { VesselDetails } from './components/details';
import { VesselFilters } from './components/filters';
import { VesselList } from './components/list';
import { VesselMap } from './components/map';
import type { MapPlayback } from './components/map';
import { useDuressWatch } from './hooks/useDuressWatch';
import { useFleet } from './hooks/useFleet';
import { useTheme } from './hooks/useTheme';
import { useVesselFilters } from './hooks/useVesselFilters';
import { useVesselSelection } from './hooks/useVesselSelection';
import { useVoyagePlayback } from './hooks/useVoyagePlayback';

const App = () => {
  const fleet = useFleet();
  const filters = useVesselFilters(fleet.vessels);
  const selection = useVesselSelection(fleet.vessels);
  const playback = useVoyagePlayback(selection.selectedVessel?.voyage ?? null);
  const theme = useTheme();
  const duressWatch = useDuressWatch(fleet.vessels);
  const matchedIds = new Set(filters.matches.map((vessel) => vessel.id));

  const mapPlayback: MapPlayback | null =
    selection.selectedVessel === null || playback.voyage === null || playback.sample === null
      ? null
      : { vessel: selection.selectedVessel, voyage: playback.voyage, sample: playback.sample };

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line bg-panel px-5 py-3">
        <div>
          <h1 className="text-[1.15rem] font-bold tracking-[0.01em]">Vessel tracker</h1>
          <p className="text-[0.82rem] text-ink-muted">
            Simulated AIS traffic — Cyprus and the eastern Mediterranean
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <FeedStatus fleet={fleet} />
          <ThemeToggle theme={theme} />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[21rem_minmax(0,1fr)_25rem] gap-px bg-line max-[68rem]:grid-cols-[minmax(0,1fr)]">
        <aside
          className="overflow-y-auto bg-panel p-4 max-[68rem]:overflow-y-visible"
          aria-label="Vessel search and results"
        >
          <VesselFilters filters={filters} totalCount={fleet.vessels.length} />
          <VesselList
            vessels={filters.matches}
            selection={selection}
            isRaised={duressWatch.isRaisedFor}
            isStale={filters.isStale}
            onClearFilters={filters.clearFilters}
            showClearFilters={filters.isFiltered}
          />
        </aside>

        <section
          className="flex min-h-0 flex-col bg-panel max-[68rem]:h-[72vh] max-[68rem]:min-h-[28rem]"
          aria-label="Vessel map"
        >
          <VesselMap
            vessels={fleet.vessels}
            selectedVessel={selection.selectedVessel}
            matchedIds={matchedIds}
            onSelectVessel={selection.select}
            playback={mapPlayback}
          />
          <VoyagePlayback vessel={selection.selectedVessel} playback={playback} />
          <MapLegend />
        </section>

        <aside
          className="overflow-y-auto bg-panel p-4 max-[68rem]:overflow-y-visible"
          aria-label="Selected vessel"
        >
          <VesselDetails
            vessel={selection.selectedVessel}
            duress={
              selection.selectedVessel === null
                ? null
                : duressWatch.forVessel(selection.selectedVessel)
            }
            onClearSelection={selection.clearSelection}
          />
        </aside>
      </div>
    </div>
  );
};

export default App;
