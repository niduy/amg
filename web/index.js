import { printAsciiImages, convertImg, convertGif } from './ascii.js';

const handleImageInputChange = async (event, asciiElement, imageElement) => {
	if (abortController) {
		abortController.abort();
		abortController = null;
	}

	const file = event.target.files[0];
	const isGif = file.type.split('/').pop() === 'gif';

	const imageUrl = URL.createObjectURL(file);

	const file_buffer = await file.arrayBuffer();
	const uint8Array = new Uint8Array(file_buffer);

	if (isGif) {
		abortController = new AbortController();
		const ascii_images = convertGif(uint8Array);

		imageElement.src = imageUrl;
		await printAsciiImages(ascii_images, abortController.signal, asciiElement);
		return;
	}

	const ascii_image = convertImg(uint8Array);
	imageElement.src = imageUrl;
	asciiElement.textContent = ascii_image;
};

const imageInputElement = document.getElementById('image-input');
const imageElement = document.getElementById('img');
const asciiElement = document.getElementById('ascii');

let abortController = null;

imageInputElement.addEventListener('change', (event) =>
	handleImageInputChange(event, asciiElement, imageElement)
);
