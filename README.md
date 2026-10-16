# United Auto Tech website

A one-page site for **United Auto Tech**, the auto repair shop at 33365 Mission Blvd, Union City, CA 94587, (510) 209-0748.

Plain HTML, CSS and JavaScript. No build step: open `index.html` through any static web server and it runs.

The look follows national service-chain sites like Firestone Complete Auto Care and Wheel Works: a red promo bar, a white header with a "My store / Call the shop" row, a dark photo hero with big condensed all-caps type, photo service cards with red buttons, coupon-style fact cards, a store finder with map and hours, and a dark footer. The bold pieces are a red ticker band with white stripes that rolls along (faster when you scroll) and the round "All makes" seal. Fonts are Barlow Condensed for headings and Barlow for text.

## Before going live

Nothing below was invented. Each item is either missing or needs the shop's confirmation. The page works as is: missing links stay hidden and every booking path falls back to calling the shop.

The source for this build was a search-result summary, not the shop's Instagram or TikTok profile. That is why there are no handles, follower counts or real photos yet.

1. **Get the owner's OK to publish.** This is a preview built from public information. It has a `noindex` tag, so search engines will not list it until you remove that tag (step 13).
2. **Photos are free stock photos, not the shop.** Every photo is a CC0 (public-domain) stock image of car parts and tools, with no people, so nothing pretends to be the shop's staff. They are legal to use, but replace them with real photos of the shop, bays and team before launch (see "Photos" below). Sources are listed under "Photo credits".
3. **Prices.** None were given, so every service card says "Call for a quote". To show a price, replace that text in the card's `svc__price` line.
4. **Booking links.** The "Schedule service" popup only shows "Call to book" right now. If the shop has an online booking page, a Google booking link, a Yelp page or a number that takes texts, add them under `booking` in the site data (see "Links" below).
5. **Social profiles and follower counts.** None are known. Add the profile links under `social` and the "Follow on Instagram / TikTok" buttons appear by themselves. Follower counts go into the hero stats (there's a comment marking the spot).
6. **The 4.9 rating.** The source said "about 4.9 out of 5 from local customer feedback" without naming where it came from. Confirm the number and its source (Google? Yelp?) before you keep it. It appears in the hero stats, the "About the shop" paragraph and the "Local rating" card. It is deliberately left out of the search-engine data.
7. **Rafi's name.** The source says the shop is led by Rafi. Check he is happy to be named (the "About the shop" paragraph and the "Shop led by" card).
8. **Hours.** Tuesday to Friday 9 to 5, Saturday 9 to 3, closed Sunday and Monday. Confirm them with the shop.
9. **The story.** "About the shop" only states what we know. Add the shop's own story: when it opened, who works there, what they're known for.
10. **Service descriptions.** The one-line descriptions on each card are generic wording, not claims from the shop. Have the owner read them.
11. **Second language.** None was requested. If the shop wants one, add a Google Font for it and put the translated names next to the English. Right-to-left text must never get the letter-by-letter animation (motion.js already skips it).
12. **Google links.** "Reviews and photos on Google" is a Google Maps search for the shop's name and address, and the map is a Google Maps embed of the address. Replace the search link with the shop's own Google Business Profile link once you have it.
13. **Domain.** When the site moves to the shop's own domain:
    - remove `<meta name="robots" content="noindex">` from `index.html`;
    - replace every `https://nawidpopal16-glitch.github.io/united-auto-tech/` in `index.html` (canonical, Open Graph and JSON-LD) with the new address;
    - optionally add `"geo"` coordinates to the JSON-LD once you have the exact ones.

## File map

```
index.html          The page. Content, SEO tags, site data (JSON) and schema.org data all live here.
css/site.css        All styles. Colors and fonts are the variables at the top.
js/site.js          Location switcher, Schedule-service popup, service filters, phone menu, copy address,
                    open-now status, phone bar links, smooth in-page links.
js/motion.js        Every animation (loader, hero, scroll reveals, ticker bands, footer, buttons).
vendor/             GSAP 3.13 + ScrollTrigger + SplitText, Lenis 1.3.4 (saved copies, no CDN).
images/             hero-engine.jpg (hero), svc-*.jpg (service cards and the hero photo stack),
                    shop-*.jpg ("Under the hood" gallery), og.jpg (1200x630 share image), favicon.svg.
.nojekyll           Tells GitHub Pages to serve the files as they are.
```

## Preview it on your computer

From this folder:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080. The intro loader runs once per browser tab; open a new tab or private window to see it again.

## How to edit

### Business details (address, phone, hours, links)

Open `index.html` and find the block `<script type="application/json" id="site-data">` near the top. That data drives the "My store" switcher, the Schedule-service popup, the open/closed status (top bar, hero, store card), the phone bar and every Call/Directions button.

The same facts are also written into the page itself so it reads fine without JavaScript and for search engines. When a detail changes, search `index.html` for the old value and update every match. In practice:

- **Phone:** the site data (`phone` and `tel`), every `tel:+15102090748` link, the visible numbers, the dark ticker band above the footer, and the JSON-LD `telephone`.
- **Address:** the site data, the store card (`<address>` and the `data-copy-address` and `data-directions` attributes), the map `src`, the footer, the Directions links, the meta description, the ticker band and the JSON-LD `address`.
- **Hours:** the site data `hours` (24-hour times, `null` for closed), the hours table in the store card, the "Open" coupon card, the footer and the JSON-LD `openingHoursSpecification`.

### Services (the "menu")

Each service is an `<li class="svc">` card in `<ul class="svc-grid">`:

```html
<li class="svc" data-cat="maintenance">
  <img class="svc__img" src="images/svc-oil.jpg" alt="What the photo shows" width="900" height="600" loading="lazy">
  <div class="svc__body">
    <p class="svc__cat">Maintenance</p>
    <h3 class="svc__title">Oil changes</h3>
    <p class="svc__text">One line about the service.</p>
    <p class="svc__price">Call for a quote</p>
    <a class="btn btn--red btn--block" href="#order" data-book><span>Schedule service</span></a>
  </div>
</li>
```

- `data-cat` decides which filter tab shows it: `maintenance`, `repair` or `diagnostics`. A card can sit in more than one: `data-cat="repair diagnostics"`. The dark "Not sure what you need?" card shows under every tab.
- To add a new filter, add a tab button next to the others, e.g. `<button type="button" class="tab" aria-pressed="false" data-filter="tires">Tires</button>`, and use `data-cat="tires"` on its cards.
- Put a real price in `svc__price` (e.g. `From $49`) only once the shop gives it to you.
- Also add the service to `makesOffer` in the JSON-LD, the red ticker band and the footer "Services" list.

### Links

In the site data:

```json
"booking": {
  "online": "https://example.com/the-shops-booking-page",
  "google": "https://example.com/the-shops-google-link",
  "yelp": "https://example.com/the-shops-yelp-page",
  "sms": "+15102090748"
},
"social": {
  "instagram": "https://instagram.com/the-shops-handle",
  "tiktok": "https://tiktok.com/@the-shops-handle",
  "facebook": ""
}
```

- `online`: the shop's own online booking page.
- `google`: a Google "Book" or Business Profile link.
- `yelp`: the shop's Yelp page.
- `sms`: fill only if the number accepts text messages.
- Keep the quotes and commas exactly as shown; the block must stay valid JSON.

Empty links stay hidden. "Call to book" is always listed. Any link to `#order` (or `#book`), on this site or from anywhere else, opens the Schedule-service popup directly, for example `https://.../united-auto-tech/#order`.

### Photos

Put images in `images/` (JPG, about 1600px on the long side for the hero and 900px for cards, under 300 KB each). Use photos of the shop, the bays and the team; skip any with text on them. Always write a short `alt` text that says what is in the photo.

- **Hero background:** replace `images/hero-engine.jpg` (or point the `<img>` inside `.hero__bg` at a new file). Wide, darker photos work best behind the white text.
- **Hero photo stack:** the three `<figure class="stack-card">` blocks. Change each `<img src>` and its caption. Keep the figures; the drop-in animation and tilt stay.
- **Service cards:** change each card's `svc__img` source and alt text.
- **"Under the hood" gallery:** the four `<li class="mosaic__tile">` images. For a video, wrap the image in `<a href="link-to-the-video" target="_blank" rel="noopener">`.
- **Share image:** replace `images/og.jpg` (1200 x 630).

### Adding a second location

Add another object to `locations` in the site data (same fields, new `id`). The "My store" label turns into a picker, the choice is remembered, and every Call, Directions and Schedule-service button follows it. Also copy the `<article class="store">` block for the new shop and add a second JSON-LD `<script type="application/ld+json">` block for it.

## Animation notes

- Everything is in `js/motion.js`: the gauge loader that counts 0-100% and lifts away (once per visit), the hero letters popping in, the photo stack dropping in tilted, the seal springing in, photos drifting with the mouse, smooth scrolling (Lenis), the header hiding on the way down and returning on the way up, section titles hopping in letter by letter, service cards rising, gallery photos wiping open, the fact cards and store card tossing in, the ticker bands speeding up with scrolling, the footer name dropping in (letters hop and flash red on hover), and buttons leaning toward the cursor.
- The timing is quick and clean to suit the look; change durations and eases in `motion.js`.
- Visitors who turn on "reduce motion" get none of it: no loader, no smooth scrolling, no moving bands.
- If the scripts fail to load, the page still shows everything (a small failsafe in `<head>` makes sure of that).
- Right-to-left text is never split into letters.

## Photo credits

All photos are CC0 / public domain (free for commercial use, no attribution required), found through Openverse. They are stock images, not photos of United Auto Tech.

| File | Source | License | Original |
| --- | --- | --- | --- |
| `images/hero-engine.jpg` | rawpixel | CC0 | https://www.rawpixel.com/image/560250/vintage-car-engine |
| `images/svc-diagnostics.jpg` | rawpixel | CC0 | https://www.rawpixel.com/image/5923665/photo-image-lights-public-domain-interior |
| `images/svc-tuneup.jpg` | rawpixel | CC0 | https://www.rawpixel.com/image/6038859/car-engine-free-public-domain-cc0-photo |
| `images/svc-alignment.jpg` | rawpixel | CC0 | https://www.rawpixel.com/image/5927404/photo-image-light-public-domain-logo |
| `images/svc-brakes.jpg` | rawpixel | CC0 | https://www.rawpixel.com/image/3305691/free-photo-image-car-alloy-wheel-automobile |
| `images/svc-oil.jpg` | rawpixel | CC0 | https://www.rawpixel.com/image/5920025/motor-oiling-can-free-public-domain-cc0-photo |
| `images/svc-ac.jpg` | rawpixel | CC0 | https://www.rawpixel.com/image/5923551/photo-image-lights-public-domain-interior |
| `images/svc-repair.jpg` | StockSnap | CC0 | https://stocksnap.io/photo/wrench-sockets-M07SV6AMBD |
| `images/shop-engine-block.jpg` | StockSnap | CC0 | https://stocksnap.io/photo/engine-machine-RDQ85OYVLO |
| `images/shop-tread.jpg` | StockSnap | CC0 | https://stocksnap.io/photo/tire-thread-MUVDMYQQXF |
| `images/shop-valvetrain.jpg` | rawpixel | CC0 | https://www.rawpixel.com/image/5962668/free-public-domain-cc0-photo |
| `images/shop-bay-door.jpg` | rawpixel | CC0 | https://www.rawpixel.com/image/5920707/photo-image-public-domain-free-black-and-white |

The free downloads are about 1000px wide, so the hero photo was upscaled and lightly sharpened; a real, larger shop photo will look crisper.

## Publishing

### GitHub Pages (how the preview is published)

The site is published from the `gh-pages` branch of https://github.com/nawidpopal16-glitch/united-auto-tech and lives at https://nawidpopal16-glitch.github.io/united-auto-tech/.

To publish a change, commit it and push the site folder to `gh-pages`. From the Claude2 repository, after committing on the `site/united-auto-tech` branch:

```bash
git subtree split --prefix united-auto-tech -b uat-pages
```

```bash
git push https://github.com/nawidpopal16-glitch/united-auto-tech.git uat-pages:gh-pages uat-pages:site/united-auto-tech
```

```bash
git branch -D uat-pages
```

GitHub rebuilds the page within a minute or two.

### On the shop's own domain

- **GitHub Pages:** in the repository's Settings > Pages, set the custom domain, then add the DNS records GitHub shows you. Do the "Domain" steps in "Before going live".
- **Anywhere else** (Cloudflare Pages, Netlify, any web host): upload the contents of this folder as they are. There's nothing to build.
