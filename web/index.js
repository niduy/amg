import { printAsciiImages, convertImg, convertGif } from './ascii.js';
import { sleep } from './utils.js';

const handleImageInputChange = async (event, asciiElement, imageElement) => {
	// When a new image is provided, send a signal to abort the async operation
	if (abortController) {
		abortController.abort();
		abortController = null;
	}

	const file = event.target.files[0];
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
		await printAsciiImages(ascii_images, abortController.signal, asciiElement);
		return;
	}

	const ascii_image = convertImg(imageUint8Array);
	imageElement.src = imageUrl;
	asciiElement.textContent = ascii_image;
};

const imageInputElement = document.getElementById('image-input');
const imageInputButtonElement = document.getElementById('image-input-button');
const imageInputTextElement = document.getElementById('image-input-text');
const imageElement = document.getElementById('img');
const asciiElement = document.getElementById('ascii');
const imageContainers = document.querySelectorAll('.image-container');

// When updating an image, it is important to cancel the generation of the previous one.
// In JavaScript, synchronous operations are added to the stack and executed on the
// first-in-last-out bases, which makes it practically impossible to cancel a loop from the outside
// Lucklly, JavaScript has AbortController that allows us to cancel asynchronous operations. It
// allows us to start a loop within a promise and cancel it simply by running `abortController.abort()`
// from anywhere in the code
let abortController = null;

imageInputElement.addEventListener('change', (event) =>
	handleImageInputChange(event, asciiElement, imageElement, imageContainers)
);

imageInputButtonElement.addEventListener('click', () =>
	imageInputElement.click()
);

// Initialize image input with a gif
const gifBlob = await fetch('./assets/triangle.gif');
const gif = new File([gifBlob], 'triangle.gif', {
	type: 'image/gif',
});
const changeEvent = new Event('change', {
	target: {
		files: [gif],
	},
});

imageInputElement.dispatchEvent(changeEvent);

// Sorry. I'm lazy too lazy to add dynamically appearing borders to the containers
await sleep(300);
imageContainers.forEach((container) => {
	container.style.border = '1px solid #ccc';
});
