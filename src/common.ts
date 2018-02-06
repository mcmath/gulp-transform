import Vinyl = require("vinyl");

/**
 * Accepts the contents of a File object as a Buffer, applies a
 * transformation, and returns a Promise with the result.
 *
 * @internal
 */
export interface TransformFunction {
    (contents: Buffer, file: Vinyl): Promise<Buffer>;
}

/**
 * A Vinyl File object in buffer mode.
 *
 * @internal
 */
export interface BufferFile extends Vinyl {
    contents: Buffer;
}

/**
 * A Vinyl File object in streaming mode.
 *
 * @internal
 */
export interface StreamFile extends Vinyl {
    contents: NodeJS.ReadableStream;
}

/**
 * A Node.js callback.
 *
 * @internal
 */
export interface NodeCallback<T> {
    (error: null, value: T): void;
    (error?: Error | null): void;
}

/**
 * The name to display when a PluginError is thrown or emitted.
 *
 * @internal
 */
export const PLUGIN_NAME = "gulp-transform";

/**
 * Tests whether a value is a function.
 *
 * @internal
 */
export function isFunction(value: any): value is Function {
    return typeof value === "function";
}

/**
 * Tests whether a value is either null or undefined.
 *
 * @internal
 */
export function isNil(value: any): value is null | undefined {
    return value == null;
}

/**
 * Tests whether a value is an object that is not a function.
 *
 * @internal
 */
export function isObjectLike(value: any): value is object {
    return typeof value === "object" && !!value;
}

/**
 * Tests whether a value is a string primitive.
 *
 * @internal
 */
export function isString(value: any): value is string {
    return typeof value === "string";
}
