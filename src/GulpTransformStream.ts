import { Transform } from "stream";
import { File, PluginError } from "gulp-util";
import { FileContentStream } from "./FileContentStream";
import { PLUGIN_NAME, TransformFunction, BufferFile, StreamFile, NodeCallback } from "./common";

/**
 * A stream of File objects returned by the plugin.
 *
 * @internal
 */
export class GulpTransformStream extends Transform {

    public constructor(
        private readonly transform: TransformFunction
    ) { super({ objectMode: true }); }

    public _transform(file: File, _encoding: string, next: NodeCallback<File>): void {
        if (file.isBuffer())
            return void this.transformBufferFile(file, next);

        if (file.isStream())
            return void this.transformStreamFile(file, next);

        next(null, file);
    }

    private async transformBufferFile(file: BufferFile, next: NodeCallback<BufferFile>): Promise<void> {
        try {
            file.contents = await this.transform(file.contents, file);
            next(null, file);
        } catch (error) {
            next(new PluginError(PLUGIN_NAME, error));
        }
    }

    private transformStreamFile(file: StreamFile, next: NodeCallback<StreamFile>): void {
        const stream = new FileContentStream(this.transform, file);

        stream.on("error", this.emit.bind(this, "error"));
        file.contents = file.contents.pipe(stream);

        next(null, file);
    }

}
