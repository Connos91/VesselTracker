import { assertNever } from '../../domain/assertNever';
import type { CompassCard } from './compassCard';
import { CENTER } from './constants';

const CentreGlyph = ({ card }: { readonly card: CompassCard }) => {
  switch (card.kind) {
    case 'heading-up':
      return <path className="fill-ink" d="M100 66 L110 86 L110 128 L90 128 L90 86 Z" />;
    case 'north-up':
      return (
        <>
          <circle className="fill-ink" cx={CENTER} cy={CENTER} r={9} />
          <circle
            className="fill-surface stroke-line [stroke-width:1]"
            cx={CENTER}
            cy={CENTER}
            r={3}
          />
        </>
      );
    default:
      return assertNever(card, 'compass card');
  }
};

export default CentreGlyph;
