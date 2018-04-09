import { expect } from "chai";
import PluginError = require("plugin-error");
import Vinyl = require("vinyl");
import { identity, noop } from "lodash";
import { createBufferFile, createStreamFile, createNullFile, toBuffer, write, read, readFile } from "./helpers";
import transform = require("../src");

describe("content mode", () => {

    describe("buffer", () => {
        let file1: Vinyl;
        let file2: Vinyl;

        beforeEach(() => {
            file1 = createBufferFile([0xCF, 0x80]);
            file2 = createBufferFile([0xCF, 0x80]);
        });

        it("transforms file contents when callback is synchronous", async () => {
            await write(file1, transform((x) => Buffer.concat([x, x])));
            await write(file2, transform("hex", (x) => `32${x}72`));

            await expect(readFile(file1)).to.eventually.deep.equal(toBuffer([0xCF, 0x80, 0xCF, 0x80]));
            await expect(readFile(file2, "utf8")).to.eventually.equal("2πr");
        });

        it("transforms file contents when callback returns a promise", async () => {
            await write(file1, transform((x) => Promise.resolve(Buffer.concat([x, x]))));
            await write(file2, transform("hex", (x) => Promise.resolve(`32${x}72`)));

            await expect(readFile(file1)).to.eventually.deep.equal(toBuffer([0xCF, 0x80, 0xCF, 0x80]));
            await expect(readFile(file2, "utf8")).to.eventually.equal("2πr");
        });

        it("emits errors that occur in the stream as PluginErrors", async () => {
            await expect(write(file1, transform(noop as any))).to.be.rejectedWith(PluginError);
            await expect(write(file2, transform("utf8", (x) => JSON.parse(x)))).to.be.rejectedWith(PluginError);
        });
    });

    describe("stream", () => {
        let file1: Vinyl;
        let file2: Vinyl;

        beforeEach(() => {
            file1 = createStreamFile([0xCF, 0x80]);
            file2 = createStreamFile([0xCF, 0x80]);
        });

        it("transforms file contents when callback is synchronous", async () => {
            await write(file1, transform((x) => Buffer.concat([x, x])));
            await write(file2, transform("hex", (x) => `32${x}72`));

            await expect(readFile(file1)).to.eventually.deep.equal(toBuffer([0xCF, 0x80, 0xCF, 0x80]));
            await expect(readFile(file2, "utf8")).to.eventually.equal("2πr");
        });

        it("transforms file contents when callback returns a promise", async () => {
            await write(file1, transform((x) => Promise.resolve(Buffer.concat([x, x]))));
            await write(file2, transform("hex", (x) => Promise.resolve(`32${x}72`)));

            await expect(readFile(file1)).to.eventually.deep.equal(toBuffer([0xCF, 0x80, 0xCF, 0x80]));
            await expect(readFile(file2, "utf8")).to.eventually.equal("2πr");
        });

        it("emits errors that occur in the stream as PluginErrors", async () => {
            const stream = transform(noop as any);
            const promise = new Promise((_resolve, reject) => stream.on("error", reject));

            write(file1, stream);
            await expect(promise).to.be.rejectedWith(PluginError);
        });
    });

    describe("null", () => {

        it("passes the file through the stream without modification", async () => {
            const file = createNullFile();
            const stream = transform(identity);

            await write(file, stream);
            await expect(read(stream)).to.eventually.equal(file);
        });
    });
});
