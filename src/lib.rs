use image::{codecs::gif::GifDecoder, AnimationDecoder, DynamicImage, Frame, GenericImageView};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

const ASCII: [char; 8] = [' ', '.', ',', '+', '*', '8', '#', '@'];

#[derive(Serialize, Deserialize)]
pub struct GifAsciiFrame {
    pub ascii_string: String,
    pub delay: u32,
}

fn convert_image_to_ascii(img: &DynamicImage) -> String {
    let (width, height) = img.dimensions();
    let mut output = String::new();

    // Display a symbol for every 24th symbol to make it look as close as possible to
    // the original image dimention-wise
    for y in 0..height {
        if y % 8 != 0 {
            continue;
        }

        for x in 0..width {
            if x % 3 == 0 {
                let pixels = img.get_pixel(x, y);
                let red = pixels[0];
                let green = pixels[1];
                let blue = pixels[2];

                let intensity = red / 3 + green / 3 + blue / 3;

                let index = usize::from(intensity / 32);
                output.push(ASCII[index]);
            }
        }

        output.push('\n')
    }

    output
}

fn convert_frame_to_gif_ascii_frame(frame: Frame) -> GifAsciiFrame {
    let ascii_string = convert_image_to_ascii(&DynamicImage::ImageRgba8(frame.buffer().clone()));
    let (delay, ..) = frame.delay().numer_denom_ms();

    GifAsciiFrame {
        ascii_string,
        delay,
    }
}

#[wasm_bindgen]
pub fn convert_img(image_buffer: Vec<u8>) -> String {
    let img = image::load_from_memory(&image_buffer).unwrap();

    convert_image_to_ascii(&img)
}

#[wasm_bindgen]
pub fn convert_gif(image_buffer: Vec<u8>) -> Result<JsValue, JsValue> {
    // GifDecoder only accepts inputs with the train "Read",
    // while vectors don't have it. To fix this, convert Vec<u8> to &[u8]
    let readable_image_buffer = &image_buffer[..];
    let decoder = GifDecoder::new(readable_image_buffer).unwrap();

    let frames: Vec<Frame> = decoder
        .into_frames()
        .into_iter()
        .filter(|frame| frame.is_ok())
        .map(|frame| frame.unwrap())
        .collect();

    let gif_ascii_frames: Vec<GifAsciiFrame> = frames
        .into_iter()
        .map(convert_frame_to_gif_ascii_frame)
        .collect();

    // While sending serialized data to JavaScript is convenient,
    // for performance-crusial applications it's best to opt-in to
    // sending stuff that is part of IntoWasmAbi or modifying memory
    // directly
    Ok(serde_wasm_bindgen::to_value(&gif_ascii_frames).unwrap())
}
