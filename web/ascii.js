import init, { convert_img, convert_gif } from '../pkg/amg.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const printAsciiImage = async (ascii_image, abortSignal, asciiElement) => {
	if (abortSignal.aborted) return;

	// Setting such amount of text in an element takes up to a few milliseconds,
	// so we need to deduct this amount from the delay to keep the gif and the ascii gif in sync longer
	const startDate = new Date().getTime();
	asciiElement.textContent = ascii_image.ascii_string;
	const finishDate = new Date().getTime();

	const trueDelay = ascii_image.delay - (finishDate - startDate);

	await sleep(trueDelay);
};

export const printAsciiImages = async (
	ascii_images,
	abortSignal,
	asciiElement
) => {
	while (!abortSignal.aborted) {
		for (const ascii_image of ascii_images) {
			await printAsciiImage(ascii_image, abortSignal, asciiElement);
		}
	}
};

await init();

export const convertImg = convert_img;
export const convertGif = convert_gif;
