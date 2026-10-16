# United Auto Tech website

A one-page site for **United Auto Tech**, the auto repair shop at 33365 Mission Blvd, Union City, CA 94587, (510) 209-0748.

Plain HTML, CSS and JavaScript. No build step: open `index.html` through any static web server and it runs.

The design comes from the shop's own world: California license-plate blue and red, safety yellow, a repair-order card, a hanging OPEN sign, a pegboard "shop wall" of enamel signs, and a tire-sidewall band of raised white letters that rolls along and spins faster when you scroll. Fonts are Archivo (wide, heavy display letters) and Barlow, a typeface drawn from California's plates and highway signs.

## Before going live

Nothing below was invented. Each item is either missing or needs the shop's confirmation. The page works as is: missing links stay hidden and every booking path falls back to calling the shop.

The source for this build was a search-result summary, not the shop's Instagram or TikTok profile. That is why there are no handles, follower counts or photos yet.

1. **Get the owner's OK to publish.** This is a preview built from public information. It has a `noindex` tag, so search engines will not list it until you remove that tag (step 13).
2. **Prices.** None were given, so every service says "Quote". To show a price, replace `Quote` in that service's `board__price` span in `index.html`.
3. **Booking links.** The "Book service" popup only shows "Call to book" right now. If the shop has an online booking page, a Google booking link, a Yelp page or a number that takes texts, add them under `booking` in the site data (see "Links" below).
4. **Social profiles and follower counts.** None are known. Add the profile links under `social` and the "Follow on Instagram / TikTok" buttons appear by themselves. Follower counts go into the hero stats (there's a comment marking the spot).
5. **Photos.** There were no photos in the source. The hero "photo stack" is drawn in HTML (a repair order, the OPEN sign, a plate) and the shop wall uses enamel-sign artwork. Swap in real photos of the shop, bays and team when you have them (see "Photos" below). Skip any photo that has text over it.
6. **The 4.9 rating.** The source said "about 4.9 out of 5 from local customer feedback" without naming where it came from. Confirm the number and its source (Google? Yelp?) before you keep it. It appears in the hero stats, the story paragraph and the red "Rated" card. It is deliberately left out of the search-engine data.
7. **Rafi's name.** The source says the shop is led by Rafi. Check he is happy to be named. It's in the story paragraph and the blue "Led by" card.
8. **Hours.** Tuesday to Friday 9 to 5, Saturday 9 to 3, closed Sunday and Monday. Confirm them with the shop.
9. **The story.** It only states what we know. Add the shop's own story: when it opened, who works there, what they're known for.
10. **Service descriptions.** The one-line descriptions under each service are generic wording, not claims from the shop. Have the owner read them.
11. **Second language.** None was requested. If the shop wants one, add a Google Font for it and put the translated names next to the English. Right-to-left text must never get the letter-by-letter animation (motion.js already skips it).
12. **Google link.** "Reviews and photos on Google" is a Google Maps search for the shop's name and address. Replace it with the shop's own Google Business Profile link once you have it.
13. **Domain.** When the site moves to the shop's own domain:
    - remove `<meta name="robots" content="noindex">` from `index.html`;
    - replace every `https://nawidpopal16-glitch.github.io/united-auto-tech/` in `index.html` (canonical, Open Graph and JSON-LD) with the new address;
    - optionally add `"geo"` coordinates to the JSON-LD once you have the exact ones.
14. "No. 33365" on the repair-order card is decoration (it's the street number), not a real order number.

## File map

```
index.html          The page. Content, SEO tags, site data (JSON) and schema.org data all live here.
css/site.css        All styles. Colors and fonts are the variables at the top.
js/site.js          Location switcher, Book popup, service filters, copy address,
                    open-now status, phone bar links, smooth in-page links.
js/motion.js        Every animation (loader, hero, scroll reveals, marquee, footer, buttons).
vendor/             GSAP 3.13 + ScrollTrigger + SplitText, Lenis 1.3.4 (saved copies, no CDN).
images/og.jpg       1200x630 image used when the link is shared.
images/favicon.svg  Browser tab icon.
.nojekyll           Tells GitHub Pages to serve the files as they are.
```

## Preview it on your computer

From this folder:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080. (Opening `index.html` straight from the file system mostly works too, but a server is closer to the real thing.)

The intro loader runs once per browser tab. To see it again, open the page in a new tab or private window.

## How to edit

### Business details (address, phone, hours, links)

Open `index.html` and find the block `<script type="application/json" id="site-data">` near the top. That data drives the location switcher, the Book popup, the open-now status, the phone bar and every Call/Directions button.

The same facts are also written into the page itself so it reads fine without JavaScript and for search engines. When a detail changes, search `index.html` for the old value and update every match. In practice:

- **Phone:** the site data (`phone` and `tel`), every `tel:+15102090748` link, the visible numbers, the tire band in the footer, and the JSON-LD `telephone`.
- **Address:** the site data, the location card (`<address>` and the `data-copy-address` and `data-directions` attributes), the footer, the Directions links, the meta description and the JSON-LD `address`.
- **Hours:** the site data `hours` (24-hour times, `null` for closed), the hours table in the location card, the footer, the OPEN sign card in the hero, and the JSON-LD `openingHoursSpecification`.

### Services (the "menu")

Each service is an `<li class="board__item">` in the `<ol class="board">` list:

```html
<li class="board__item" data-cat="maintenance">
  <span class="board__no">05</span>
  <div class="board__text">
    <h3>Oil changes</h3>
    <p>One line about the service.</p>
  </div>
  <span class="board__price">Quote</span>
</li>
```

- `data-cat` decides which filter chip shows it: `maintenance`, `repair` or `diagnostics`. A service can sit in more than one: `data-cat="repair diagnostics"`.
- To add a new filter, add a chip button next to the others, for example `<button type="button" class="chip" aria-pressed="false" data-filter="tires">Tires</button>`, and use `data-cat="tires"` on the services that belong to it.
- Put a real price in `board__price`, e.g. `From $49`, only once the shop gives it to you.
- Also add the service to `makesOffer` in the JSON-LD so search engines see it.

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

Empty links stay hidden. "Call to book" is always listed. Any link to `#order` (or `#book`) on this site, or from anywhere else, opens the Book popup directly, for example `https://.../united-auto-tech/#order`.

### Photos

Put images in `images/` (JPG or WebP, about 1600px on the long side, under 300 KB each). Use photos of the shop, the bays and the team; skip any with text on them.

- **Hero photo stack:** each card is a `<div class="stack-card ...">`. Replace a card's inner content with `<img src="images/shop-front.jpg" alt="The United Auto Tech garage on Mission Blvd" width="800" height="600">`. Keep the outer `stack-card` div; the animation and tilt stay.
- **Shop wall:** each tile is an `<li class="wall__tile ...">`. Replace the `<svg>` inside its `<figure>` with an `<img>` (and keep or change the caption). For a video, wrap the figure in `<a href="link-to-the-video" target="_blank" rel="noopener">`.
- **Share image:** replace `images/og.jpg` (1200 x 630).
- Always write a short `alt` text that says what is in the photo.

### Adding a second location

Add another object to `locations` in the site data (same fields, new `id`). The header label turns into a picker, the choice is remembered, and every Call, Directions and Book button follows it. Also copy the `<article class="loc-card">` block for the new shop and add a second JSON-LD `<script type="application/ld+json">` block for it.

## Animation notes

- Everything is in `js/motion.js`: the garage-door loader with its 0-100% gauge (once per visit), the hero letters popping in, the cards dropping in tilted, the sticker spring, cards drifting with the mouse, smooth scrolling (Lenis), the header hiding on the way down and returning on the way up, section titles hopping in letter by letter, services rising, shop-wall signs wiping open, cards being tossed in, the tire band speeding up with scrolling, the footer name dropping in (hover the letters), and buttons leaning toward the cursor.
- Visitors who turn on "reduce motion" get none of it: no loader, no smooth scrolling, no moving band.
- If the scripts fail to load, the page still shows everything (a small failsafe in `<head>` makes sure of that).
- Right-to-left text is never split into letters.

## Publishing

### GitHub Pages (how the preview is published)

The site is published from the `gh-pages` branch of https://github.com/nawidpopal16-glitch/united-auto-tech and lives at https://nawidpopal16-glitch.github.io/united-auto-tech/.

To publish a change, commit it and push the site folder to `gh-pages`. From the Claude2 repository, after committing on the `site/united-auto-tech` branch:

```bash
git subtree split --prefix united-auto-tech -b uat-pages
git push https://github.com/nawidpopal16-glitch/united-auto-tech.git uat-pages:gh-pages uat-pages:site/united-auto-tech
git branch -D uat-pages
```

GitHub rebuilds the page within a minute or two.

### On the shop's own domain

- **GitHub Pages:** in the repository's Settings > Pages, set the custom domain, then add the DNS records GitHub shows you. Do the "Domain" steps in "Before going live".
- **Anywhere else** (Cloudflare Pages, Netlify, any web host): upload the contents of this folder as they are. There's nothing to build.
