"""Render public content once, so visitors need no framework, API or build tool."""
import argparse
import html
import json
import re
import shutil
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {'NAME','HANDLE','HOME_URL','GITHUB_URL','BILIBILI_URL','MUSIC_REPO','MUSIC_DOWNLOAD','PLUGIN_REPO','PLUGIN_DOCS'}

def render():
    data = json.loads((ROOT / 'site.json').read_text(encoding='utf-8'))
    if set(data) != EXPECTED or any(not isinstance(v,str) or not v.strip() for v in data.values()):
        raise ValueError('site.json has missing, extra or empty public fields')
    for key, value in data.items():
        if key not in {'NAME','HANDLE'}:
            u = urlparse(value)
            if u.scheme != 'https' or u.hostname not in {'github.com','space.bilibili.com','qcya.github.io'} or u.username or u.password:
                raise ValueError(f'Unexpected public link: {key}')
    template = (ROOT / 'src/index.html').read_text(encoding='utf-8')
    def replace(match):
        return html.escape(data[match[1]], quote=True)
    return re.sub(r'\{\{([A-Z_]+)\}\}', replace, template)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='Fail if committed HTML is stale')
    parser.add_argument('--out', type=Path, help='Optional clean static publication folder')
    args = parser.parse_args()
    content = render()
    target = ROOT / 'index.html'
    if args.check:
        if not target.exists() or target.read_text(encoding='utf-8') != content:
            raise SystemExit('index.html is stale; run python scripts/build.py')
    else:
        target.write_text(content, encoding='utf-8', newline='\n')
    if args.out:
        out = args.out.resolve()
        if out == ROOT or out in ROOT.parents:
            raise SystemExit('Output must not replace the repository or its parents')
        out.mkdir(parents=True, exist_ok=True)
        (out/'index.html').write_text(content, encoding='utf-8', newline='\n')
        (out/'.nojekyll').touch()
        assets = out/'qcya_ovo/assets'
        assets.mkdir(parents=True,exist_ok=True)
        for name in ['site.css','site.js','theme.js','avatar.webp','favicon.svg','share.png']:
            shutil.copy2(ROOT/'qcya_ovo/assets'/name, assets/name)
        for name in ['qcya_ovo/index.html','qcya_ovo/contact.html','qcya_ovo/qcya_ovo/index.html','qcya_ovo/qcya_ovo/contact.html']:
            source=ROOT/name
            if source.exists():
                destination=out/name
                destination.parent.mkdir(parents=True,exist_ok=True)
                shutil.copy2(source,destination)
    print('Static HTML verified' if args.check else 'Static HTML generated')

if __name__ == '__main__':
    main()
