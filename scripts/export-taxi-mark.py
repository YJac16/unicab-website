"""Crop the UNICAB taxi mark from the charters lockup and export icons.

The source lockup includes a gold CHARTERS line and side rules. This taxi
export keeps only the UNICAB wordmark and its orbit ring, in one colour,
on a transparent background. The orbit is never cropped.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

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


def compact_mark(size: int, ink=(20, 20, 20, 255), background=None) -> Image.Image:
    """Orbit ring, dot, and a U. Drawn, not cropped from the wide wordmark."""
    image = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    stroke = max(1, round(size * 0.07))
    pad = size * 0.18
    box = [pad, pad, size - pad - 1, size - pad - 1]
    draw.ellipse(box, outline=ink, width=stroke)
    cx = size / 2
    cy = size / 2
    radius = (size - 2 * pad) / 2
    dot = max(1, stroke * 0.72)
    top = cy - radius
    draw.ellipse([cx - dot, top - dot, cx + dot, top + dot], fill=ink)
    arm = radius * 0.46
    left = cx - arm
    right = cx + arm
    crown = cy - radius * 0.28
    bowl = cy + radius * 0.38
    draw.line([(left, crown), (left, cy)], fill=ink, width=stroke)
    draw.line([(right, crown), (right, cy)], fill=ink, width=stroke)
    draw.arc([left, cy - (bowl - cy), right, bowl], start=0, end=180, fill=ink, width=stroke)
    return image


def main() -> None:
    black = wordmark_crop(BRAND / "source-charters-black.png")
    white = wordmark_crop(BRAND / "source-charters-white.png")
    black.save(PUBLIC / "logo-black.png", "PNG", optimize=True)
    white.save(PUBLIC / "logo-white.png", "PNG", optimize=True)
    black.save(BRAND / "unicab-taxi-mark-black.png", "PNG", optimize=True)
    white.save(BRAND / "unicab-taxi-mark-white.png", "PNG", optimize=True)

    icons = {size: compact_mark(size) for size in (16, 32, 48)}
    icons[16].save(PUBLIC / "favicon-16.png", "PNG", optimize=True)
    icons[32].save(PUBLIC / "favicon-32.png", "PNG", optimize=True)
    icons[32].save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[icons[16], icons[48]],
    )
    paper = (243, 239, 230, 255)
    compact_mark(180, background=paper).save(PUBLIC / "apple-touch-icon.png", "PNG", optimize=True)
    compact_mark(192, background=paper).save(PUBLIC / "icon-192.png", "PNG", optimize=True)
    compact_mark(512, background=paper).save(PUBLIC / "icon-512.png", "PNG", optimize=True)
    print(f"taxi mark {black.size[0]}x{black.size[1]}")


if __name__ == "__main__":
    main()
