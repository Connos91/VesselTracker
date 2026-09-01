import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { makeQueryClient } from './app/queryClient';
import { makeStore } from './store/store';
import type { VesselMapProps } from './components/map';
import { THEME_STORAGE_KEY } from './hooks/constants';

vi.mock('./components/map', () => ({
  VesselMap: ({
    vessels,
    selectedVessel,
    matchedIds,
    onSelectVessel,
    playback,
  }: VesselMapProps) => (
    <div>
      <p>{`map: ${vessels.length} vessels, ${matchedIds.size} matching`}</p>
      <p>{`map selection: ${selectedVessel?.name ?? 'none'}`}</p>
      <p>
        {playback === null
          ? 'map track: none'
          : `map track: ${playback.vessel.name}, ${playback.voyage.fixes.length} fixes, marker at ${playback.sample.position.latitude.toFixed(4)}, ${playback.sample.position.longitude.toFixed(4)}`}
      </p>
      {vessels.map((vessel) => (
        <button key={vessel.id} type="button" onClick={() => onSelectVessel(vessel)}>
          {`marker ${vessel.name}`}
        </button>
      ))}
    </div>
  ),
}));

type User = ReturnType<typeof userEvent.setup>;

const renderApp = () => {
  return render(
    <Provider store={makeStore()}>
      <QueryClientProvider client={makeQueryClient()}>
        <App />
      </QueryClientProvider>
    </Provider>,
  );
};

const goTo = (url: string): void => {
  window.history.replaceState(null, '', url);
};

const resultList = (): HTMLElement | null => {
  return screen.queryByRole('list', { name: 'Matching vessels' });
};

const listedCount = (): number => {
  const list = resultList();
  return list === null ? 0 : within(list).getAllByRole('button').length;
};

const expectListed = (names: readonly string[]): void => {
  expect(listedCount()).toBe(names.length);
  const list = resultList();
  if (list === null) return;
  for (const name of names) {
    expect(within(list).getByRole('button', { name: new RegExp(name) })).toBeInTheDocument();
  }
};

const clickVesselInList = async (user: User, name: string): Promise<void> => {
  const list = screen.getByRole('list', { name: 'Matching vessels' });
  await user.click(within(list).getByRole('button', { name: new RegExp(name) }));
};

const searchBox = (): HTMLElement => {
  return screen.getByRole('searchbox', { name: 'Search vessels' });
};

const typeSelect = (): HTMLElement => {
  return screen.getByRole('combobox', { name: 'Vessel type' });
};

const detailPanel = (): HTMLElement => {
  return screen.getByRole('complementary', { name: 'Selected vessel' });
};

const sidebar = (): HTMLElement => {
  return screen.getByRole('complementary', { name: 'Vessel search and results' });
};

const aisRecord = (): HTMLElement => {
  return within(detailPanel()).getByRole('region', { name: 'AIS record' });
};

const instrumentPanel = (): HTMLElement => {
  return within(detailPanel()).getByRole('region', { name: 'Instrument panel' });
};

const playbackBar = (): HTMLElement => {
  return screen.getByRole('region', { name: 'Voyage playback' });
};

const timeline = (): HTMLElement => {
  return within(playbackBar()).getByRole('slider', { name: 'Voyage timeline' });
};

const reading = (term: string): string => {
  const label = within(playbackBar()).getByText(term);
  const value = label.nextElementSibling;
  if (value === null) throw new Error(`No value beside ${term}`);
  return value.textContent ?? '';
};

const scrubTo = (elapsed: number): void => {
  fireEvent.change(timeline(), { target: { value: String(elapsed) } });
};

const themeButton = (name: string): HTMLElement => {
  return within(screen.getByRole('group', { name: 'Theme' })).getByRole('button', { name });
};

const documentTheme = (): string | null => {
  return document.documentElement.getAttribute('data-theme');
};

const duressPanel = (): HTMLElement => {
  return within(detailPanel()).getByRole('region', { name: 'Captain’s duress alarm' });
};

const cabinButton = (name: string): HTMLElement => {
  return within(duressPanel()).getByRole('button', { name });
};

const signal = async (user: User, actions: readonly string[]): Promise<void> => {
  for (const action of actions) {
    await user.click(cabinButton(action));
  }
};

const COMBINATION = [
  'Flush the heads',
  'Flush the heads',
  'Flush the heads',
  'Flush the heads',
  'Flush the heads',
  'Heads light',
  'Heads light',
];

const disclosure = (title: string): HTMLDetailsElement => {
  const heading = within(detailPanel()).getByRole('heading', { name: title });
  const details = heading.closest('details');
  if (details === null) throw new Error(`${title} is not a collapsible section`);
  return details;
};

const summaryFor = (title: string): HTMLElement => {
  const summary = disclosure(title).querySelector('summary');
  if (summary === null) throw new Error(`${title} has no summary to click`);
  return summary;
};

beforeEach(() => {
  goTo('/');
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('initial render', () => {
  it('lists every vessel and reports the total', () => {
    renderApp();
    expect(listedCount()).toBe(9);
    expect(within(sidebar()).getByRole('status')).toHaveTextContent('Showing 9 of 9 vessels');
    expect(detailPanel()).toHaveTextContent('No vessel selected');
  });
});

describe('search', () => {
  it('filters the rendered list by name', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(searchBox(), 'aegean');

    await waitFor(() => expectListed(['Aegean Star']));
  });

  it('searches MMSI, IMO and destination as well as the name', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(searchBox(), '215678901');
    await waitFor(() => expectListed(['Blue Horizon']));

    await user.clear(searchBox());
    await user.type(searchBox(), 'IMO9345678');
    await waitFor(() => expectListed(['Cyprus Trader']));

    await user.clear(searchBox());
    await user.type(searchBox(), 'alexandria');
    await waitFor(() => expectListed(['Mediterranean Queen']));
  });

  it('writes the query to the address bar', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(searchBox(), 'pearl');

    await waitFor(() => expect(window.location.search).toContain('q=pearl'));
  });
});

describe('type filter', () => {
  it('narrows the list to one vessel type', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.selectOptions(typeSelect(), 'Tanker');

    await waitFor(() => expectListed(['Mediterranean Queen', 'Ocean Pearl']));
    expect(window.location.search).toContain('type=Tanker');
  });

  it('combines with the search query', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.selectOptions(typeSelect(), 'Cargo');
    await waitFor(() => expectListed(['Aegean Star', 'Cyprus Trader', 'Nostos']));

    await user.type(searchBox(), 'limassol');

    await waitFor(() => expectListed(['Aegean Star']));
  });
});

describe('selection', () => {
  it('exposes the full record and updates the URL when a list item is chosen', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');

    const details = detailPanel();
    expect(within(details).getByRole('heading', { name: /Aegean Star/ })).toBeInTheDocument();
    expect(within(details).getByText('209123456')).toBeInTheDocument();
    expect(within(details).getByText('IMO9876543')).toBeInTheDocument();
    expect(within(details).getByText('Limassol')).toBeInTheDocument();
    expect(
      within(details).getByText('34° 40\' 16.3" N, 033° 02\' 28.7" E'),
    ).toBeInTheDocument();
    expect(within(details).getByText('Under way using engine')).toBeInTheDocument();
    expect(within(aisRecord()).getByText('085°')).toBeInTheDocument();
    expect(window.location.search).toContain('selected=vessel-001');
  });

  it('marks the chosen list item as pressed and shares the selection with the map', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Blue Horizon');

    const list = screen.getByRole('list', { name: 'Matching vessels' });
    const pressed = within(list).getAllByRole('button', { pressed: true });
    expect(pressed).toHaveLength(1);
    expect(pressed[0]).toHaveTextContent('Blue Horizon');
    expect(screen.getByText('map selection: Blue Horizon')).toBeInTheDocument();
  });

  it('selects from the map and reflects it in the list and the URL', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'marker Ocean Pearl' }));

    expect(detailPanel()).toHaveTextContent('Ocean Pearl');
    const list = screen.getByRole('list', { name: 'Matching vessels' });
    expect(within(list).getAllByRole('button', { pressed: true })).toHaveLength(1);
    expect(window.location.search).toContain('selected=vessel-005');
  });

  it('reports that heading is not applicable for a vessel that is not under way', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Port Sentinel');

    const details = detailPanel();
    expect(within(details).getByText('Moored')).toBeInTheDocument();
    expect(
      within(aisRecord()).getAllByText('Not applicable — vessel is not under way'),
    ).toHaveLength(2);
  });

  it('clears the selection again', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Nostos');
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(detailPanel()).toHaveTextContent('No vessel selected');
    expect(window.location.search).not.toContain('selected=');
  });
});

describe('deep links', () => {
  it('honours selected and q params on first mount', () => {
    goTo('/?selected=vessel-003&q=blue');
    renderApp();

    expect(searchBox()).toHaveValue('blue');
    expectListed(['Blue Horizon']);
    const details = detailPanel();
    expect(within(details).getByRole('heading', { name: /Blue Horizon/ })).toBeInTheDocument();
    expect(within(details).getByText('215678901')).toBeInTheDocument();
  });

  it('honours the type param on first mount', () => {
    goTo('/?type=Fishing');
    renderApp();

    expect(typeSelect()).toHaveValue('Fishing');
    expectListed(['Levanto']);
  });

  it('falls back to no type filter for a garbage type param', () => {
    goTo('/?type=Submarine&selected=not-a-vessel');
    renderApp();

    expect(typeSelect()).toHaveValue('All');
    expect(listedCount()).toBe(9);
    expect(detailPanel()).toHaveTextContent('No vessel selected');
  });

  it('reacts to browser history navigation', async () => {
    renderApp();
    goTo('/?selected=vessel-004');
    window.dispatchEvent(new PopStateEvent('popstate'));

    await waitFor(() => expect(detailPanel()).toHaveTextContent('Cyprus Trader'));
  });
});

describe('empty state', () => {
  it('explains that nothing matched and offers a way out', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(searchBox(), 'zzzz');

    expect(
      await screen.findByText(/No vessels match the current search and filter/),
    ).toBeInTheDocument();
    expect(listedCount()).toBe(0);

    await user.click(
      screen.getByRole('button', { name: 'Clear filters and show all vessels' }),
    );

    await waitFor(() => expect(listedCount()).toBe(9));
    expect(window.location.search).toBe('');
  });
});

describe('instrument panel', () => {
  it('reads out the instruments of a vessel under way', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');
    const panel = instrumentPanel();

    expect(
      within(panel).getByRole('img', {
        name: /Compass card turned to a heading of 085 degrees\. Course over ground 087 degrees/,
      }),
    ).toBeInTheDocument();

    expect(within(panel).getByText('Speed over ground')).toBeInTheDocument();
    expect(within(panel).getByText('92%')).toBeInTheDocument();
    expect(within(panel).getByText('of the 13.5 kn service speed')).toBeInTheDocument();
    expect(within(panel).getByText('2.2 kn from 253°')).toBeInTheDocument();
    expect(within(panel).getByText('168° — astern')).toBeInTheDocument();
    expect(within(panel).getByText('14.5 kn from 265°')).toBeInTheDocument();
    expect(within(panel).getByText('Force 4 — Moderate breeze')).toBeInTheDocument();
    expect(within(panel).getByText('1 × 7,800 kW at 105 rpm')).toBeInTheDocument();
    expect(within(panel).getByText('66%')).toBeInTheDocument();
    expect(within(panel).getByText('91 rpm')).toBeInTheDocument();
    expect(within(panel).getByText('182 g/kWh')).toBeInTheDocument();
    expect(within(panel).getByText('Propulsion')).toBeInTheDocument();
    expect(within(panel).getByText('Hotel and accommodation')).toBeInTheDocument();
    expect(within(panel).getByText('Deck and cargo machinery')).toBeInTheDocument();
    expect(within(panel).getByText('Navigation and control')).toBeInTheDocument();
    expect(within(panel).getByText('5,421 kW · 130.1 MWh/day')).toBeInTheDocument();
  });

  it('shows a north-up card and stopped engines for a vessel that is not under way', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Port Sentinel');
    const panel = instrumentPanel();

    expect(
      within(panel).getByRole('img', { name: /north up: the vessel is not under way/ }),
    ).toBeInTheDocument();
    expect(within(panel).getByText('Not under way')).toBeInTheDocument();
    expect(within(panel).getByText('Engine stopped')).toBeInTheDocument();

    expect(within(panel).queryByText('Apparent wind')).not.toBeInTheDocument();
    expect(within(panel).getByText('7.5 kn from 270°')).toBeInTheDocument();
    expect(within(panel).getByText('Force 3 — Gentle breeze')).toBeInTheDocument();

    const consumers = within(panel).getByRole('list', { name: 'Energy consumers' });
    expect(within(consumers).getByText('Cargo handling alongside')).toBeInTheDocument();
    expect(within(consumers).getByText('120 kW')).toBeInTheDocument();
    expect(within(consumers).getByText('64%')).toBeInTheDocument();
    expect(within(consumers).getByText('0 kW')).toBeInTheDocument();
    expect(within(consumers).getByText('0%')).toBeInTheDocument();
  });

  it('stops the main engine of a vessel under sail without stopping its generators', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Anemos');
    const panel = instrumentPanel();

    expect(
      within(panel).getByText('Main engine stopped: the vessel is making way under sail.'),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText('Main engine stopped — making way under sail'),
    ).toBeInTheDocument();
    expect(within(panel).getByText('Apparent wind')).toBeInTheDocument();
    expect(within(panel).getByText('Air conditioning, galley, lighting')).toBeInTheDocument();
  });

  it('has no instruments to show until a vessel is selected', () => {
    renderApp();

    expect(
      within(detailPanel()).queryByRole('region', { name: 'Instrument panel' }),
    ).not.toBeInTheDocument();
  });

  it('announces the selection in one line rather than reading the whole panel', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');

    expect(within(detailPanel()).getByRole('status')).toHaveTextContent(
      'Aegean Star selected. Cargo, Under way using engine, making 12.4 kn.',
    );
  });
});

describe('voyage playback', () => {
  const BLUE_HORIZON_DURATION = '28 h 15 min';

  it('invites a selection when no vessel is chosen', () => {
    renderApp();

    expect(playbackBar()).toHaveTextContent(
      'Select a vessel to replay the passage that brought it here.',
    );
    expect(screen.getByText('map track: none')).toBeInTheDocument();
  });

  it('says so for a vessel with no track on record', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');

    expect(playbackBar()).toHaveTextContent('No track on record for Aegean Star.');
    expect(screen.getByText('map track: none')).toBeInTheDocument();
  });

  it('opens a track parked on the vessel’s own position', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Blue Horizon');

    expect(playbackBar()).toHaveTextContent('Blue Horizon — Piraeus to Haifa');
    expect(reading('Elapsed')).toBe(`${BLUE_HORIZON_DURATION} of ${BLUE_HORIZON_DURATION}`);
    expect(reading('At')).toBe('30 Aug 09:40 UTC');
    expect(reading('Run')).toBe('554 nm of 554 nm');
    expect(
      screen.getByText('map track: Blue Horizon, 22 fixes, marker at 34.5903, 32.8735'),
    ).toBeInTheDocument();

    expect(within(playbackBar()).getByRole('button', { name: 'Replay' })).toBeInTheDocument();
  });

  it('scrubs back to the point of departure', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Blue Horizon');
    scrubTo(0);

    expect(reading('Elapsed')).toBe(`0 min of ${BLUE_HORIZON_DURATION}`);
    expect(reading('At')).toBe('29 Aug 05:25 UTC');
    expect(reading('Run')).toBe('0 nm of 554 nm');
    expect(reading('Course made good')).toBe('160°');
    expect(
      screen.getByText('map track: Blue Horizon, 22 fixes, marker at 37.9100, 23.6400'),
    ).toBeInTheDocument();
    expect(within(playbackBar()).getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('holds the vessel part-way along the passage', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Blue Horizon');
    scrubTo(3_600_000);

    expect(reading('Elapsed')).toBe(`1 h 00 min of ${BLUE_HORIZON_DURATION}`);
    expect(reading('At')).toBe('29 Aug 06:25 UTC');
    expect(screen.queryByText(/marker at 37.9100, 23.6400/)).not.toBeInTheDocument();
    expect(screen.queryByText(/marker at 34.5903, 32.8735/)).not.toBeInTheDocument();
  });

  it('runs the clock and stops it again', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Blue Horizon');
    await user.click(within(playbackBar()).getByRole('button', { name: 'Replay' }));

    const pause = within(playbackBar()).getByRole('button', { name: 'Pause' });
    await user.click(pause);

    expect(within(playbackBar()).getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('offers the playback speeds and keeps the one chosen', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Blue Horizon');
    const speed = within(playbackBar()).getByRole('combobox', { name: 'Playback speed' });
    expect(speed).toHaveValue('3');

    await user.selectOptions(speed, '2');
    expect(speed).toHaveValue('2');

    expect(reading('Elapsed')).toBe(`${BLUE_HORIZON_DURATION} of ${BLUE_HORIZON_DURATION}`);
  });

  it('rewinds to the end of the new track when another vessel is chosen', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Blue Horizon');
    scrubTo(0);
    await clickVesselInList(user, 'Ocean Pearl');

    expect(reading('Elapsed')).toBe('18 h 50 min of 18 h 50 min');
    expect(reading('At')).toBe('30 Aug 09:40 UTC');
    expect(
      screen.getByText('map track: Ocean Pearl, 8 fixes, marker at 34.4321, 33.4056'),
    ).toBeInTheDocument();
  });
});

describe('theme', () => {
  it('follows the system until it is told otherwise', () => {
    renderApp();

    expect(themeButton('System')).toHaveAttribute('aria-pressed', 'true');
    expect(documentTheme()).toBeNull();
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('puts the document into dark mode and remembers it', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(themeButton('Dark'));

    expect(documentTheme()).toBe('dark');
    expect(themeButton('Dark')).toHaveAttribute('aria-pressed', 'true');
    expect(themeButton('System')).toHaveAttribute('aria-pressed', 'false');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('states light explicitly, so a dark system setting is overridden', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(themeButton('Light'));

    expect(documentTheme()).toBe('light');
  });

  it('hands the choice back to the system, and stops remembering one', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(themeButton('Dark'));
    await user.click(themeButton('System'));

    expect(documentTheme()).toBeNull();
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('honours a remembered choice on first mount', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    renderApp();

    expect(themeButton('Dark')).toHaveAttribute('aria-pressed', 'true');
    expect(documentTheme()).toBe('dark');
  });

  it('ignores a stored value that is not a theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    renderApp();

    expect(themeButton('System')).toHaveAttribute('aria-pressed', 'true');
    expect(documentTheme()).toBeNull();
  });
});

describe('the master’s duress alarm', () => {
  it('watches nothing until the owner opens the watch', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');

    expect(duressPanel()).toHaveTextContent('Not watching');
    expect(duressPanel()).toHaveTextContent('Nothing the master does will reach you');
    expect(duressPanel()).not.toHaveTextContent('flush the heads ×5');
  });

  it('shows the registered combination and counts the signal as it comes in', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');
    await user.click(cabinButton('Watch this cabin'));

    expect(duressPanel()).toHaveTextContent('flush the heads ×5, then heads light ×2');
    expect(duressPanel()).toHaveTextContent('0 of 7');
    expect(duressPanel()).toHaveTextContent('Normal');

    await signal(user, COMBINATION.slice(0, 3));
    expect(duressPanel()).toHaveTextContent('3 of 7');
  });

  it('drops the count when something out of sequence happens', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');
    await user.click(cabinButton('Watch this cabin'));

    await signal(user, COMBINATION.slice(0, 4));
    expect(duressPanel()).toHaveTextContent('4 of 7');

    await signal(user, ['Wash-basin tap']);
    expect(duressPanel()).toHaveTextContent('0 of 7');
  });

  it('raises the alarm on the last action of the combination', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');
    await user.click(cabinButton('Watch this cabin'));

    await signal(user, COMBINATION.slice(0, 6));
    expect(duressPanel()).toHaveTextContent('Normal');

    await signal(user, COMBINATION.slice(6));

    expect(duressPanel()).toHaveTextContent('Duress');
    expect(duressPanel()).toHaveTextContent(
      'The master of Aegean Star has signalled duress from the cabin.',
    );
    expect(within(duressPanel()).getByRole('alert')).toHaveTextContent(
      'Duress alarm raised on Aegean Star',
    );
  });

  it('keeps the alarm standing while the owner looks at another ship', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');
    await user.click(cabinButton('Watch this cabin'));
    await signal(user, COMBINATION);

    await clickVesselInList(user, 'Blue Horizon');
    expect(duressPanel()).not.toHaveTextContent('has signalled duress');

    const list = screen.getByRole('list', { name: 'Matching vessels' });
    expect(within(list).getByRole('button', { name: /Aegean Star/ })).toHaveTextContent(
      'Duress',
    );

    await clickVesselInList(user, 'Aegean Star');
    expect(duressPanel()).toHaveTextContent('has signalled duress');
  });

  it('cannot be silenced by closing the watch', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');
    await user.click(cabinButton('Watch this cabin'));
    await signal(user, COMBINATION);

    expect(
      within(duressPanel()).queryByRole('button', { name: /Watch/ }),
    ).not.toBeInTheDocument();
    expect(duressPanel()).toHaveTextContent('Duress');
  });

  it('clears on acknowledgement and goes straight back to watching', async () => {
    const user = userEvent.setup();
    renderApp();

    await clickVesselInList(user, 'Aegean Star');
    await user.click(cabinButton('Watch this cabin'));
    await signal(user, COMBINATION);
    await user.click(cabinButton('Acknowledge alert'));

    expect(duressPanel()).toHaveTextContent('Normal');
    expect(duressPanel()).toHaveTextContent('0 of 7');
    expect(screen.queryByText('Duress')).not.toBeInTheDocument();
  });
});

describe('the AIS feed', () => {
  it('has the fleet on screen at once, with no loading state to sit through', () => {
    renderApp();

    expect(listedCount()).toBe(9);
    expect(screen.getByText(/AIS feed read/)).toBeInTheDocument();
  });

  it('polls again when the owner asks it to', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(screen.getByText('Polling the AIS feed…')).toBeInTheDocument();
    expect(listedCount()).toBe(9);

    await waitFor(() => expect(screen.getByText(/AIS feed read/)).toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(listedCount()).toBe(9);
  });
});

describe('collapsible sections', () => {
  const FOLDABLE = ['Navigation', 'Wind', 'Main engines', 'Energy consumers', 'AIS record'];

  it('opens navigation and folds the rest away, so the panel opens short', async () => {
    const user = userEvent.setup();
    renderApp();
    await clickVesselInList(user, 'Aegean Star');

    // Navigation is the headline reading — where the vessel is and how fast —
    // so it is the one section worth the room by default.
    expect(disclosure('Navigation').open).toBe(true);
    for (const title of FOLDABLE.filter((name) => name !== 'Navigation')) {
      expect(disclosure(title).open).toBe(false);
    }
  });

  it('opens a folded section and closes it again', async () => {
    const user = userEvent.setup();
    renderApp();
    await clickVesselInList(user, 'Aegean Star');

    // Starts folded now, so the first click opens it.
    await user.click(summaryFor('Main engines'));
    expect(disclosure('Main engines').open).toBe(true);
    // The others are untouched: each section folds on its own.
    expect(disclosure('Wind').open).toBe(false);

    await user.click(summaryFor('Main engines'));
    expect(disclosure('Main engines').open).toBe(false);
  });

  it('keeps a heading for every section, so the panel outline survives', async () => {
    const user = userEvent.setup();
    renderApp();
    await clickVesselInList(user, 'Aegean Star');

    for (const title of FOLDABLE) {
      expect(summaryFor(title)).toContainElement(
        within(detailPanel()).getByRole('heading', { name: title }),
      );
    }
  });

  it('folds the compass and the speed readout away together', async () => {
    const user = userEvent.setup();
    renderApp();
    await clickVesselInList(user, 'Aegean Star');

    // The compass and the speed readout share the navigation section, so one
    // fold takes the pair. Scoped to the section: `Speed over ground` is also a
    // row in the AIS record further down.
    const navigation = disclosure('Navigation');
    expect(within(navigation).getByText('Speed over ground')).toBeInTheDocument();
    expect(within(navigation).getByRole('img', { name: /Compass card/ })).toBeInTheDocument();

    await user.click(summaryFor('Navigation'));

    expect(navigation.open).toBe(false);
    // Folded away rather than thrown away: `details` keeps its content in the
    // document, which is what lets in-page search still reach it.
    expect(within(navigation).getByText('Speed over ground')).toBeInTheDocument();
  });

  it('leaves the alarm fixed, since an alarm is not worth hiding', async () => {
    const user = userEvent.setup();
    renderApp();
    await clickVesselInList(user, 'Aegean Star');

    expect(
      within(detailPanel())
        .getByRole('heading', { name: 'Captain’s duress alarm' })
        .closest('details'),
    ).toBeNull();
  });
});
