import PluginError = require("plugin-error");
import Vinyl = require("vinyl");
import { Config } from "./Config";
import { PLUGIN_NAME, TransformFunction, isString } from "./common";

/**
 * Creates a function for applying a user-defined transformation to
 * file contents.
 *
 * @internal
 */
export class ContentTransformer {

    public static fromConfig(config: Config): ContentTransformer {
        const { callback, encoding, thisArg } = config;

        return new this(callback, encoding, thisArg);
    }

    public constructor(
        private readonly callback: Function,
        private readonly encoding: string | null,
        private readonly thisArg: any
    ) { }

    public makeTransformFunction(): TransformFunction {
        return (contents, file) => this.transform(contents, file);
    }

    private async transform(contents: Buffer, file: Vinyl): Promise<Buffer> {
        const decodedContents = this.decodeContents(contents);
        const callbackResult = await this.invokeAndValidate(decodedContents, file);

        return new Buffer(callbackResult as any, this.encoding as any);
    }

    private decodeContents(contents: Buffer): Buffer | string {
        if (isString(this.encoding))
            return contents.toString(this.encoding);

        return contents;
    }

    private async invokeAndValidate(decodedContents: Buffer | string, file: Vinyl): Promise<Buffer | string> {
        const callbackResult = await this.tryInvokeCallback(decodedContents, file);

        if (this.encoding && !isString(callbackResult))
            throw new TypeError("callback result must be a string when encoding is given");

        if (!this.encoding && !Buffer.isBuffer(callbackResult))
            throw new TypeError("callback result must be a Buffer when encoding is not given");

        return callbackResult;
    }

    private async tryInvokeCallback(decodedContents: Buffer | string, file: Vinyl): Promise<Buffer | string> {
        try {
            return await this.callback.call(this.thisArg, decodedContents, file);
        } catch (error) {
            // Show stack for errors in callback as message alone may not be descriptive enough.
            throw new PluginError(PLUGIN_NAME, error, { showStack: true });
        }
    }

}
