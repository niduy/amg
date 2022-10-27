const IMAGE_MARGIN = 20;
const BASE_FONT_SIZE_IN_PX = 5;
const BASE_LINE_HEIGHT_IN_PX = 8;
const ONE_CHAR_ADJUSTMENT = BASE_FONT_SIZE_IN_PX;

// Resize text based on available width
export const resizeAscii = (
	asciiElement,
	imageElement,
	imageElementInitialDimentions
) => {
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
};

export const initFileInputWithGif = async (imageInputElement) => {
	const response = await fetch('./assets/triangle.gif');
	const gifBlob = await response.blob();
	const gif = new File([gifBlob], 'triangle.gif', {
		type: 'image/gif',
	});

	const fileChangeEvent = new CustomEvent('change', {
		detail: gif,
	});

	imageInputElement.dispatchEvent(fileChangeEvent);
};
