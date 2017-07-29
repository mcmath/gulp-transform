import { File } from "gulp-util";

/**
 * Accepts the contents of a File object as a Buffer, applies a
 * transformation, and returns a Promise with the result.
 */
export interface TransformFunction {
    (contents: Buffer, file: File): Promise<Buffer>;
}

/**
 * A Vinyl File object in buffer mode.
 */
export interface BufferFile extends File {
    contents: Buffer;
}

/**
 * A Vinyl File object in streaming mode.
 */
export interface StreamFile extends File {
    contents: NodeJS.ReadableStream;
}

/**
 * A Node.js callback.
 */
export interface NodeCallback<T> {
    (error: null, value: T): void;
    (error?: Error | null): void;
}

/**
 * The name to display when a PluginError is thrown or emitted.
 */
export const PLUGIN_NAME = "gulp-transform";

/**
 * Tests whether a value is a function.
 */
export function isFunction(value: any): value is Function {
    return typeof value === "function";
}

/**
 * Tests whether a value is either null or undefined.
 */
export function isNil(value: any): value is null | undefined {
    return value == null;
}

/**
 * Tests whether a value is an object that is not a function.
 */
export function isObjectLike(value: any): value is object {
    return typeof value === "object" && !!value;
}

/**
 * Tests whether a value is a string primitive.
 */
export function isString(value: any): value is string {
    return typeof value === "string";
}
