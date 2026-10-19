"""Static regression tests for the published single-page portfolio."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]

class Markup(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.sources = []
        self.project_cards = 0
        self.meta = {}
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a: self.ids.append(a["id"])
        if tag == "a" and "href" in a: self.links.append(a["href"])
        if tag in ("img", "script") and "src" in a: self.sources.append(a["src"])
        if tag == "link" and "href" in a: self.sources.append(a["href"])
        if tag == "article" and "project-card" in a.get("class", "").split(): self.project_cards += 1
        if tag == "meta":
            name = a.get("property") or a.get("name")
            if name: self.meta[name] = a.get("content","")

class SiteTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.css = (ROOT / "qcya_ovo/assets/site.css").read_text(encoding="utf-8")
        cls.js = (ROOT / "qcya_ovo/assets/site.js").read_text(encoding="utf-8")
        cls.doc = Markup()
        cls.doc.feed(cls.html)
    def test_build_is_reproducible(self):
        from scripts.build import render
        self.assertEqual(self.html, render())
    def test_unique_ids_and_local_targets(self):
        self.assertEqual(len(self.doc.ids),len(set(self.doc.ids)))
        for link in self.doc.links:
            if link.startswith("#"): self.assertIn(link[1:], self.doc.ids,link)
    def test_local_resources_exist(self):
        for source in self.doc.sources:
            if source.startswith("http"): continue
            path = source.partition("?")[0]
            self.assertTrue((ROOT / path).is_file(), path)
    def test_public_links_use_approved_origins(self):
        for link in self.doc.links:
            if link.startswith("#"): continue
            uri=urlparse(link)
            self.assertEqual(uri.scheme,"https",link)
            self.assertIn(uri.hostname,{"github.com","space.bilibili.com"},link)
    def test_public_projects_only(self):
        self.assertEqual(self.doc.project_cards,2)
        self.assertIn("releases/latest",self.html)
        self.assertIn("astrbot_plugin_su_xiaobai",self.html)
        for forbidden in ("星海","xinghai","qcya_bot","BV1sQ4y157h1","在十字路口不要左转","id=\"music\""):
            self.assertNotIn(forbidden,self.html)
    def test_no_dead_controls_and_meta(self):
        for required in ("theme-toggle","theme-mode","menu-toggle","site-nav","copy-dismiss","copy-value","year"):
            self.assertIn(required,self.doc.ids)
        self.assertIn("og:image",self.doc.meta)
        self.assertTrue((ROOT / "qcya_ovo/assets/share.svg").is_file())
        self.assertIn("content=\"width=device-width",self.html)
    def test_responsive_theme_and_overflow(self):
        self.assertIn("@media (max-width: 780px)",self.css)
        self.assertIn("@media (max-width: 540px)",self.css)
        self.assertIn('[data-theme="dark"]',self.css)
        self.assertIn(".ambient-layer {",self.css)
        self.assertIn("overflow: hidden; z-index: -1",self.css)
        self.assertNotIn("body{overflow-x:hidden",self.css.replace(" ",""))
        self.assertIn("prefers-reduced-motion",self.css)
    def test_no_risky_external_scripts(self):
        self.assertNotIn("<script src=\"http",self.html)
        self.assertNotIn("eval(",self.js)
        self.assertNotIn("document.write",self.js)
if __name__=="__main__":
    unittest.main()
