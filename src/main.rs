use image::{codecs::gif::GifDecoder, AnimationDecoder, DynamicImage, Frame, GenericImageView};
use std::fs::File;
use std::thread::sleep;
use std::time::Duration;

const ASCII: [&'static str; 8] = [" ", "=", "+", "*", "@", "#", "░▒", "▓▓"];

fn convert_frame_to_ascii(frame: &Frame) -> String {
    let img = DynamicImage::ImageRgba8(frame.buffer().clone());
    let (width, height) = img.dimensions();
    let mut output = String::new();

    for y in 0..height {
        if y % 8 != 0 {
            continue;
        }

        for x in 0..width {
            if x % 4 == 0 {
                let pixels = img.get_pixel(x, y);
                let red = pixels[0];
                let green = pixels[1];
                let blue = pixels[2];

                let intensity = red / 3 + green / 3 + blue / 3;

                let index = (intensity / 32) as usize;
                output.push(ASCII[usize::from(index)].chars().nth(0).unwrap());
            }
        }

        output.push('\n')
    }

    output
}

fn main() {
    let path = "/path/to/gif";

    let file = File::open(path).unwrap();
    let decoded_gif = GifDecoder::new(file).unwrap();

    let frames: Vec<Frame> = decoded_gif
        .into_frames()
        .into_iter()
        .filter(|frame| frame.is_ok())
        .map(|frame| frame.unwrap())
        .collect();

    let ascii_images: Vec<String> = frames
        .clone()
        .into_iter()
        .map(|frame| convert_frame_to_ascii(&frame))
        .collect();

    loop {
        for index in 0..frames.len() {
            println!("\x1Bc{}", ascii_images[index]);
            let (delay, ..) = frames[index].delay().numer_denom_ms();

            // TODO: account for the time it takes to render the image
            sleep(Duration::from_millis(u64::from(delay)))
        }
    }
}
