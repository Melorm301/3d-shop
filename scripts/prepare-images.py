"""Create responsive derivatives without changing the existing originals."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
images = {}
for path in (ROOT / 'images/products').glob('*.webp'):
    if path.stem.endswith(('-480', '-960')):
        continue
    with Image.open(path) as original:
        width, height = original.size
        sources = []
        for size in (480, 960):
            if width <= size:
                continue
            output = path.with_name(f'{path.stem}-{size}.webp')
            original.resize((size, round(height * size / width)), Image.Resampling.LANCZOS).save(output, quality=80, method=6)
            sources.append({'src': str(output.relative_to(ROOT)), 'width': size})
        sources.append({'src': str(path.relative_to(ROOT)), 'width': width})
        images[str(path.relative_to(ROOT))] = {'width': width, 'height': height, 'sources': sources}
(ROOT / 'js/image-data.js').write_text('/* Dimensions and responsive derivatives of existing product assets. */\nwindow.NordFormImages = ' + json.dumps(images, separators=(',', ':')) + ';\n')
print('Responsive product images and manifest updated.')
