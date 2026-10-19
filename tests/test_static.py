"""Static invariants: identity, public links, generated HTML and local assets."""
import importlib.util
import json
import re
import struct
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Elements(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.elements=[]; self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.elements.append((tag,dict(attrs)))

def test_generated_html_matches_single_source():
    spec=importlib.util.spec_from_file_location('build', ROOT/'scripts/build.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    assert (ROOT/'index.html').read_text(encoding='utf-8')==module.render()

def test_assets_and_anchors():
    elements=Elements((ROOT/'index.html').read_text(encoding='utf-8')).elements
    ids=[a['id'] for _,a in elements if 'id' in a]
    assert len(ids)==len(set(ids))
    for tag, attrs in elements:
        if tag not in {'link','script','img','a'}: continue
        value=attrs.get('src',attrs.get('href',''))
        if value.startswith('#'): assert value[1:] in ids
        elif value and not urlsplit(value).scheme:
            assert (ROOT/urlsplit(value).path).is_file(),value

def test_only_curated_public_projects():
    elements=Elements((ROOT/'index.html').read_text(encoding='utf-8')).elements
    urls={a['href'] for tag,a in elements if tag=='a' and a.get('href','').startswith('https:')}
    config=json.loads((ROOT/'site.json').read_text(encoding='utf-8'))
    expected={config[k] for k in ['GITHUB_URL','BILIBILI_URL','MUSIC_REPO','MUSIC_DOWNLOAD','PLUGIN_REPO','PLUGIN_DOCS']}
    assert urls==expected
    assert sum('project-card' in a.get('class','').split() for _,a in elements)==2

def test_share_card_and_canonical():
    image=(ROOT/'qcya_ovo/assets/share.png').read_bytes()
    assert image.startswith(b'\x89PNG\r\n\x1a\n')
    assert struct.unpack('>II',image[16:24])==(1200,630)
    text=(ROOT/'index.html').read_text(encoding='utf-8')
    assert 'rel="canonical"' in text and 'property="og:image"' in text
    assert 'http-equiv="refresh"' not in text

def test_main_button_contrast():
    def luminance(rgb):
        numbers=[int(rgb[i:i+2],16)/255 for i in (0,2,4)]
        linear=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in numbers]
        return sum(a*b for a,b in zip(linear,[.2126,.7152,.0722]))
    ink=luminance('252c48')
    for color in ['fc9ec8','c5b9f8','9acbfb']:
        assert (luminance(color)+.05)/(ink+.05)>=4.5
