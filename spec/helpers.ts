import Vinyl = require("vinyl");
import { Readable, Transform } from "stream";

/**
 * A Vinyl File in buffer mode.
 */
export interface BufferFile extends Vinyl {
    contents: Buffer;
}

/**
 * A Vinyl File in streaming mode.
 */
export interface StreamFile extends Vinyl {
    contents: NodeJS.ReadableStream;
}

/**
 * A Vinyl File whose contents are null.
 */
export interface NullFile extends Vinyl {
    contents: null;
}

/**
 * Creates a Vinyl File object in buffer mode.
 *
 * @param  content   The contents of the file. Either a string, a Buffer, or an array
 *                   of bytes.
 * @param  encoding  The encoding of the contents if content is a string, otherwise null
 *                   or undefined.
 * @return           Returns a new File object in buffer mode.
 */
export function createBufferFile(content: string, encoding: string): BufferFile;
export function createBufferFile(content: number[], encoding?: null): BufferFile;
export function createBufferFile(content: Buffer, encoding?: null): BufferFile;
export function createBufferFile(content: string | number[] | Buffer, encoding?: string | null): BufferFile {
    return new Vinyl({
        cwd: "/root/src",
        path: "/root/src/name.txt",
        contents: toBuffer(content as any, encoding as any)
    });
}

/**
 * Creates a Vinyl File object in streaming mode.
 *
 * @param  content   The contents of the file. Either a string, a Buffer, or an array
 *                   of bytes.
 * @param  encoding  The encoding of the contents if content is a string, otherwise null
 *                   or undefined.
 * @return           Returns a new File object in streaming mode.
 */
export function createStreamFile(content: string, encoding: string): StreamFile;
export function createStreamFile(content: number[], encoding?: null): StreamFile;
export function createStreamFile(content: Buffer, encoding?: null): StreamFile;
export function createStreamFile(content: string | number[] | Buffer, encoding?: string | null): StreamFile {
    return new Vinyl({
        cwd: "/root/src",
        path: "/root/src/name.txt",
        contents: new Readable({
            read(): void {
                this.push(toBuffer(content as any, encoding as any));
                this.push(null);
            }
        })
    });
}

/**
 * Creates a Vinyl File object whose contents are null.
 */
export function createNullFile(): NullFile {
    return new Vinyl({
        cwd: "/root/src",
        path: "/root/src/name.txt",
        contents: null
    });
}

/**
 * Creates a new Buffer.
 *
 * @param  content   The contents of the Buffer. Either a string, another Buffer, or an array
 *                   or bytes.
 * @param  encoding  The encoding of the contents if content is a string, otherwise null or
 *                   undefined.
 * @return           Returns a new Buffer object.
 */
export function toBuffer(content: string, encoding: string): Buffer;
export function toBuffer(content: number[], encoding?: null): Buffer;
export function toBuffer(content: Buffer, encoding?: null): Buffer;
export function toBuffer(content: string | number[] | Buffer, encoding?: string | null): Buffer {
    if (typeof Buffer.from === "function")
        return Buffer.from(content as any, encoding as any);

    return new Buffer(content as any, encoding as any);
}

/**
 * Reads a file from an object-mode stream.
 *
 * @param  stream  The object-mode stream to read from.
 * @return         Returns a promise that resolves to a File object.
 */
export async function read(stream: NodeJS.ReadableStream): Promise<File> {
    if (!stream.readable)
        throw new Error("stream is not readable");

    return new Promise<File>((resolve, reject) => {
        stream.once("data", resolve);
        stream.on("error", reject);
    });
}

/**
 * Writes a file to an object-mode stream. The contents of the file may be
 * changed by the stream.
 *
 * @param  file    The file to write to the stream.
 * @param  stream  The object-mode stream to write to.
 * @return         Returns a promise that resolve to the stream itself.
 */
export async function write<T extends NodeJS.WritableStream>(file: Vinyl, stream: T): Promise<T> {
    stream.write(file as any);
    stream.end();

    return new Promise<T>((resolve, reject) => {
        stream.on("finish", () => resolve(stream));
        stream.on("error", reject);
    });
}

/**
 * Reads the contents of a file in either streaming or buffer mode. The
 * contents of the file are not changed.
 *
 * @param  file      The file whose contents to read.
 * @param  encoding  The encoding of the resulting string, or null to return a Buffer.
 *                   Defaults to null.
 * @return           Returns a promise with the contents of the file.
 */
export async function readFile(file: Vinyl, encoding: string): Promise<string>;
export async function readFile(file: Vinyl, encoding?: null): Promise<Buffer>;
export async function readFile(file: Vinyl, encoding?: string | null): Promise<string | Buffer> {
    if (file.isBuffer())
        return encoding ? file.contents.toString(encoding) : file.contents;
    if (!file.isStream())
        throw new TypeError("File must be in buffer or streaming mode");

    // Collect each chunk of data that passes through the stream.
    const chunks: Buffer[] = [];
    const stream = new Transform({
        transform(chunk: Buffer, _encoding, next): void {
            chunks.push(chunk);
            next(null, chunk);
        }
    });

    // Assign a new stream with identical data to the file so that it may be read again.
    file.contents = (file.contents as NodeJS.ReadableStream).pipe(stream);

    return new Promise<string | Buffer>((resolve, reject) => {
        stream.on("error", reject);
        stream.on("finish", () => {
            const content = Buffer.concat(chunks);
            resolve(encoding ? content.toString(encoding) : content);
        });
    });
}
