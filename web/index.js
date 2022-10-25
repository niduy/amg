import init, { convert_img, convert_gif } from '../pkg/amg.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const printAsciiImage = async (ascii_image, abortSignal) => {
	if (abortSignal.aborted) return;

	// Setting this amount of text in an element takes up to a few milliseconds, so we need to deduct this amount from the delay to keep the gif and the ascii gif in sync longer
	const startDate = new Date().getTime();

	asciiElement.textContent = ascii_image.ascii_string;
	const finishDate = new Date().getTime();

	const trueDelay = ascii_image.delay - (finishDate - startDate);

	await sleep(trueDelay);
};

const printAsciiImages = async (ascii_images, abortSignal) => {
	for (const ascii_image of ascii_images) {
		await printAsciiImage(ascii_image, abortSignal);
	}
};

const handleImageInputChange = async (event) => {
	if (abortController) {
		abortController.abort();
		abortController = null;
	}

	clearInterval(timer);

	const file = event.target.files[0];
	const isGif = file.type.split('/').pop() === 'gif';

	const imageUrl = URL.createObjectURL(file);
	const file_buffer = await file.arrayBuffer();
	const uint8Array = new Uint8Array(file_buffer);

	if (isGif) {
		abortController = new AbortController();
		const ascii_images = convert_gif(uint8Array);
		const totalImageDelay = ascii_images.reduce(
			(acc, img) => acc + img.delay,
			0
		);

		timer = setInterval(
			async () => printAsciiImages(ascii_images, abortController.signal),
			totalImageDelay
		);

		imageElement.src = imageUrl;
		await printAsciiImages(ascii_images, abortController.signal);
		return;
	}

	const ascii_image = convert_img(uint8Array);
	imageElement.src = imageUrl;
	asciiElement.textContent = ascii_image;
};

await init();

const imageInputElement = document.getElementById('image-input');
const imageElement = document.getElementById('img');
const asciiElement = document.getElementById('ascii');

let timer = null;
let abortController = null;

imageInputElement.addEventListener('change', handleImageInputChange);
