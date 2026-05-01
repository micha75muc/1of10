"""Generate the new 1of10 logo PNG assets matching the inline SVG design.

Outputs into apps/web/public/ + apps/web/app/favicon.ico:
- favicon.ico (16/32/48 multi-size)
- apple-touch-icon.png (180)
- icon-192.png, icon-512.png
- logo-icon.png (square 512)
- og-image.png (1200x630)
- logo.png (1200 wide pill on transparent)
"""

from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "apps" / "web" / "public"
APP = ROOT / "apps" / "web" / "app"

FONT_PATH = "C:/Windows/Fonts/seguibl.ttf"  # Segoe UI Black

NAVY = (10, 42, 108)        # "1"
INK = (10, 10, 10)          # "of 10"
PILL_TOP = (255, 255, 255)
PILL_MID = (244, 246, 250)
PILL_BOT = (226, 231, 240)
DISC_TOP = (255, 255, 255)
DISC_MID = (247, 249, 252)
DISC_BOT = (221, 227, 238)
DISC_EDGE = (223, 229, 239)


def vgrad(size, top, bot, mid=None):
    """Vertical gradient. Optional mid colour at 55%."""
    w, h = size
    img = Image.new("RGB", size, top)
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        if mid is not None and t < 0.55:
            k = t / 0.55
            r = int(top[0] + (mid[0] - top[0]) * k)
            g = int(top[1] + (mid[1] - top[1]) * k)
            b = int(top[2] + (mid[2] - top[2]) * k)
        elif mid is not None:
            k = (t - 0.55) / 0.45
            r = int(mid[0] + (bot[0] - mid[0]) * k)
            g = int(mid[1] + (bot[1] - mid[1]) * k)
            b = int(mid[2] + (bot[2] - mid[2]) * k)
        else:
            r = int(top[0] + (bot[0] - top[0]) * t)
            g = int(top[1] + (bot[1] - top[1]) * t)
            b = int(top[2] + (bot[2] - top[2]) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img


def radial_disc(size, top, mid, bot, edge=None):
    """Radial gradient disc with optional edge stroke. Returns RGBA."""
    s = size
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    px = img.load()
    cx, cy = s / 2, s * 0.38
    rmax = s * 0.62
    rdisc = s / 2 - 2
    for y in range(s):
        for x in range(s):
            dx, dy = x - s / 2, y - s / 2
            d = (dx * dx + dy * dy) ** 0.5
            if d > rdisc:
                continue
            dr = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            t = min(dr / rmax, 1.0)
            if t < 0.78:
                k = t / 0.78
                r = int(top[0] + (mid[0] - top[0]) * k)
                g = int(top[1] + (mid[1] - top[1]) * k)
                b = int(top[2] + (mid[2] - top[2]) * k)
            else:
                k = (t - 0.78) / 0.22
                r = int(mid[0] + (bot[0] - mid[0]) * k)
                g = int(mid[1] + (bot[1] - mid[1]) * k)
                b = int(mid[2] + (bot[2] - mid[2]) * k)
            px[x, y] = (r, g, b, 255)
    if edge is not None:
        d = ImageDraw.Draw(img)
        d.ellipse((1, 1, s - 2, s - 2), outline=edge, width=2)
    return img


def drop_shadow(mask_alpha, dx, dy, blur, opacity, canvas_size):
    """Build a soft drop shadow layer from a binary alpha mask."""
    sh = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    layer = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    layer.paste((10, 31, 92, int(255 * opacity)), (dx, dy), mask_alpha)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    sh.alpha_composite(layer)
    return sh


def fit_font(text, target_w, max_h):
    """Find the largest font that fits within target_w (and max_h)."""
    lo, hi = 10, max_h
    while lo < hi:
        mid = (lo + hi + 1) // 2
        f = ImageFont.truetype(FONT_PATH, mid)
        bbox = f.getbbox(text)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        if w <= target_w and h <= max_h:
            lo = mid
        else:
            hi = mid - 1
    return ImageFont.truetype(FONT_PATH, lo)


def render_pill(width, height, transparent_bg=True):
    """Render the full pill logo at given pixel dimensions. Returns RGBA."""
    # Render at 3x for crispness then downsample.
    scale = 3
    W, H = width * scale, height * scale
    margin = int(H * 0.03)
    pill_w = W - 2 * margin
    pill_h = H - 2 * margin
    rx = pill_h // 2

    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0) if transparent_bg else (255, 255, 255, 255))

    # Pill mask
    pill_mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(pill_mask)
    md.rounded_rectangle((margin, margin, margin + pill_w, margin + pill_h), radius=rx, fill=255)

    # Drop shadow
    shadow = drop_shadow(pill_mask, dx=0, dy=int(8 * scale / 2), blur=int(14 * scale / 2), opacity=0.10, canvas_size=(W, H))
    canvas.alpha_composite(shadow)

    # Pill fill (vertical gradient)
    grad = vgrad((pill_w, pill_h), PILL_TOP, PILL_BOT, PILL_MID).convert("RGBA")
    fill_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fill_layer.paste(grad, (margin, margin))
    # mask to pill shape
    fill_masked = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fill_masked.paste(fill_layer, (0, 0), pill_mask)
    canvas.alpha_composite(fill_masked)

    # Outer white edge stroke (ring)
    edge = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ed = ImageDraw.Draw(edge)
    sw = max(2, int(3 * scale))
    ed.rounded_rectangle((margin, margin, margin + pill_w, margin + pill_h), radius=rx, outline=(255, 255, 255, 255), width=sw)
    canvas.alpha_composite(edge)

    # Inner highlight ring (subtle)
    inner_pad = int(8 * scale)
    inner = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    idr = ImageDraw.Draw(inner)
    idr.rounded_rectangle(
        (margin + inner_pad, margin + inner_pad, margin + pill_w - inner_pad, margin + pill_h - inner_pad),
        radius=rx - inner_pad, outline=(255, 255, 255, 178), width=max(1, int(1.5 * scale))
    )
    canvas.alpha_composite(inner)

    # Inner disc
    disc_d = int(pill_h * 0.80)
    disc_x = margin + int(pill_h * 0.12)
    disc_y = margin + (pill_h - disc_d) // 2
    disc = radial_disc(disc_d, DISC_TOP, DISC_MID, DISC_BOT, edge=DISC_EDGE)
    # disc shadow
    disc_mask = disc.split()[3]
    sh = drop_shadow(disc_mask, dx=0, dy=int(3 * scale), blur=int(6 * scale), opacity=0.18, canvas_size=(disc_d, disc_d))
    sh_canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sh_canvas.paste(sh, (disc_x, disc_y), sh)
    canvas.alpha_composite(sh_canvas)
    canvas.alpha_composite(disc, (disc_x, disc_y))

    # "1" centered in disc
    one_size = int(disc_d * 0.78)
    one_font = ImageFont.truetype(FONT_PATH, one_size)
    text_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    td = ImageDraw.Draw(text_layer)
    bbox = one_font.getbbox("1")
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    one_x = disc_x + (disc_d - tw) // 2 - bbox[0]
    one_y = disc_y + (disc_d - th) // 2 - bbox[1]
    td.text((one_x, one_y), "1", font=one_font, fill=NAVY)
    canvas.alpha_composite(text_layer)

    # "of 10" wordmark
    text_x = disc_x + disc_d + int(pill_h * 0.10)
    text_max_w = (margin + pill_w) - text_x - int(pill_h * 0.18)
    text_max_h = int(pill_h * 0.62)
    of10_font = fit_font("of 10", text_max_w, text_max_h)
    text2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    td2 = ImageDraw.Draw(text2)
    bbox2 = of10_font.getbbox("of 10")
    tw2 = bbox2[2] - bbox2[0]
    th2 = bbox2[3] - bbox2[1]
    of_y = margin + (pill_h - th2) // 2 - bbox2[1]
    td2.text((text_x, of_y), "of 10", font=of10_font, fill=INK)
    canvas.alpha_composite(text2)

    # Downsample
    return canvas.resize((width, height), Image.LANCZOS)


def render_disc(size, transparent_bg=True):
    """Square icon: just the raised disc with a navy '1'."""
    scale = 3
    S = size * scale
    canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0) if transparent_bg else (255, 255, 255, 255))

    pad = int(S * 0.06)
    disc_d = S - 2 * pad

    disc = radial_disc(disc_d, DISC_TOP, DISC_MID, DISC_BOT, edge=DISC_EDGE)
    # shadow
    disc_mask = disc.split()[3]
    sh = drop_shadow(disc_mask, dx=0, dy=int(6 * scale / 2), blur=int(10 * scale / 2), opacity=0.20, canvas_size=(disc_d, disc_d))
    sh_canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sh_canvas.paste(sh, (pad, pad), sh)
    canvas.alpha_composite(sh_canvas)
    canvas.alpha_composite(disc, (pad, pad))

    one_font = ImageFont.truetype(FONT_PATH, int(disc_d * 0.72))
    bbox = one_font.getbbox("1")
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    one_x = pad + (disc_d - tw) // 2 - bbox[0]
    one_y = pad + (disc_d - th) // 2 - bbox[1]
    text_layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    td = ImageDraw.Draw(text_layer)
    td.text((one_x, one_y), "1", font=one_font, fill=NAVY)
    canvas.alpha_composite(text_layer)

    return canvas.resize((size, size), Image.LANCZOS)


def main():
    print("Rendering disc icons…")
    disc_512 = render_disc(512)
    disc_192 = render_disc(192)
    disc_180 = render_disc(180)
    disc_48 = render_disc(48)
    disc_32 = render_disc(32)
    disc_16 = render_disc(16)

    disc_512.save(PUBLIC / "icon-512.png", optimize=True)
    disc_192.save(PUBLIC / "icon-192.png", optimize=True)
    disc_180.save(PUBLIC / "apple-touch-icon.png", optimize=True)
    disc_512.save(PUBLIC / "logo-icon.png", optimize=True)

    # ICO with multiple sizes
    disc_48.save(APP / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print("favicon.ico (multi-size) written")

    print("Rendering pill (logo.png 1200x437)…")
    pill_logo = render_pill(1200, 437)  # 2.75:1 aspect
    pill_logo.save(PUBLIC / "logo.png", optimize=True)

    print("Rendering OG image (1200x630)…")
    og_w, og_h = 1200, 630
    og = Image.new("RGBA", (og_w, og_h), (255, 255, 255, 255))
    pill_w_og = 920
    pill_h_og = int(pill_w_og / 2.75)
    pill = render_pill(pill_w_og, pill_h_og)
    og.alpha_composite(pill, ((og_w - pill_w_og) // 2, (og_h - pill_h_og) // 2 - 30))

    # Tagline
    sub_font = ImageFont.truetype("C:/Windows/Fonts/seguisb.ttf", 28)
    sd = ImageDraw.Draw(og)
    tag = "Wir erstatten jeden 10. Kauf"
    bb = sub_font.getbbox(tag)
    tx = (og_w - (bb[2] - bb[0])) // 2
    ty = (og_h + pill_h_og) // 2 + 20
    sd.text((tx, ty), tag, font=sub_font, fill=(80, 80, 80))
    og.convert("RGB").save(PUBLIC / "og-image.png", optimize=True)

    print("Done.")


if __name__ == "__main__":
    main()
