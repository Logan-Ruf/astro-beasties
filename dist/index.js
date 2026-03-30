import Beasties from "beasties";
import { glob } from "glob";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import logger from "./logger.js";
const processFiles = async (dir, options) => {
    if (options.pruneSource) {
        logger.error("Option 'pruneSource' is not supported.");
        return;
    }
    const path = options.path || fileURLToPath(dir);
    const files = await glob(`${path}**/*.html`, {
        ignore: options.exclude,
    });
    const beasties = new Beasties({
        ...options,
        path,
        logger: {
            trace: (msg) => logger.info(msg),
            debug: (msg) => logger.info(msg),
            info: (msg) => logger.info(msg),
            warn: (msg) => logger.warn(msg),
            error: (msg) => logger.error(msg),
        },
        logLevel: "info",
    });
    for (const file of files) {
        logger.info(`./${file.replace(path, "")}...`);
        const html = await fs.readFile(file, "utf-8");
        const inlined = await beasties.process(html);
        await fs.writeFile(file, inlined);
    }
    logger.success(`Processed ${files.length} files`);
};
export default (options) => ({
    name: "astro-beasties",
    hooks: {
        "astro:build:done": ({ dir }) => processFiles(dir, options || {}),
    },
});
