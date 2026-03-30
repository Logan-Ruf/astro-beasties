# astro-beasties

An [Astro](https://astro.build) integration that uses [Beasties](https://github.com/danielroe/beasties) to inline critical CSS into your HTML during static builds.

Beasties is the actively maintained successor to [critters](https://github.com/GoogleChromeLabs/critters). It parses your HTML and inlines all CSS used on the page, then lazy-loads the remaining stylesheets.

## Installation

```sh
npm install astro-beasties
```

## Usage

Add the integration to your `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import beasties from "astro-beasties";

export default defineConfig({
  integrations: [beasties()],
});
```

### With options

All [Beasties options](https://github.com/danielroe/beasties#usage) are supported:

```js
import { defineConfig } from "astro/config";
import beasties from "astro-beasties";

export default defineConfig({
  integrations: [
    beasties({
      preload: "swap",
      inlineFonts: true,
      compress: true,
    }),
  ],
});
```

### Additional options

| Option | Type | Description |
| --- | --- | --- |
| `path` | `string` | Override the build output directory (defaults to Astro's `dist` dir) |
| `exclude` | `string \| string[]` | Glob pattern(s) to exclude HTML files from processing |

> **Note:** The `pruneSource` option is not supported and will log an error if used.

## How it works

This integration hooks into `astro:build:done`, which runs after your static site has been generated. It finds all `.html` files in the output directory, processes each one with Beasties to inline critical CSS, and writes the result back.

## Credits

- [Beasties](https://github.com/danielroe/beasties) by Daniel Roe

## License

MIT
