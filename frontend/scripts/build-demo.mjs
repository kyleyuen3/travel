// Builds the demo (mock data, no backend) and inlines it into a single HTML file:
//   npm run build:demo  ->  dist-demo/citypins-preview.html
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'dist-demo');

execSync('npx vite build --mode demo', { cwd: root, stdio: 'inherit' });

const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
const read = (href) => fs.readFileSync(path.join(outDir, href.replace(/^\.\//, '')), 'utf8');

const js = [...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g)].map((m) => read(m[1]));
const css = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((m) => read(m[1]));

// Keep "</script" inside the bundle from closing the inline tag early.
const safeJs = js.join('\n').replace(/<\/script/gi, '<\\/script');

const page = `<title>CityPins</title>
<style>
${css.join('\n')}
</style>
<div id="root"></div>
<script type="module">
${safeJs}
</script>
`;

const outFile = path.join(outDir, 'citypins-preview.html');
fs.writeFileSync(outFile, page);
console.log(`Wrote ${path.relative(root, outFile)} (${(page.length / 1024).toFixed(0)} KB)`);
