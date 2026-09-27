import { CLOCK_SEGMENTS } from "@/lib/page-data";

/** A clock as in the prototype: filled segments in ochre, all red once full. */
export function Clock({ pos }: { pos: number }) {
  return (
    <span className={`clock${pos >= CLOCK_SEGMENTS ? " full" : ""}`} role="img" aria-label={`${pos} of ${CLOCK_SEGMENTS}`}>
      {Array.from({ length: CLOCK_SEGMENTS }, (_, i) => <i key={i} className={i < pos ? "f" : undefined} />)}
    </span>
  );
}
