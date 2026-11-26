import { PNG } from 'pngjs';

/** Crop WinApp's transparent window shadow and composite rounded corners. */
export function makeWindowScreenshotOpaque(contents: Buffer): Buffer {
  const source = PNG.sync.read(contents);
  const { width, height, data } = source;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  let firstOpaqueIndex = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (data[index + 3] !== 255) continue;
      if (firstOpaqueIndex < 0) firstOpaqueIndex = index;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (firstOpaqueIndex < 0) {
    throw new Error('WinApp screenshot contained no fully opaque window pixels');
  }

  const cropped = new PNG({ width: right - left + 1, height: bottom - top + 1 });
  const sampleX = Math.min(left + 16, right);
  const sampleY = Math.min(top + 16, bottom);
  const sampleIndex = (sampleY * width + sampleX) * 4;
  const backgroundIndex = data[sampleIndex + 3] === 255 ? sampleIndex : firstOpaqueIndex;

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      const sourceIndex = (y * width + x) * 4;
      const targetIndex = ((y - top) * cropped.width + (x - left)) * 4;
      const opacity = data[sourceIndex + 3] / 255;
      for (let channel = 0; channel < 3; channel += 1) {
        cropped.data[targetIndex + channel] = Math.round(
          data[sourceIndex + channel] * opacity + data[backgroundIndex + channel] * (1 - opacity),
        );
      }
      cropped.data[targetIndex + 3] = 255;
    }
  }

  return PNG.sync.write(cropped);
}
