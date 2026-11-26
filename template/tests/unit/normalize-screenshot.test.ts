import { describe, expect, it } from 'vitest';
import { PNG } from 'pngjs';
import { makeWindowScreenshotOpaque } from '../visual/normalize-screenshot';

describe('WinApp screenshot normalization', () => {
  it('removes transparent padding and composites rounded window corners', () => {
    const image = new PNG({ width: 5, height: 5 });
    for (let y = 1; y <= 3; y += 1) {
      for (let x = 1; x <= 3; x += 1) {
        const index = (y * image.width + x) * 4;
        image.data.set([24, 36, 48, 255], index);
      }
    }
    // Simulate a rounded corner with partial alpha inside the window rectangle.
    image.data.set([24, 36, 48, 128], (1 * image.width + 1) * 4);

    const result = PNG.sync.read(makeWindowScreenshotOpaque(PNG.sync.write(image)));

    expect([result.width, result.height]).toEqual([3, 3]);
    expect(result.data.every((value, index) => index % 4 !== 3 || value === 255)).toBe(true);
    expect([...result.data.subarray(0, 4)]).toEqual([24, 36, 48, 255]);
  });

  it('rejects an entirely transparent capture', () => {
    const image = new PNG({ width: 2, height: 2 });
    expect(() => makeWindowScreenshotOpaque(PNG.sync.write(image))).toThrow(
      'no fully opaque window pixels',
    );
  });
});
