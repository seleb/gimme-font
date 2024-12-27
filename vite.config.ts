import { Plugin, defineConfig } from 'vite';
import pkg from './package.json';

const htmlReplacePlugin: Plugin = {
	name: 'transform-html',
	transformIndexHtml: {
		order: 'pre',
		handler(html: string) {
			return html
				.replaceAll('%TITLE%', pkg.name)
				.replaceAll('%DESCRIPTION%', pkg.description)
				.replaceAll('%VERSION%', pkg.version);
		},
	},
};

export default defineConfig({
	base: './',
	build: {
		outDir: './dist',
	},
	server: {
		port: 80,
	},
	plugins: [htmlReplacePlugin],
});
