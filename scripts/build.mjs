// Minifies src/css and src/js into public/ (the *.min.* files the pages reference).
import { build } from 'esbuild';

const common = { minify: true, logLevel: 'info' };

await build({ ...common, entryPoints: ['src/css/style.css'], outfile: 'public/css/style.min.css' });
await build({ ...common, entryPoints: ['src/js/main.js'], outfile: 'public/js/main.min.js' });
await build({ ...common, entryPoints: ['src/js/contact.js'], outfile: 'public/js/contact.min.js' });
