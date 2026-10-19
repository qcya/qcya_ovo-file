"""Behavior tests against the served static site. No external sites are opened."""
import os
import base64
import re
import mimetypes
import shutil
from pathlib import Path
import pytest
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('SITE_URL', 'http://127.0.0.1:8765/')
SHOTS = Path(os.environ.get('SCREENSHOT_DIR', str(Path(__file__).resolve().parents[1] / 'test-results/screenshots')))

INLINE = os.environ.get('INLINE_SITE')

def load(pg):
    if not INLINE:
        pg.goto(URL)
        return
    root = Path(INLINE)
    html = (root / 'index.html').read_text()
    def css(m):
        return '<style>' + (root / m[1].split('?')[0]).read_text() + '</style>'
    html = re.sub(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', css, html)
    # Site scripts remain real; only transport is replaced by local bytes.
    scripts = re.findall(r'<script[^>]*src="([^"]+)"[^>]*></script>', html)
    html = re.sub(r'<script[^>]*src="([^"]+)"[^>]*></script>', '', html)
    def image(m):
        p = root / m[1]
        data = base64.b64encode(p.read_bytes()).decode()
        return 'src="data:' + (mimetypes.guess_type(p)[0] or 'image/webp') + ';base64,' + data + '"'
    html = re.sub(r'src="([^":]+\.(?:webp|png|jpg))"', image, html)
    pg.set_content(html)
    for script in scripts:
        pg.add_script_tag(content=(root / script.split('?')[0]).read_text())

@pytest.fixture(scope='session')
def browser():
    with sync_playwright() as p:
        executable = os.environ.get('CHROMIUM_PATH')
        b = p.chromium.launch(headless=True, executable_path=executable, args=['--no-sandbox'])
        yield b
        b.close()

@pytest.fixture
def page(browser):
    context = browser.new_context(viewport={'width':1440,'height':900}, color_scheme='light', reduced_motion='reduce')
    pg = context.new_page()
    pg.set_default_timeout(2500)
    yield pg
    context.close()

@pytest.mark.parametrize('size', [(1920,1080),(1440,900),(1366,768),(1024,768),(800,1024),(768,1024),(541,900),(540,900),(390,844),(320,568)])
def test_layout_and_bottom_navigation(page, size):
    page.set_viewport_size({'width':size[0],'height':size[1]})
    load(page)
    page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)')
    page.wait_for_timeout(180)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Decorative overflow'
    expect(page.locator('.nav-link[aria-current="location"]')).to_have_attribute('href','#contact')
    page.evaluate('window.scrollTo(0,0)')
    expect(page.locator('.nav-link[aria-current="location"]')).to_have_attribute('href','#home')

@pytest.mark.parametrize('event', ['escape', 'outside'])
def test_mobile_menu_closes(page, event):
    page.set_viewport_size({'width':390,'height':844})
    load(page)
    button=page.locator('#menu-toggle')
    button.click()
    expect(button).to_have_attribute('aria-expanded','true')
    if event == 'escape':
        page.locator('#site-nav a').first.focus()
        page.keyboard.press('Escape')
        expect(button).to_be_focused()
    else:
        page.mouse.click(12, 500)
    expect(button).to_have_attribute('aria-expanded','false')
    expect(button).to_have_attribute('aria-label','展开导航')

def test_system_theme_changes(page):
    load(page)
    page.emulate_media(color_scheme='dark')
    expect(page.locator('html')).to_have_attribute('data-theme','dark')
    expect(page.locator('meta[name="theme-color"]')).to_have_attribute('content','#111525')

@pytest.mark.skipif(bool(INLINE), reason='Opaque offline document: persistence requires HTTP origin; verified in CI')
def test_three_theme_modes_persist(page):
    load(page)
    selector=page.locator('#theme-mode')
    selector.select_option('dark')
    page.reload()
    expect(page.locator('html')).to_have_attribute('data-theme','dark')
    page.emulate_media(color_scheme='light')
    expect(page.locator('html')).to_have_attribute('data-theme','dark')
    selector.select_option('system')
    expect(page.locator('html')).to_have_attribute('data-theme','light')
    page.emulate_media(color_scheme='dark')
    expect(page.locator('html')).to_have_attribute('data-theme','dark')
    selector.select_option('light')
    expect(page.locator('html')).to_have_attribute('data-theme','light')

def test_without_javascript(browser):
    c=browser.new_context(java_script_enabled=False, viewport={'width':390,'height':844})
    pg=c.new_page();load(pg)
    expect(pg.locator('#site-nav')).to_be_visible()
    expect(pg.locator('#menu-toggle')).not_to_be_visible()
    expect(pg.locator('a[href$="/releases/latest"]')).to_be_visible()
    c.close()

def test_storage_denied(page):
    page.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError')}})")
    errors=[]; page.on('pageerror',lambda e: errors.append(str(e)))
    load(page)
    page.locator('#theme-toggle').click()
    expect(page.locator('html')).to_have_attribute('data-theme','dark')
    assert not errors

def test_resources_and_public_content(page):
    errors=[]; failed=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:failed.append(r.url) if r.status>=400 else None)
    load(page);page.wait_for_load_state('networkidle')
    assert not errors and not failed
    assert page.locator('.project-card').count()==2
    expect(page.locator('#contact-title')).to_have_text('联系方式')
    text=page.locator('body').inner_text()
    for word in ['QCYA','Q.','旅行者','星海','Active','音乐角落','从第一行代码']:
        assert word not in text
    assert page.locator('img').count()==2
    for img in page.locator('img').all():
        assert img.bounding_box()['width']<=48
    assert page.locator('a[href="https://space.bilibili.com/1576380674"]').count()>=1
    assert page.locator('a[href="https://github.com/qcya/qcya_ovo-file"]').count()==0

def test_details_and_copy_failure(page):
    load(page)
    page.locator('details.project-details summary').first.click()
    assert page.locator('details.project-details').first.get_attribute('open') is not None
    page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('denied')}}})")
    page.locator('[data-copy-label="英文 ID"]').click()
    expect(page.locator('#copy-fallback')).to_be_visible()
    expect(page.locator('#copy-value')).to_be_focused()

def test_mobile_content_density(page):
    page.set_viewport_size({'width':390,'height':844});load(page)
    assert page.locator('#projects').evaluate('(el)=>el.offsetTop')<1700
    assert page.locator('.hero-graphic').bounding_box()['height']<=190

def test_capture(page):
    SHOTS.mkdir(parents=True,exist_ok=True)
    for name, width, height, scheme in [('desktop-light',1440,900,'light'),('desktop-dark',1440,900,'dark'),('mobile-light',390,844,'light')]:
        page.set_viewport_size({'width':width,'height':height});page.emulate_media(color_scheme=scheme);load(page)
        page.screenshot(path=str(SHOTS / f'{name}.png'), full_page=True)


def test_theme_modes_without_reload(page):
    load(page)
    selector=page.locator('#theme-mode')
    for mode, expected in [('dark','dark'),('light','light'),('system','light')]:
        selector.select_option(mode)
        expect(page.locator('html')).to_have_attribute('data-theme',expected)
    page.emulate_media(color_scheme='dark')
    expect(page.locator('html')).to_have_attribute('data-theme','dark')


def test_copy_success(page):
    load(page)
    page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:async(v)=>{window.copiedValue=v}}})")
    page.locator('[data-copy-label="英文 ID"]').click()
    expect(page.locator('#status')).to_have_text('英文 ID已复制')
    assert page.evaluate('window.copiedValue')=='qcya_ovo'
    expect(page.locator('#copy-fallback')).not_to_be_visible()


@pytest.mark.skipif(bool(INLINE), reason='Legacy redirect requires normal browser navigation')
def test_legacy_address_and_hash(page):
    page.goto(URL + 'qcya_ovo/index.html?source=legacy#contact')
    expect(page).to_have_url(URL + '?source=legacy#contact')
    expect(page.locator('.nav-link[aria-current="location"]')).to_have_attribute('href','#contact')
