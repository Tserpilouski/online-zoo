import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	root: '.',
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				landing: resolve(__dirname, 'pages/landing/index.html'),
				map: resolve(__dirname, 'pages/map/index.html'),
				zoos: resolve(__dirname, 'pages/zoos/index.html'),
				'contact-us': resolve(__dirname, 'pages/contact-us/index.html'),
			},
		},
		cssCodeSplit: false,
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
			},
		},
	},
});
