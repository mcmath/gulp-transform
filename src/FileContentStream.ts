import { Transform } from "stream";
import PluginError = require("plugin-error");
import { PLUGIN_NAME, NodeCallback, StreamFile, TransformFunction } from "./common";

/**
 * The transformed contents of a File object in streaming mode.
 *
 * @internal
 */
export class FileContentStream extends Transform {

    private chunks: Buffer[] = [];

    public constructor(
        private readonly transform: TransformFunction,
        private readonly file: StreamFile
    ) { super(); }

    public _transform(chunk: Buffer, _encoding: string, next: NodeCallback<Buffer>): void {
        this.chunks.push(chunk);
        next(null);
    }

    public _flush(done: NodeCallback<Buffer>): void {
        const contents = Buffer.concat(this.chunks);
        this.transformContents(contents, done);
    }

    private async transformContents(contents: Buffer, done: NodeCallback<void>): Promise<void> {
        try {
            const newContents = await this.transform(contents, this.file);
            this.push(newContents);
            done(null);
        } catch (error) {
            done(new PluginError(PLUGIN_NAME, error));
        }
    }

}
