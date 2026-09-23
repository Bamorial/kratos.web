"""Persist exact Figma exports; the signed source URLs expire after seven days."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import re
import subprocess

root = Path(__file__).resolve().parents[1]
destination = root / 'public' / 'images'
destination.mkdir(parents=True, exist_ok=True)
assets = {}
for reference in (root / 'design').glob('*-reference.txt'):
    source = reference.read_text()
    prefix = re.search(r'const assetPathPrefix = "([^"]+)"', source)
    if prefix:
        for filename in re.findall(r'\$\{assetPathPrefix\}/([a-zA-Z0-9_-]+\.(?:png|svg|jpg|webp))', source):
            assets[filename] = prefix[1] + '/' + filename

def download(item):
    filename, url = item
    target = destination / filename
    if not target.exists():
        subprocess.run(['curl', '-fLsS', '--max-time', '60', '--retry', '2', url, '-o', str(target)], check=True)
    return filename

with ThreadPoolExecutor(max_workers=6) as pool:
    print('Downloaded', len(list(pool.map(download, assets.items()))), 'Figma assets')
(root / 'design' / 'assets.json').write_text(json.dumps(assets, indent=2) + '\n')
