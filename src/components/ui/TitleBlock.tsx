import type { TitleBlockRow } from "@/lib/shared-data";

type TitleBlockProps = {
  rows: readonly TitleBlockRow[];
  inverted?: boolean;
};

export function TitleBlock({ rows, inverted }: TitleBlockProps) {
  return (
    <div className={`title-block${inverted ? " inv" : ""}`}>
      {rows.map((row) => (
        <div key={row.key} className="tb-row">
          <span className="tb-k">{row.key}</span>
          <span className="tb-v">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
