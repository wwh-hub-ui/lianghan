export function particleTargetFromMask(rgba, width, height, count, salt = 0) {
  const w = Number(width);
  const h = Number(height);
  const pointCount = Number(count);
  if (!ArrayBuffer.isView(rgba) || !Number.isInteger(w) || !Number.isInteger(h) || w < 2 || h < 2 || rgba.length < w * h * 4) {
    throw new TypeError("rgba must contain a complete width × height image mask");
  }
  if (!Number.isInteger(pointCount) || pointCount < 1) {
    throw new RangeError("count must be a positive integer");
  }

  const visiblePixels = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (rgba[(y * w + x) * 4 + 3] > 48) visiblePixels.push(x, y);
    }
  }
  if (visiblePixels.length === 0) {
    throw new Error("mask contains no visible pixels");
  }

  function random(index, offset) {
    const value = Math.sin((index + 1) * 12.9898 + (Number(salt) + offset) * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  const target = new Float32Array(pointCount * 3);
  const sampleCount = visiblePixels.length / 2;
  for (let index = 0; index < pointCount; index += 1) {
    const sample = Math.min(sampleCount - 1, Math.floor(random(index, 1) * sampleCount));
    const x = visiblePixels[sample * 2];
    const y = visiblePixels[sample * 2 + 1];
    const offset = index * 3;
    target[offset] = (x / (w - 1) - 0.5) * 5.2;
    // Reserve the center of the stage for the readable scene caption.
    target[offset + 1] = 1.0 + (0.5 - y / (h - 1)) * 1.8;
    target[offset + 2] = (random(index, 2) - 0.5) * 0.12;
  }
  return target;
}
