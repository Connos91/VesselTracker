import type { ReactNode } from 'react';

export interface DisclosureSectionProps {
  readonly title: string;
  readonly className: string;
  readonly label: string | null;
  readonly defaultOpen: boolean;
  readonly children: ReactNode;
}
