import PluginError = require("plugin-error");
import { PLUGIN_NAME, isFunction, isNil, isObjectLike, isString } from "./common";

type OptionsOrEncoding = Options | string | null | undefined;

interface Options {
    encoding?: string | null;
    thisArg?: any;
}

/**
 * A normalized configuration object based on arguments passed to
 * the plugin.
 *
 * @internal
 */
export class Config {

    public static fromPluginArguments(arg0: any, arg1: any): Config {
        const [ callback, optionsOrEncoding ] = this.resolveArgs(arg0, arg1);

        const options = this.resolveOptions(optionsOrEncoding);
        const encoding = this.getEncoding(options);
        const thisArg = this.getThisArg(options);

        return new this(callback, encoding, thisArg);
    }

    private static resolveArgs(arg0: any, arg1: any): [Function, OptionsOrEncoding] {
        if (isFunction(arg0))
            return [arg0, arg1];

        if (isFunction(arg1))
            return [arg1, arg0];

        throw new PluginError(PLUGIN_NAME, "callback is required");
    }

    private static resolveOptions(optionsOrEncoding: OptionsOrEncoding): Options {
        if (isObjectLike(optionsOrEncoding))
            return optionsOrEncoding as Options;

        if (isString(optionsOrEncoding))
            return { encoding: optionsOrEncoding };

        if (isNil(optionsOrEncoding))
            return { encoding: null };

        throw new PluginError(PLUGIN_NAME, "options must be an object, a string, null, or undefined");
    }

    private static getEncoding(options: Options): string | null {
        const { encoding } = options;

        if (isNil(encoding) || encoding === "")
            return null;

        if (!isString(encoding))
            throw new PluginError(PLUGIN_NAME, "encoding must be a string, null, or undefined");

        if (!Buffer.isEncoding(encoding))
            throw new PluginError(PLUGIN_NAME, `encoding is not supported: ${encoding}`);

        return encoding;
    }

    private static getThisArg(options: Options): any {
        return options.thisArg;
    }

    public constructor(
        public readonly callback: Function,
        public readonly encoding: string | null,
        public readonly thisArg: any
    ) { }

}
