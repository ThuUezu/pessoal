#!/usr/bin/env python3
"""Gera ícones do PWA e telas de abertura (splash) do iOS. Uso: npm run icons  (precisa de Pillow)."""
import math
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)
BLUE = (30, 64, 175)       # #1e40af
SKY = (238, 244, 255)      # #eef4ff
WHITE = (255, 255, 255)
SS = 4                     # supersampling para bordas suaves


def heart_points(cx, cy, size):
    pts = []
    for i in range(361):
        t = math.radians(i)
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((cx + x * size / 34, cy + y * size / 34 + size * 0.02))
    return pts


def icon(size, bg=BLUE, heart=WHITE, heart_ratio=0.5, radius_ratio=0.0, transparent_corners=False):
    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0) if transparent_corners else bg + (255,))
    d = ImageDraw.Draw(img)
    if transparent_corners:
        d.rounded_rectangle([0, 0, big - 1, big - 1], radius=int(big * radius_ratio), fill=bg + (255,))
    d.polygon(heart_points(big / 2, big / 2, big * heart_ratio), fill=heart + (255,))
    return img.resize((size, size), Image.LANCZOS)


def save(img, name):
    img.save(OUT / name, optimize=True)


save(icon(180), "apple-touch-icon.png")                                              # iOS arredonda sozinho
save(icon(64, radius_ratio=0.22, transparent_corners=True), "favicon.png")
save(icon(192, radius_ratio=0.22, transparent_corners=True), "pwa-192.png")
save(icon(512, radius_ratio=0.22, transparent_corners=True), "pwa-512.png")
save(icon(512, heart_ratio=0.40), "maskable-512.png")                                # coração na zona segura

# Telas de abertura: fundo azul-claro do app + ícone no centro (iOS ignora o background_color do manifesto).
SPLASH = [  # (px_w, px_h, css_w, css_h, dpr)
    (750, 1334, 375, 667, 2), (1242, 2208, 414, 736, 3), (1125, 2436, 375, 812, 3),
    (828, 1792, 414, 896, 2), (1242, 2688, 414, 896, 3), (1170, 2532, 390, 844, 3),
    (1284, 2778, 428, 926, 3), (1179, 2556, 393, 852, 3), (1290, 2796, 430, 932, 3),
]
links = []
for w, h, cw, ch, dpr in SPLASH:
    canvas = Image.new("RGB", (w, h), SKY)
    side = int(min(w, h) * 0.26)
    logo = icon(side, radius_ratio=0.22, transparent_corners=True)
    canvas.paste(logo, ((w - side) // 2, (h - side) // 2), logo)
    name = f"splash-{w}x{h}.png"
    canvas.save(OUT / name, optimize=True)
    media = f"(device-width: {cw}px) and (device-height: {ch}px) and (-webkit-device-pixel-ratio: {dpr}) and (orientation: portrait)"
    links.append(f'    <link rel="apple-touch-startup-image" media="{media}" href="/icons/{name}" />')

(OUT.parent.parent / "scripts" / "splash-links.html").write_text("\n".join(links) + "\n", encoding="utf-8")
print("ok:", len(list(OUT.glob("*.png"))), "imagens")
