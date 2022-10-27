import { printAsciiImages, convertImg, convertGif } from './ascii.js';
import { initFileInputWithGif, resizeAscii } from './ui.js';
import { sleep } from './utils.js';

// When updating an image, it is important to cancel the printing of the previous one.
// In JavaScript, synchronous operations are added to the stack and executed on the
// first-in-last-out bases, which makes it practically impossible to cancel a loop from the outside
// Luckly, JavaScript has AbortController that allows us to cancel asynchronous operations. It
// allows us to start a loop within a promise and cancel it simply by running `abortController.abort()`
// from anywhere in the code
let abortController = null;

// Original dimensions of the image are going to be used to calculate it's
// line height and font size
let imageElementInitialDimentions = { width: 0, height: 0 };

const imageInputElement = document.getElementById('image-input');
const imageInputButtonElement = document.getElementById('image-input-button');
const imageInputTextElement = document.getElementById('image-input-text');
const imageElement = document.getElementById('img');
const asciiElement = document.getElementById('ascii');

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
	// but to avoid serialization, it's best to pass primitive types
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

imageInputElement.addEventListener('change', async (event) => {
	await handleImageInputChange(event, asciiElement, imageElement);
	resizeAscii(asciiElement, imageElement, imageElementInitialDimentions);
});

imageInputButtonElement.addEventListener('click', () =>
	imageInputElement.click()
);

window.addEventListener('resize', () =>
	resizeAscii(asciiElement, imageElement, imageElementInitialDimentions)
);

await initFileInputWithGif(imageInputElement);
