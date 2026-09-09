import { SECTION_TITLE } from '../styles';
import type { DisclosureSectionProps } from './types';

const DisclosureSection = ({
  title,
  className,
  label,
  defaultOpen,
  children,
}: DisclosureSectionProps) => {
  return (
    <section className={className} aria-label={label ?? undefined}>
      <details className="group" open={defaultOpen}>
        <summary className="flex cursor-pointer list-none items-center gap-[0.4rem] text-ink-muted before:block before:size-[0.38rem] before:flex-none before:-rotate-45 before:border-r-2 before:border-b-2 before:border-current before:transition-transform before:duration-150 before:content-[''] marker:content-[''] hover:text-ink group-open:before:rotate-45">
          <h3 className={SECTION_TITLE}>{title}</h3>
        </summary>
        <div className="flex flex-col gap-[0.55rem] pt-[0.55rem]">{children}</div>
      </details>
    </section>
  );
};

export default DisclosureSection;
