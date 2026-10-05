"""Prepare immutable wedding sources as small, metadata-free web derivatives.

Run with the video-review Python environment (Pillow, fonttools[woff] and imageio-ffmpeg installed).
Source files stay in the private notes wiki; only selected derivatives enter the site.
"""
from pathlib import Path
import argparse
import json
import re
import subprocess
import tempfile
import urllib.request

from PIL import Image, ImageOps
import imageio_ffmpeg
from fontTools.ttLib import TTFont

REPO = Path(__file__).resolve().parents[1]

OUT = REPO / 'invite/assets'
PHOTO_SOURCES = {
    'together': 'IMG_2281 Copy.JPG',
    'school': 'IMG_3709.JPG',
    'young': 'IMG_2294.JPG',
    'ordinary': 'IMG_5982.HEIC',
    'embrace': 'IMG_9617.HEIC',
    'japan': 'IMG_1548.JPG',
    'blossoms': 'IMG_9415.JPG',
    'city-lights': 'IMG_1321.HEIC',
    'fuji': 'IMG_9963.HEIC',
    'picnic': 'IMG_8464.JPG',
    'laughter': 'IMG_9627.HEIC',
    'home': 'IMG_6208.HEIC',
    'lake': 'IMG_9684.JPG',
    'early-night': 'IMG_20160608_204247908.jpg',
    'early-blue': 'IMG-20150723-WA0006.jpg',
    'mumbai-evening': 'IMG_3107.HEIC',
    'mumbai-cafe': 'IMG_3115.HEIC',
    'mumbai-quiet': 'IMG_6988.HEIC',
    'japan-night': 'IMG_1524.JPG',
    'fairy-lights': 'IMG_8711.HEIC',
    'lanterns': 'IMG_9105.HEIC',
    'proposal-photo': 'proposal-photo-2026-10-04.png',
}

RESTORED_PHOTOS = {
    'proposal-restored-v2': REPO / 'source-assets/proposal/proposal-restored-v2.png',
}


def web_images(image, slug, widths=(480, 960, 1440)):
    image = ImageOps.exif_transpose(image).convert('RGB')
    for width in widths:
        frame = image.copy()
        frame.thumbnail((width, width * 2))
        frame.save(OUT / 'photos' / f'{slug}-{width}.webp', quality=86, method=6)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--wiki', type=Path, required=True, help='Private wedding wiki containing invite-images and invite-videos')
    parser.add_argument('--only', nargs='+', help='Rebuild selected asset slugs, or fonts; leave unset for a full build')
    args = parser.parse_args()
    wiki = args.wiki
    selected = set(args.only) if args.only else None
    for name in ('photos', 'motion', 'fonts'):
        (OUT / name).mkdir(parents=True, exist_ok=True)
    manifest_path = OUT / 'manifest.json'
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    with tempfile.TemporaryDirectory(prefix='invite-assets-') as temp:
        for slug, filename in PHOTO_SOURCES.items():
            if selected is not None and slug not in selected:
                continue
            source = wiki / 'invite-images' / filename
            image_path = source
            if source.suffix.lower() == '.heic':
                image_path = Path(temp) / f'{slug}.jpg'
                subprocess.run(['sips', '-s', 'format', 'jpeg', str(source), '--out', str(image_path)], capture_output=True, check=True)
            with Image.open(image_path) as image:
                web_images(image, slug)
            manifest[slug] = {'source': filename, 'kind': 'photograph'}

        for slug, source in RESTORED_PHOTOS.items():
            if selected is not None and slug not in selected:
                continue
            with Image.open(source) as image:
                web_images(image, slug, widths=(480, 960))
            manifest[slug] = {
                'source': 'IMG_1326.MOV',
                'kind': 'AI-assisted lighting restoration / extracted still',
                'frame_time': 235.0,
                'restoration_source': str(source.relative_to(REPO)),
                'provenance': 'source-assets/proposal/README.md',
                'orientation': 'upright; source display rotation applied',
            }

        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        # HLG -> linear light -> tone map -> BT.709. Public excerpts contain no audio.
        tone = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p'
        clips = [
            ('garden', wiki / 'invite-images/IMG_8779.MOV', 2.1, 3.8, 4.0, None),
            ('our-song', wiki / 'invite-videos/20d7242538cf4d08a34d38db5112a987.mp4', 64.0, 3.8, 69.8, 'crop=1080:1360:0:140'),
            ('her-umbrella', wiki / 'invite-videos/IMG_0568.MOV', 2.1, 2.8, 3.5, None),
            ('his-umbrella', wiki / 'invite-videos/WhatsApp Video 2026-10-04 at 18.09.49.mp4', 6.8, 4.0, 9.9, None),
            ('another-song', wiki / 'invite-videos/FDB14FDE-65F3-40BB-9B09-234843B65FDC.mp4', 2.4, 3.8, 5.7, 'crop=960:800:120:890'),
        ]
        for slug, source, start, duration, poster_time, crop in clips:
            if selected is not None and slug not in selected:
                continue
            filters = [] if slug == 'his-umbrella' else [tone]
            if crop:
                filters.append(crop)
            filters.append('scale=640:-2')
            vf = ','.join(filters)
            base = [ffmpeg, '-hide_banner', '-loglevel', 'error']
            subprocess.run(base + ['-ss', str(start), '-i', str(source), '-t', str(duration), '-vf', vf,
                '-map', '0:v:0', '-an', '-map_metadata', '-1', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-r', '24',
                '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', str(OUT / 'motion' / f'{slug}.mp4')], check=True)
            poster = Path(temp) / f'{slug}.jpg'
            subprocess.run(base + ['-ss', str(poster_time), '-i', str(source), '-frames:v', '1', '-vf', vf,
                '-map_metadata', '-1', '-y', str(poster)], check=True)
            with Image.open(poster) as image:
                web_images(image, slug)
            manifest[slug] = {'source': source.name, 'kind': 'silent excerpt / extracted still', 'start': start, 'duration': duration, 'poster_time': poster_time, 'crop_filters': crop, 'orientation': 'source display rotation applied'}

    if selected is None or 'fonts' in selected:
        # Self-host Google Fonts; preserve their upstream license in the project.
        css = (REPO / 'scripts/invite-fonts-upstream.css').read_text()
        faces = []
        for block in re.findall(r'@font-face\s*\{[^}]+\}', css):
            family = re.search(r"font-family: '([^']+)'", block)[1]
            weight = re.search(r'font-weight: ([^;]+)', block)[1]
            style = re.search(r'font-style: ([^;]+)', block)[1]
            url = re.search(r'url\(([^)]+)\)', block)[1]
            filename = f'{family.lower().replace(" ", "-")}-{weight}-{style}.ttf'
            urllib.request.urlretrieve(url, OUT / 'fonts' / filename)
            font = TTFont(OUT / 'fonts' / filename)
            font.flavor = 'woff2'
            web_filename = filename.replace('.ttf', '.woff2')
            font.save(OUT / 'fonts' / web_filename)
            faces.append(block.replace(url, f'./{web_filename}').replace("format('truetype')", "format('woff2')"))
        (OUT / 'fonts/fonts.css').write_text('\n'.join(faces) + '\n')
        for directory in ['cormorantgaramond', 'manrope', 'allura']:
            urllib.request.urlretrieve(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{directory}/OFL.txt', OUT / 'fonts' / f'{directory}-OFL.txt')
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Prepared {len(manifest)} selected assets in {OUT}')


if __name__ == '__main__':
    main()
