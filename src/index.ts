import { error } from './logger';

const preloadEl = document.querySelector('#preloader');
if (!preloadEl) throw new Error('Could not find preloader element');

(async () => {
	const { main } = await import('./main');
	await main();
	preloadEl.remove();
})().catch((err) => {
	error('failed to load', err);
	preloadEl.innerHTML = `<span>Something went wrong: ${
		err?.message || 'unknown error'
	}</span>`;
});
