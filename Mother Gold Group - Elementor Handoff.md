# Mother Gold Group: source and Elementor handoff

The redesign pairs Cormorant Garamond headlines with Inter interface text. The black and charcoal palette keeps the bullion photography in focus, while champagne accents distinguish actions and market figures. The layout moves from the brand and daily rate to the business, its operations and the next step for enquiries.

## Run and edit the demo

| File | Purpose |
|---|---|
| `index.html` | Page sections, editable copy, asset slots, canonical and social metadata, and JSON-LD. |
| `styles.css` | Palette and typography tokens, layout, components, responsive rules and reduced-motion settings. |
| `script.js` | Navigation, dialogs, chart, map selection, form validation and daily rate adapter. |
| `rates-cache.js` | Browser storage adapter for the downloadable demo. |
| `robots.txt`, `sitemap.xml` | Production-domain templates. Leave staging password-protected or `noindex`. |
| `assets/` | Local WebP photography, social image, screenshot-derived demo mark, fonts, icons, and map. |

No build step or npm install is necessary. From the unzipped folder, run `python -m http.server 8080`, then open `http://localhost:8080`. Serve over HTTP or HTTPS for browser storage and SVG sprites.

The placeholder photos are generated illustrations, not documentary images of company assets, mining sites, inventory, or premises. Replace the marked HTML image slots with approved assets and retain responsive sizes, dimensions and descriptive alternatives. The contact map and LocalBusiness schema currently use the [Bank Street Building pin published by Property Finder](https://www.propertyfinder.ae/en/plp/commercial-rent/office-space-for-rent-dubai-bur-dubai-al-mankhool-bank-street-building-172432536.html); confirm the office’s preferred public pin and entrance before launch. The footprint uses [Natural Earth geography](https://www.naturalearthdata.com/).

## Rebuild in Elementor

- **Theme Builder header and footer:** Create the utility bar, sticky navigation, mobile service submenu and quote CTA in the header template. Recreate the brand, quick links, policy links and contact columns in the footer template. Preserve the section IDs so existing links still work.
- **Homepage containers:** Use a full-width hero with a positioned background image. Use separate containers for the rate strip, counters, three-step journey, service cards, full rate board, country selector/map, reasons to choose, logo slots, testimonial, FAQ and contact. Use Elementor’s native Accordion for FAQs and reuse the map SVG and country buttons with their small interaction script.
- **Enquiries:** Replace the local-only email draft with an Elementor Form or an equivalent backend. Set the approved recipient, add server-side validation and anti-spam protection, connect authenticated SMTP, and test delivery. Add the approved privacy notice and consent handling before collecting or storing messages.
- **SEO:** Put canonical, Open Graph and schema in your SEO plugin or theme, not in both. Keep the FAQ schema aligned with visible answers. Keep existing paths or create 301 redirects for changed URLs. Publish the English/Arabic alternates only when both pages are live and reciprocal, and test the Arabic layout in RTL.

## Implement the daily rate as a shortcode

1. Put the market data logic in a lightweight site plugin, not in Elementor Custom HTML. Store the [GoldAPI key](https://www.goldapi.io/) in the host’s secret manager or `wp-config.php`. Fetch `https://www.goldapi.io/api/price/XAU/USD` with `wp_remote_get()` and the `x-access-token` header. Validate the response, the positive `price`, and the quote date.
2. Use `Asia/Dubai` explicitly. For first-visitor refresh, use the Dubai date as the cache key and a database-backed lock (e.g. an atomic `add_option()` with a short expiry and stale-lock recovery) so concurrent visits do not duplicate provider calls. Store an attempt marker even on failure if you want a strict once-per-day provider limit. For fixed 9:00 AM refresh, schedule the next Dubai 09:00 against its UTC timestamp and trigger WP-Cron with a real server cron; avoid relying on visitor traffic for timing. Pick one strategy and align any HTML/CDN cache expiry or purge with it.
3. Use a date-keyed transient for the current snapshot and a separate persistent option or table to retain the last successful snapshot and seven-day history. Prefer a date-stamped admin override, then today’s cached snapshot, then the labelled last saved rate, then labelled demo data. Convert with `(spotUsd / 31.1035) * 3.6725`, then multiply by `0.9167`, `0.875`, and `0.75`. An override that supplies only the 24K retail board price should label the reconstructed USD equivalent as **implied**, not market spot. Compare like-for-like rates and do not manufacture missing days.
4. Register `[mother_gold_rate view="bar"]` and `[mother_gold_rate view="full"]` with `add_shortcode('mother_gold_rate', ...)`. Read the same snapshot in both views, escape rendered values, and return the strip and board markup respectively. Add each shortcode in an Elementor Shortcode widget. If rendering the existing frontend from a REST feed instead, configure `DAILY_ENDPOINT` in `script.js` and have your endpoint return the same envelope for everyone:

   ```json
   {
     "current": {
       "date": "2026-11-18",
       "updatedAt": "2026-11-18T05:00:00Z",
       "source": "api",
       "spotUsd": 3160,
       "aed24": 373.112350700082
     },
     "history": []
   }
   ```

   This is an example payload, not a market quote. Use `source: "manual"`, `board: true` for an admin board override and `implied: true` when no observed USD spot was supplied. Put actual prior rows in `history`. The demo intentionally leaves `GOLD_API_KEY` unset. The downloadable version uses `localStorage` per browser when allowed; the hosted preview uses memory only because embedded previews disallow persistent browser storage. Neither can share a snapshot across visitors; the WordPress cache does that.
5. Test no-key, malformed data, provider timeout, Dubai day rollover, manual override, and simultaneous visits before switching off demo labels. Assert that stale snapshots retain their original timestamps and that the seven-day chart does not fill gaps with fictional live prices.

## Before launch

- **Brand:** Supply SVG/PNG logo variants, approved photos or video and alt-text context, plus a social sharing image.
- **Business evidence:** Supply verified licences and issuing bodies, any certificates, partner-logo permissions, confirmed operating statistics and approved testimonials.
- **Contact and policies:** Confirm showroom hours and the public map pin, the WhatsApp Business number, official social URLs, approved policy text/URLs, and the enquiry routing and privacy requirements.
- **Market data:** Choose the provider and entitlement, configure its key server-side, and confirm if the business wants a spot-derived reference or a separately administered retail board rate.
- **Launch QA:** Verify public redirects and policy pages, recheck keyboard and screen-reader flows, audit performance on production hosting, and confirm caching and email delivery independently.
