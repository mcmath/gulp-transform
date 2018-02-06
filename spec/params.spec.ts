import { expect } from "chai";
import PluginError = require("plugin-error");
import Vinyl = require("vinyl");
import { identity } from "lodash";
import { createBufferFile, write } from "./helpers";
import transform = require("../src");

describe("parameters", () => {

    describe("callback", () => {
        let file: Vinyl;

        beforeEach(() => {
            file = createBufferFile([0xCF, 0x80]);
        });

        it("may be either arguments[0] or arguments[1]", () => {
            expect(() => transform(identity)).not.to.throw();
            expect(() => transform(identity, {} as any)).not.to.throw();
            expect(() => transform("utf8", identity)).not.to.throw();
            expect(() => transform(undefined as any, identity)).not.to.throw();
        });

        it(`throws a PluginError when no callback function is passed`, () => {
            expect(() => (transform as any)()).to.throw(PluginError);
            expect(() => (transform as any)(1)).to.throw(PluginError);
            expect(() => (transform as any)("utf8")).to.throw(PluginError);
            expect(() => (transform as any)("utf8", { encoding: "utf8" })).to.throw(PluginError);
        });

        it("emits a PluginError when callback throws an error", async () => {
            await expect(write(file, transform(() => JSON.parse("π")))).to.be.rejectedWith(PluginError);
        });

        it("emits a PluginError when callback returns a rejected promise", async () => {
            await expect(write(file, transform("utf8", () => Promise.reject("x")))).to.be.rejectedWith(PluginError);
        });
    });

    describe("options", () => {

        it("may be either arguments[0] or arguments[1]", () => {
            expect(() => transform({ }, identity)).not.to.throw();
            expect(() => transform("utf8", identity)).not.to.throw();
            expect(() => transform(null as any, identity)).not.to.throw();
            expect(() => transform(undefined as any, identity)).not.to.throw();
            expect(() => transform(identity, { } as any)).not.to.throw();
            expect(() => transform(identity, "utf8" as any)).not.to.throw();
            expect(() => transform(identity, null as any)).not.to.throw();
            expect(() => transform(identity, undefined as any)).not.to.throw();
        });

        it("may be omitted", () => {
            expect(() => transform(identity)).not.to.throw();
        });

        it("may contain properties not recognized as options", () => {
            expect(() => transform({ one: 1, encoding: "utf8" } as any, identity)).not.to.throw();
            expect(() => transform(identity, { two: 2 } as any)).not.to.throw();
        });

        it("throws a PluginError when options is a function", () => {
            const options: any = (x: any) => x;
            options["encoding"] = "utf8";

            expect(() => transform(options, identity)).to.throw(PluginError);
            expect(() => transform(identity, options)).to.throw(PluginError);
        });

        it("throws a PluginError when options is not an object, a string, null, or undefined", () => {
            expect(() => transform(true as any, identity)).to.throw(PluginError);
            expect(() => transform(NaN as any, identity)).to.throw(PluginError);
        });
    });
});
