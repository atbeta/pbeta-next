/* tslint:disable */
/* eslint-disable */

export function dot_product(a: Float64Array, b: Float64Array): number;

export function gaussian_filter(width: number, height: number, src: Float64Array, kernel_size: number): Float64Array;

export function mandelbrot(width: number, height: number, max_iter: number): Uint8Array;

export function matmul(n: number, a: Float64Array, b: Float64Array): Float64Array;

export function prime_sieve(limit: number): Uint8Array;

export function start(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly dot_product: (a: number, b: number, c: number, d: number) => number;
    readonly gaussian_filter: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly mandelbrot: (a: number, b: number, c: number) => [number, number];
    readonly matmul: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly prime_sieve: (a: number) => [number, number];
    readonly start: () => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
