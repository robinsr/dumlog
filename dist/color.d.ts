import type { LayoutType } from './types.ts';
export declare const ANSI: Record<string, string>;
export type ColorName = keyof typeof ANSI;
export type ColorFn = (msg: string) => string;
export type ColorFnMap = Record<ColorName, ColorFn>;
export type Combiner = (...fns: ColorFn[]) => (msg: any) => string;
declare const colorFns: (l: LayoutType) => ColorFnMap;
export declare const combine: Combiner;
export default colorFns;
