// WonderLab engine for the native Android app.
// Kotlin calls  WL.call("<module>.<function>", "<JSON array of args>")  and gets a JSON string back (or an exception).
// Each feature keeps its own module file; add a function there and it is callable from Kotlin.
import * as core from './core';
import * as lesson from './lesson';
import * as early from './early';
import * as games from './games';
import * as lab from './lab';
import * as art from './art';
import * as language from './language';

type Fn = (...a: unknown[]) => unknown;
const REG: Record<string, Record<string, unknown>> = { core, lesson, early, games, lab, art, language };

(globalThis as unknown as { WL: unknown }).WL = {
  call(name: string, argsJson: string): string {
    const dot = name.indexOf('.');
    const fn = REG[name.slice(0, dot)]?.[name.slice(dot + 1)];
    if (typeof fn !== 'function') throw new Error(`No engine function ${name}`);
    const out = (fn as Fn)(...(JSON.parse(argsJson || '[]') as unknown[]));
    return JSON.stringify(out === undefined ? null : out);
  },
  list(): string {
    return JSON.stringify(Object.fromEntries(Object.entries(REG).map(([k, v]) => [k, Object.keys(v).filter((f) => typeof v[f] === 'function')])));
  },
};
