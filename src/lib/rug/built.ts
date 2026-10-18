import type { Grid } from "./grid";

export type Built = {
  grid: Grid;
  palette: string[];
  variant: string;
  /** colour of the fringe at the short ends */
  fringe: string;
};
