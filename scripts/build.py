"""Render the approved public content. Python standard library only, no network."""
from pathlib import Path
from string import Template
from urllib.parse import urlparse
import hashlib
import html
import json
import sys

ROOT = Path(__file__).resolve().parents[1]

def escape(value):
    return html.escape(str(value), quote=True)

def public_url(value):
    u=urlparse(value)
    if u.scheme != 'https' or u.netloc not in {'github.com','space.bilibili.com','qcya.github.io'}:
        raise ValueError('Only approved HTTPS public hosts are allowed: '+value)
    return escape(value)

def render():
    data=json.loads((ROOT/'content/site.json').read_text(encoding='utf-8'))
    cards=[]
    for n,p in enumerate(data['projects'],1):
        if p.get('published') is not True:
            raise ValueError('Remove unpublished projects from the public manifest entirely.')
        if p['source_url'] not in {'https://github.com/qcya/netease-music-downloader','https://github.com/qcya/astrbot_plugin_su_xiaobai'}:
            raise ValueError('A new project requires explicit review of the public allowlist.')
        source=public_url(p['source_url']); primary=public_url(p['primary_url'])
        features=''.join('<li>'+escape(f)+'</li>' for f in p['features'])
        copy=''
        if p.get('copy_label'):
            copy=f'<p class="repo-address">{source}</p><button type="button" class="copy-action" data-copy="{source}" hidden>{escape(p["copy_label"])}</button>'
        cards.append(f'''        <article class="project-card surface" id="project-{escape(p['id'])}">
          <div class="project-visual project-v-{n}" aria-hidden="true"><div class="vis-top">0{n} / {escape(p['type'])}</div><div class="vis-symbol">{escape(p['glyph'])}</div><div class="vis-micro">{escape(p['caption'])}</div></div>
          <div class="project-body"><span class="project-meta">{escape(p['platform'])}</span><h3>{escape(p['name'])}</h3><p>{escape(p['description'])}</p>
            <div class="project-actions"><a class="button button-primary" href="{primary}" target="_blank" rel="noopener noreferrer">{escape(p['primary_label'])} ↗</a><a class="text-link" href="{source}" target="_blank" rel="noopener noreferrer" aria-label="查看{escape(p['name'])}源码">查看源码 ↗</a></div>
            <details><summary>{escape(p['details_title'])}</summary><ul>{features}</ul><p>{escape(p['instructions'])}</p>{copy}</details>
          </div>
        </article>''')
    values={k:escape(v) for k,v in data.items() if k!='projects'}
    for k in ('github','bilibili','site_url'): values[k]=public_url(data[k])
    values['project_cards']='\n'.join(cards)
    for kind in ('css','js'):
        blob=(ROOT/f'qcya_ovo/assets/site.{kind}').read_bytes()
        values[kind+'_version']=hashlib.sha1(f'blob {len(blob)}\0'.encode()+blob).hexdigest()[:10]
    output=Template((ROOT/'src/index.template.html').read_text(encoding='utf-8')).substitute(values)
    return output

if __name__=='__main__':
    target=ROOT/'index.html'; output=render()
    if '--check' in sys.argv:
        if not target.exists() or target.read_text(encoding='utf-8')!=output:
            sys.exit('index.html is stale. Run python scripts/build.py and commit the output.')
        print('Generated HTML matches template and public manifest.')
    else:
        target.write_text(output,encoding='utf-8'); print('Built index.html')
