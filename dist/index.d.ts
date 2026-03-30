import type { AstroIntegration } from "astro";
import type { Options } from "beasties";
interface AstroBeastiesOptions extends Options {
    exclude?: string | string[];
}
declare const _default: (options?: AstroBeastiesOptions) => AstroIntegration;
export default _default;
