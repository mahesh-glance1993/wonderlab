// Game id → UI module (generator + view). Kept separate from catalog.ts so other modules can
// read the catalog without pulling in the game UIs.
import type { GameId } from './catalog';
import type { GameModule } from './Shell';
import { countingModule } from './views/Counting';
import { shapesModule } from './views/Shapes';
import { patternsModule } from './views/Patterns';
import { numberLineModule } from './views/NumberLine';
import { fractionsModule } from './views/Fractions';
import { logicModule } from './views/Logic';
import { balanceModule } from './views/Balance';
import { circuitsModule } from './views/Circuits';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MODULES: Record<GameId, GameModule<any, any>> = {
  counting: countingModule,
  shapes: shapesModule,
  patterns: patternsModule,
  numberline: numberLineModule,
  fractions: fractionsModule,
  logic: logicModule,
  balance: balanceModule,
  circuits: circuitsModule,
};
