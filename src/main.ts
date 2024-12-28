import { generateText } from './generateText';
import { error } from './logger';
import { randItem } from './randItem';
import { storage } from './Storage';

export async function main() {
	const elPrompt = document.querySelector<HTMLDivElement>('#prompt');
	const elStorageWarning =
		document.querySelector<HTMLDivElement>('#storage-warning');
	const elRandom = document.querySelector<HTMLButtonElement>('#random');
	const elRandomAll = document.querySelector<HTMLButtonElement>('#random-all');
	const elCountFamily =
		document.querySelector<HTMLSpanElement>('#family-count');
	const elCountStyle = document.querySelector<HTMLSpanElement>('#style-count');
	const elList = document.querySelector<HTMLUListElement>('#list');
	const elPreview = document.querySelector<HTMLElement>('#preview');
	const elFontname = elPreview?.querySelector('.fontname');
	const elPreviewHeader = elPreview?.querySelector('header');
	const elPreviewBody = elPreview?.querySelector('.lipsum');
	const elPreviewLock = elPreview?.querySelector('input');

	if (
		!elPrompt ||
		!elStorageWarning ||
		!elRandom ||
		!elRandomAll ||
		!elCountFamily ||
		!elCountStyle ||
		!elList ||
		!elPreview ||
		!elFontname ||
		!elPreviewHeader ||
		!elPreviewBody ||
		!elPreviewLock
	)
		throw new Error('could not find elements');

	if (!('queryLocalFonts' in window))
		throw new Error(
			`Sorry, this app doesn't work on your browser! <a href="https://developer.mozilla.org/en-US/docs/Web/API/Local_Font_Access_API#browser_compatibility">See here</a> for other browsers that may work for you.`
		);

	const permission = await navigator.permissions.query({ name: 'local-fonts' });
	if (permission.state === 'denied')
		throw new Error(
			`You've denied access to your local fonts! If you want to use this app, enable or reset this permission manually through your browser's settings.`
		);

	if (permission.state === 'prompt') {
		// show button to prompt access
		document
			.querySelector('#permission')
			?.addEventListener('click', async () => {
				await window.queryLocalFonts?.();
				window.location.reload();
			});
		return;
	}
	elPrompt.remove();

	const locked = new Set<string>();
	try {
		const stored = await storage.getItem('locked');
		if (Array.isArray(stored)) {
			stored.forEach((i) => {
				if (typeof i === 'string') {
					locked.add(i);
				}
			});
		}
	} catch (err) {
		elStorageWarning.style.display = 'block';
		error(err);
	}

	let families = new Map<string, FontData[]>();

	const onChangeLock = (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		if (input.checked) {
			locked.add(input.value);
		} else {
			locked.delete(input.value);
		}
		storage.setItem('locked', [...locked]);
	};

	const updatePreview = (familyKey: string) => {
		const [textHeader, textBody] = generateText();
		const family = families.get(familyKey);
		elPreview.style.fontFamily = `"${familyKey}"`;
		elFontname.textContent =
			(family?.length ?? 1) > 1
				? `${familyKey} (${family?.length} styles)`
				: familyKey;
		elPreviewHeader.textContent = textHeader;
		elPreviewBody.innerHTML = textBody;
		elPreview.dataset.slide =
			elPreview.dataset.slide === 'false' ? 'true' : 'false';
		families.delete(familyKey);
		elPreviewLock.value = familyKey;
		elPreviewLock.addEventListener('change', onChangeLock);

		if (!families.size) {
			elRandom.disabled = true;
			elRandomAll.disabled = true;
			elRandom.textContent = 'No more fonts';
		}
	};
	const copyPreview = () => {
		const clone = elPreview.cloneNode(true) as typeof elPreview;
		clone.id = '';
		const elInput = clone.querySelector('input');
		if (elInput) {
			elInput.addEventListener('change', onChangeLock);
		}
		elPreview.after(clone);
		elPreviewLock.checked = false;
	};

	const loadFonts = async () => {
		const fonts = (await window.queryLocalFonts?.()) || [];
		if (!fonts.length) throw new Error('Could not find any fonts');
		families.clear();
		fonts.forEach((i) => {
			const family = families.get(i.family);
			if (!family) {
				families.set(i.family, [i]);
			} else {
				family.push(i);
			}
		});
		elCountFamily.textContent = families.size.toLocaleString();
		elCountStyle.textContent = fonts.length.toLocaleString();
	};

	elRandom.onclick = () => {
		copyPreview();
		updatePreview(randItem([...families.keys()]));
	};
	elRandomAll.onclick = async () => {
		if (!window.confirm('Are you sure? This might take awhile...')) return;
		while (families.size) {
			copyPreview();
			updatePreview(randItem([...families.keys()]));
			await new Promise((r) => requestAnimationFrame(r));
		}
	};

	// permission already granted
	await loadFonts();
	// load locked fonts

	for (let font of locked) {
		updatePreview(font);
		elPreviewLock.checked = true;
		copyPreview();
		await new Promise((r) => requestAnimationFrame(r));
	}

	// load initial random font
	updatePreview(randItem([...families.keys()]));
}
