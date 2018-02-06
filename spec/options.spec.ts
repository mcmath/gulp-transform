import { expect } from "chai";
import PluginError = require("plugin-error");
import Vinyl = require("vinyl");
import { identity } from "lodash";
import { SinonSpy, spy } from "sinon";
import { createBufferFile, toBuffer, write } from "./helpers";
import transform = require("../src");

describe("options", () => {

    describe("encoding", () => {
        let file: Vinyl;
        let callback: SinonSpy;

        beforeEach(() => {
            file = createBufferFile([0xCF, 0x80]);
            callback = spy(identity);
        });

        it("sets the character encoding of callback arguments[0] when encoding is a string", async () => {
            await write(file, transform("utf8", callback));
            await write(file, transform({ encoding: "utf16le" }, callback));
            await write(file, transform(callback as any, "base64" as any));
            await write(file, transform(callback as any, { encoding: "hex" } as any));

            expect(callback).to.have.callCount(4);
            expect(callback.getCall(0)).to.have.been.calledWith("π");
            expect(callback.getCall(1)).to.have.been.calledWith("胏");
            expect(callback.getCall(2)).to.have.been.calledWith("z4A=");
            expect(callback.getCall(3)).to.have.been.calledWith("cf80");
        });

        it("calls callback arguments[0] with a Buffer when encoding is null", async () => {
            await write(file, transform(null, callback));
            await write(file, transform({ encoding: null }, callback));
            await write(file, transform(callback as any, null as any));
            await write(file, transform(callback as any, { encoding: null } as any));

            expect(callback).to.have.callCount(4);
            expect(callback).to.have.always.been.calledWithMatch(toBuffer([0xCF, 0x80]));
        });

        it("calls callback arguments[0] with a Buffer when encoding is \"\"", async () => {
            await write(file, transform("" as any, callback));
            await write(file, transform({ encoding: "" } as any, callback));
            await write(file, transform(callback as any, "" as any));
            await write(file, transform(callback as any, { encoding: "" } as any));

            expect(callback).to.have.callCount(4);
            expect(callback).to.have.always.been.calledWithMatch(toBuffer([0xCF, 0x80]));
        });

        it("defaults to null", async () => {
            await write(file, transform(callback));
            await write(file, transform(undefined as any, callback));
            await write(file, transform({ } as any, callback));
            await write(file, transform(callback as any, undefined as any));
            await write(file, transform(callback as any, { } as any));

            expect(callback).to.have.callCount(5);
            expect(callback).to.have.always.been.calledWithMatch(toBuffer([0xCF, 0x80]));
        });

        it("throws a PluginError when encoding is not a string, null, or undefined", () => {
            expect(() => transform({ encoding: true } as any, identity)).to.throw(PluginError);
            expect(() => transform({ encoding: NaN } as any, identity)).to.throw(PluginError);
        });

        it("throws a PluginError when encoding is not supported by Node.js", () => {
            expect(() => transform("uft8" as any, identity)).to.throw(PluginError);
            expect(() => transform({ encoding: "base52" } as any, identity)).to.throw(PluginError);
        });

        it("emits a PluginError when encoding is a string and callback result is not a string", async () => {
            await expect(write(file, transform("utf8", () => toBuffer([0xCF]) as any))).to.be.rejectedWith(PluginError);
            await expect(write(file, transform("utf8", () => 123456789 as any))).to.be.rejectedWith(PluginError);
            await expect(write(file, transform("utf8", () => null as any))).to.be.rejectedWith(PluginError);
            await expect(write(file, transform("utf8", () => undefined as any))).to.be.rejectedWith(PluginError);
        });

        it("emits a PluginError when encoding is null or undefined and callback result is not a Buffer", async () => {
            await expect(write(file, transform((x) => String(x) as any))).to.be.rejectedWith(PluginError);
            await expect(write(file, transform(() => 123456789 as any))).to.be.rejectedWith(PluginError);
            await expect(write(file, transform(() => null as any))).to.be.rejectedWith(PluginError);
            await expect(write(file, transform(() => undefined as any))).to.be.rejectedWith(PluginError);
        });
    });

    describe("thisArg", () => {
        let file: Vinyl;
        let callback: SinonSpy;
        let thisArg: object;

        beforeEach(() => {
            file = createBufferFile([0xCF, 0x80]);
            callback = spy(identity);
            thisArg = { };
        });

        it("sets the value of this within callback", async () => {
            await write(file, transform({ thisArg }, callback));
            await write(file, transform(callback as any, { thisArg } as any));

            expect(callback).to.have.callCount(2);
            expect(callback).to.have.always.been.calledOn(thisArg);
        });

        it("defaults to undefined", async () => {
            await write(file, transform(callback));
            await write(file, transform("utf8", callback));
            await write(file, transform({ }, callback));
            await write(file, transform(callback as any, null as any));
            await write(file, transform(callback as any, { } as any));

            expect(callback).to.have.callCount(5);
            expect(callback).to.have.always.been.calledOn(undefined);
        });
    });
});
