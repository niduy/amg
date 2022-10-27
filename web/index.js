import { printAsciiImages, convertImg, convertGif } from './ascii.js';
import { sleep } from './utils.js';

const handleImageInputChange = async (event, asciiElement, imageElement) => {
	// When a new image is provided, send a signal to abort the async operation
	if (abortController) {
		abortController.abort();
		abortController = null;
	}

	const file = event.detail ?? event.target.files[0];
	const isGif = file.type.split('/').pop() === 'gif';

	imageInputTextElement.innerHTML = file.name;

	const imageUrl = URL.createObjectURL(file);

	// Technically, it is possible to pass the image as is to the wasm executable,
	// but to avoid extract serialization, it's best to pass primitive types
	// and byte arrays
	const imageBuffer = await file.arrayBuffer();
	const imageUint8Array = new Uint8Array(imageBuffer);

	if (isGif) {
		abortController = new AbortController();
		const ascii_images = convertGif(imageUint8Array);

		imageElement.src = imageUrl;
		while (imageElement.naturalWidth === imageElementInitialDimentions.width) {
			await sleep(10);
		}
		imageElementInitialDimentions = {
			width: imageElement.naturalWidth,
			height: imageElement.naturalHeight,
		};
		printAsciiImages(ascii_images, abortController.signal, asciiElement);
		return;
	}

	const ascii_image = convertImg(imageUint8Array);
	imageElement.src = imageUrl;
	while (imageElement.naturalWidth === imageElementInitialDimentions.width) {
		await sleep(10);
	}
	imageElementInitialDimentions = {
		width: imageElement.naturalWidth,
		height: imageElement.naturalHeight,
	};
	asciiElement.textContent = ascii_image;
};

const imageInputElement = document.getElementById('image-input');
const imageInputButtonElement = document.getElementById('image-input-button');
const imageInputTextElement = document.getElementById('image-input-text');
const imageElement = document.getElementById('img');
const asciiElement = document.getElementById('ascii');

let imageElementInitialDimentions = { width: 0, height: 0 };

// When updating an image, it is important to cancel the printing of the previous one.
// In JavaScript, synchronous operations are added to the stack and executed on the
// first-in-last-out bases, which makes it practically impossible to cancel a loop from the outside
// Luckly, JavaScript has AbortController that allows us to cancel asynchronous operations. It
// allows us to start a loop within a promise and cancel it simply by running `abortController.abort()`
// from anywhere in the code
let abortController = null;

imageInputElement.addEventListener('change', async (event) => {
	await handleImageInputChange(event, asciiElement, imageElement);
	resizeAscii(event, asciiElement, imageElement);
});

imageInputButtonElement.addEventListener('click', () =>
	imageInputElement.click()
);

const IMAGE_MARGIN = 20;
const BASE_FONT_SIZE_IN_PX = 5;
const BASE_LINE_HEIGHT_IN_PX = 8;
const ONE_CHAR_ADJUSTMENT = BASE_FONT_SIZE_IN_PX;

// Resize text based on available width
const resizeAscii = (event, asciiElement, imageElement) => {
	const ascii = asciiElement.textContent;
	const { width: originalWidth, height: originalHeight } =
		imageElementInitialDimentions;

	let width = originalWidth;
	let height = originalHeight;

	const baseWidth =
		originalWidth + IMAGE_MARGIN > window.innerWidth
			? window.innerWidth
			: originalWidth;

	const ratio = originalWidth / originalHeight;

	// The adjustment is needed to properly calculate font size
	width = baseWidth - IMAGE_MARGIN - ONE_CHAR_ADJUSTMENT;
	height = width / ratio;

	imageElement.style.width = `${width}px`;
	imageElement.style.heigh = `${height}px`;

	const fontSize = width / (originalWidth / BASE_FONT_SIZE_IN_PX);
	const lineHeight = height / (originalHeight / BASE_LINE_HEIGHT_IN_PX);

	asciiElement.style.fontSize = `${fontSize}px`;
	asciiElement.style.lineHeight = `${lineHeight}px`;
	asciiElement.style.letterSpacing = `${0}px`;
};

window.addEventListener('resize', (event) =>
	resizeAscii(event, asciiElement, imageElement)
);

// Initialize image input with a gif
const response = await fetch('./assets/triangle.gif');
const gifBlob = await response.blob();
const gif = new File([gifBlob], 'triangle.gif', {
	type: 'image/gif',
});

const fileChangeEvent = new CustomEvent('change', {
	detail: gif,
});

imageInputElement.dispatchEvent(fileChangeEvent);
