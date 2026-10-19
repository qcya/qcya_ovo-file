# Homepage maintenance

Keep the existing pink/blue graphic design and small avatar (34px / 48px). The public Chinese display name is 青春沿岸; the English ID is qcya_ovo. GitHub account URLs remain qcya.

Only the two explicitly listed public projects in site.json may be shown. Never add private projects or details from conversations, a character mascot, TG bot, old video URLs, homepage source card, dead music widget or fake live status.

Edit src/index.html and site.json, then run python scripts/build.py. Commit the generated root index.html too. Visitors must not require JavaScript to read content, navigate on mobile, use normal links or open details.

Run pytest tests, test both themes and review desktop/mobile screenshots before claiming completion. Do not confuse local offline rendering with live production verification. Never fabricate product screenshots or download counts.
