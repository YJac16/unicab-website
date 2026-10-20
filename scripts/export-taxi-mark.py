"""Crop the UNICAB taxi mark from the charters lockup and export icons.

The source lockup includes a gold CHARTERS line and side rules. This taxi
export keeps only the UNICAB wordmark and its orbit ring, in one colour,
on a transparent background. The orbit is never cropped.
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "brand"
PUBLIC = ROOT / "public"
INK = (14, 14, 14, 255)


def wordmark_crop(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    alpha = np.array(image)[:, :, 3]
    row_has = (alpha > 16).any(axis=1)
    runs = []
    start = None
    for index, filled in enumerate(row_has):
        if filled and start is None:
            start = index
        elif not filled and start is not None:
            runs.append((start, index - 1))
            start = None
    if start is not None:
        runs.append((start, len(row_has) - 1))
    if len(runs) < 2:
        raise SystemExit(f"expected wordmark and CHARTERS runs, got {runs}")

    y0, y1 = runs[0]
    gap = runs[1][0] - y1
    if gap < 40:
        raise SystemExit(f"gap above CHARTERS is too small to crop safely: {gap}")

    cols = np.where((alpha[y0 : y1 + 1] > 16).any(axis=0))[0]
    x0, x1 = int(cols[0]), int(cols[-1])
    pad_x, pad_y = 28, 22
    box = (
        max(0, x0 - pad_x),
        max(0, y0 - pad_y),
        min(image.width, x1 + pad_x + 1),
        y1 + min(pad_y, gap // 3) + 1,
    )
    cropped = image.crop(box)
    arr = np.array(cropped)
    rgb = arr[:, :, :3].astype(int)
    red, green, blue = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    gold = (arr[:, :, 3] > 40) & (red > green + 12) & (green > blue + 8) & (red > 70)
    if gold.any():
        raise SystemExit(f"gold CHARTERS pixels remain in {path.name}")
    return cropped


def contain(mark: Image.Image, canvas, background=None) -> Image.Image:
    width, height = canvas
    margin = 0.08
    max_w = width * (1 - margin * 2)
    max_h = height * (1 - margin * 2)
    scale = min(max_w / mark.width, max_h / mark.height)
    resized = mark.resize(
        (max(1, int(mark.width * scale)), max(1, int(mark.height * scale))),
        Image.Resampling.LANCZOS,
    )
    plate = Image.new("RGBA", canvas, background or (0, 0, 0, 0))
    plate.alpha_composite(
        resized,
        ((width - resized.width) // 2, (height - resized.height) // 2),
    )
    return plate


def main() -> None:
    black = wordmark_crop(BRAND / "source-charters-black.png")
    white = wordmark_crop(BRAND / "source-charters-white.png")
    black.save(PUBLIC / "logo-black.png", "PNG", optimize=True)
    white.save(PUBLIC / "logo-white.png", "PNG", optimize=True)
    black.save(BRAND / "unicab-taxi-mark-black.png", "PNG", optimize=True)
    white.save(BRAND / "unicab-taxi-mark-white.png", "PNG", optimize=True)

    icons = {size: contain(black, (size, size)) for size in (16, 32, 48)}
    icons[16].save(PUBLIC / "favicon-16.png", "PNG", optimize=True)
    icons[32].save(PUBLIC / "favicon-32.png", "PNG", optimize=True)
    icons[32].save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[icons[16], icons[48]],
    )
    contain(white, (180, 180), INK).save(PUBLIC / "apple-touch-icon.png", "PNG", optimize=True)
    contain(white, (192, 192), INK).save(PUBLIC / "icon-192.png", "PNG", optimize=True)
    contain(white, (512, 512), INK).save(PUBLIC / "icon-512.png", "PNG", optimize=True)
    print(f"taxi mark {black.size[0]}x{black.size[1]}")


if __name__ == "__main__":
    main()
