import { LoremIpsum } from 'lorem-ipsum';
import { pangrams } from './pangrams';
import { randIdx, randItem } from './randItem';

const lorem = new LoremIpsum({
	sentencesPerParagraph: {
		max: 8,
		min: 4,
	},
	wordsPerSentence: {
		max: 16,
		min: 4,
	},
});

export function generateText() {
	const words = lorem.generateParagraphs(1).split(' ');
	for (let i = 0; i < 3; ++i) {
		const idxBold = randIdx(words);
		const idxItalic = randIdx(words);
		const idxBoldItalic = randIdx(words);
		const idxNumber = randIdx(words);
		words[idxBold] = `<b>${words[idxBold]}</b>`;
		words[idxItalic] = `<i>${words[idxItalic]}</i>`;
		words[idxBoldItalic] = `<b><i>${words[idxBoldItalic]}</i></b>`;
		words[idxNumber] = (Math.random() * 1000).toFixed(2);
	}
	return [randItem(pangrams), words.join(' ')];
}
