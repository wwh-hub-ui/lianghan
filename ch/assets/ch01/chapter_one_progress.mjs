export function chapterProgressAtScroll(scrollY, articleStart, beatStarts, transitionFraction = 0.28) {
  const y = Number(scrollY);
  const articleTop = Number(articleStart);
  const anchors = Array.isArray(beatStarts) ? beatStarts.map(Number) : [];
  const transition = Number(transitionFraction);

  if (!Number.isFinite(y) || !Number.isFinite(articleTop) || anchors.length === 0 || anchors.some((value) => !Number.isFinite(value))) {
    throw new TypeError("scroll positions and at least one beat anchor must be finite numbers");
  }
  if (anchors.some((value, index) => index > 0 && value <= anchors[index - 1])) {
    throw new RangeError("beat anchors must be strictly increasing");
  }
  if (!Number.isFinite(transition) || transition <= 0 || transition >= 1) {
    throw new RangeError("transitionFraction must be greater than 0 and less than 1");
  }

  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  let captionIndex = 0;
  for (let index = 0; index < anchors.length; index += 1) {
    if (y >= anchors[index]) captionIndex = index;
    else break;
  }

  if (y < anchors[0]) {
    const introLength = anchors[0] - articleTop;
    const progress = introLength > 0 ? clamp01((y - articleTop) / introLength) : 1;
    return { progress, captionIndex: 0 };
  }

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const start = anchors[index];
    const end = anchors[index + 1];
    if (y < end) {
      const transitionStart = end - (end - start) * transition;
      if (y <= transitionStart) return { progress: index + 1, captionIndex: index };
      const local = clamp01((y - transitionStart) / (end - transitionStart));
      return { progress: index + 1 + local, captionIndex: index };
    }
  }

  return { progress: anchors.length, captionIndex: anchors.length - 1 };
}
