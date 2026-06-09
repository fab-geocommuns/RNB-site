from PIL import Image, ImageDraw

S = 8
TILE = 12
size = TILE * S

img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

def hex_to_rgba(h):
    h = h.lstrip("#")
    if len(h) == 6:
        h += "ff"
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4, 6))

green = hex_to_rgba("#3b8e17")

lw = int(1.4 * S)

pts = [
    (0.22, 0.52),
    (0.42, 0.72),
    (0.78, 0.30),
]
abs_pts = [(x*size, y*size) for x, y in pts]
d.line(abs_pts, fill=green, width=lw, joint="curve")
r = lw/2
for (x, y) in abs_pts:
    d.ellipse([x-r, y-r, x+r, y+r], fill=green)

img = img.resize((TILE, TILE), Image.LANCZOS)
img.save("public/images/map/check-green-2.png")
print("saved", img.size)
