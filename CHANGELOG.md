# Changelog
All notable changes to this project will be documented in this file.

## 5.8.131 (2026-09-04)

- Show a compact truck-icon “Free shipping” assurance beside eligible USA PDP prices using BigCommerce's existing zero-shipping-price signal.
- Suppress the older, larger free-shipping card on the USA storefront to keep the purchase area uncluttered and avoid duplicate messaging; other storefronts retain their existing presentation.

## 5.8.130 (2026-09-04)

- Move the mobile PDP fullscreen-gallery control from the upper-left artwork area to the lower-right of the main media stage.
- Keep the control clear of native playback controls when the inline product video is active, without changing its desktop position or full-screen behavior.

## 5.8.129 (2026-09-04)

- Defer the PDP gallery video file and oversized poster until a shopper chooses the video, avoiding their multi-megabyte cost during ordinary page loads.
- Load the primary PDP product image eagerly with high fetch priority so the browser can discover the page's LCP image immediately.
- Keep the protected Write a Review form but defer its Google reCAPTCHA markup and scripts until the review modal is opened.

## 5.8.128 (2026-09-04)

- Load the PDP Specifications disclosure collapsed by default while retaining its native accessible expand-and-collapse behavior.
- Move the “Questions about fit or installation?” specialist link directly below Specifications so it remains beneath the disclosure whether collapsed or expanded.

## 5.8.127 (2026-09-04)

- Add Klaviyo `Viewed Product` and `trackViewedItem` events to product pages using safely serialized Stencil product data.
- Include product identity, SKU, categories, image, URL, brand, current price and comparison price while supporting Klaviyo's asynchronously loaded onsite script.
- Add reproducible GitHub theme bundling with versioned artifacts and unmistakable extract-versus-upload ZIP filenames.

## 5.8.126 (2026-09-03)

- Remove the generic “NEW Brighten Up Skylight Series” label from the PDP purchase area so it cannot appear on unrelated skylight series.
- Load compatible PDP accessories in a collapsed disclosure by default while preserving their product resolution, selection, analytics and cart behavior.
- Move the Solatube specialist help link below the optional-accessories disclosure to restore a clearer title-to-cart purchase hierarchy.
- Compact the separate USA Labor Day Script Manager PDP message into a lightweight inline offer and coupon-copy control without changing eligibility, scheduling or discount logic.

## 5.8.125 (2026-09-03)

- Center the opt-in long-form PDP section navigation on desktop while preserving touch-friendly horizontal scrolling on smaller screens.
- Refine the native warranty disclosure with a clearer title, larger click target, restrained open-state container, visible control, improved copy spacing and accessible link styling.
- Keep the existing expand/collapse interaction and apply the warranty treatment consistently wherever a PDP has native warranty content.

## 5.8.124 (2026-09-03)

- Add an opt-in, responsive long-form PDP presentation that activates only when a product description contains the pilot marker.
- Add lightweight, click-to-load product videos so no YouTube player resources load before a shopper chooses a video.
- Add a guarded, preview-first updater for USA SKU 105090 that replaces its legacy styled description, moves warranty copy into the native field, preserves native specifications and purchasing controls, and backs up before writing.
- Reuse this product's existing catalog media and accessory selector instead of shipping the PowerPoint's flattened PNG compositions or a duplicate add-to-cart system.

## 5.8.123 (2026-09-03)

- Preload the initially selected PDP rule/variant image from BigCommerce's existing product data instead of waiting for the deferred product bundle.
- Promote only the visible full-PDP image to eager, high-priority loading while leaving Quick View, thumbnails and alternate gallery images lazy.
- Synchronize the initial image, responsive sources, zoom target and accessible label before lazysizes can replace the selected image with the generic catalog image.

## 5.8.122 (2026-09-03)

- Replace the three large below-fold skylight PDP header images with two smaller images, preserving the requested `new2` then `download-1-1` sequence and lazy-loading both.
- Replace the skylight gallery video poster across all visible USA, Belgium, Canada and UK products that used the previous oversized thumbnail, including Canada's channel-localized PDP description overrides.
- Use the smaller natural-light benefits background in the shared theme and add a preview-first, backed-up catalog updater for future media migrations.

## 5.8.121 (2026-09-02)

- Rebuild the compiled storefront JavaScript so the optional survey contact checkbox reveals and validates its contact fields on the deployed theme.
- Make the upload-bundle task compile current JavaScript automatically, preventing updated templates from being paired with stale interaction code in future releases.
- Add a compiled-asset regression check for survey contact behavior and PDP analytics events.

## 5.8.120 (2026-09-02)

- Keep the purchase survey anonymous by default while offering an optional “contact me” checkbox on its final step.
- Reveal and validate only the requested name and email-or-phone fields, route them through each storefront's existing survey inbox, and retain the selected answer plus page/product context.
- Track contact-request intent and successful submission without putting personal contact details into analytics.

## 5.8.119 (2026-09-02)

- Add USA offer `validFrom` and the published 90-day mail-return policy, including customer-paid return shipping and the stated 20% restocking fee.
- Mark eligible USA products as free shipping to U.S. destinations while deliberately omitting that claim for fixed skylights and whole house fans with non-free shipping.

## 5.8.118 (2026-09-02)

- Emit the Product JSON-LD image as BigCommerce's resolved URL string instead of serializing its internal safe-string wrapper as an invalid ImageObject.

## 5.8.117 (2026-09-02)

- Replace encoded product-body markup in Product JSON-LD with the clean SEO description and a valid title fallback.
- Emit valid `AggregateOffer` price ranges, safely escaped identifiers and URLs, a Solatube brand fallback, and omit invalid price-less Product markup when no review data exists.
- Preserve BigCommerce's native `add_to_cart` event while adding dedicated GA4 events for PDP accessory discovery, selection and add results, plus purchase-bar views, edit/help actions and bottom-bar add-to-cart use.

## 5.8.116 (2026-09-02)

- Give desktop product-card sale badges the same image-title clearance already used on mobile.
- Keep the compact yellow “Sale” badge on the product image without obscuring embedded artwork headings.

## 5.8.115 (2026-09-02)

- Shorten native product sale badges from “Sale Price” to “Sale.”
- Lower mobile PLP image badges to clear product artwork labels near the upper edge.
- Show the native sale badge above the mobile PDP gallery while retaining its established desktop position above the product title.

## 5.8.114 (2026-09-02)

- Refine the mobile Whole House Fan Mega Sale menu into a compact two-row campaign rail and a full-width sale category shortcut.
- Remove heavy colored left-edge accents from custom sale, checkout, help-context, roof-guide and selected-accessory surfaces in favor of quiet perimeter borders.
- Retain the established blue structural rail on the full mobile navigation drawer while reserving decorative accents for badges, buttons and validation states.

## 5.8.113 (2026-08-28)

- Refine native BigCommerce sale pricing independently of Script Manager promotions.
- Replace the red sale treatment with a yellow “Sale Price” badge, a quieter original price and a stronger Solatube-blue current price.
- Use Solatube green `#556b2f` only for the confirmed PDP savings message, while keeping product-card pricing compact.

## 5.8.112 (2026-08-28)

- Fade and gently lift the PDP purchase bar into view, soften its exit, and add a small scroll buffer to prevent flicker at the trigger point.
- Simplify the Ventilation mega menu to “Shop by category,” “Ventilation,” and “Featured Ventilation Products.”
- Apply the same hierarchy to Parts & Accessories with “Featured Accessory Products,” removing duplicate popular-product labels.

## 5.8.111 (2026-08-28)

- Keep BigCommerce's native checkout coupon form visibly expanded with a generic “Have a coupon or promo code?” heading.
- Style the existing form as a compact Solatube checkout card without hardcoding a campaign, coupon code or discount amount.
- Preserve native coupon submission, validation and the existing one-control-per-viewport safeguard.

## 5.8.110 (2026-08-28)

- Make filtered PLP headings category-aware so accessory filters no longer fall back to “Solatube skylights.”
- Use accessory Type, Function and Tube Diameter facets for clear headings such as “Extension Tubes” and “10-Inch Extension Tubes,” while preserving the established skylight title rules.
- Show an accurate “All [Category]” product-listing heading on unfiltered non-skylight categories, including Parts & Accessories.

## 5.8.109 (2026-08-27)

- Keep the desktop PDP gallery sticky when the purchase bar appears on short laptop viewports, while retaining normal-scroll fallback on genuinely short screens.
- Show the live SKU below the PDP title, remove its duplicate Specifications row, and move Availability into Specifications.

## 5.8.108 (2026-08-26)

- Use the blue linked rating-and-count row on category, search and brand product grids while suppressing the duplicate legacy gold-only rating row.
- Increase product-title size from 15px to 16px on PLP and native homepage product grids without enlarging quick-search, cart, carousel or account cards.

## 5.8.107 (2026-08-26)

- Lock background page scrolling while the native Quick View modal is open and restore it when the modal closes.
- Keep PDP accessory detail and full-image modal close actions below the active Script Manager sale announcement on desktop and mobile.

## 5.8.106 (2026-08-26)

- Keep category, search and brand product-listing hover action trays inside the bottom of the product image instead of covering the title, ratings or price.
- Leave quick search, cart previews, carousels and modal cards unchanged.

## 5.8.105 (2026-08-26)

- Default the Theme Editor’s “Show Sub-Categories” left-column option to unchecked for both the base configuration and included theme variation.
- Keep the editor control available so subcategory lists can still be enabled manually without changing templates.

## 5.8.104 (2026-08-26)

- Keep homepage product-card Quick View and purchase-option trays inside the bottom of the product image on desktop hover instead of overlaying the product title, blue rating row or price.
- Apply the treatment to Featured, Most Popular and New native homepage widgets without changing category, search or quick-search cards.

## 5.8.103 (2026-08-26)

- Hide the current BigCommerce/PayPal buy-now-pay-later messaging banner from full product pages.
- Retain the legacy PayPal selector for compatibility while leaving cart, checkout, footer payment icons and other payment functionality untouched.

## 5.8.102 (2026-08-26)

- Show native star ratings and review counts on homepage Featured, Most Popular and New product cards when reviews are available.
- Place the compact review row between the product title and price, link it directly to the PDP reviews section, and use Solatube blue for filled stars, outlined empty stars and counts.
- Keep products without reviews visually clean and preserve the existing product-card rating treatment outside homepage widgets.

## 5.8.101 (2026-08-26)

- Shorten the USA header search placeholder to “Search Solatube products” while preserving “Solatube International, Inc.” as the configured store name everywhere else.
- Retain the existing store-name-based placeholder for Canada, Belgium, the UK and other storefronts.

## 5.8.100 (2026-08-26)

- Upgrade the USA Ventilation navigation item to the existing featured mega-menu design while leaving unrelated top-level categories on their current navigation treatment.
- Populate the left column from Ventilation's live child categories and retain a clear View all Ventilation link.
- Load one live product card from Solar Attic Fans, Whole House Fans and Garage Fans so all three core ventilation families are represented instead of relying on the parent category's sort order.

## 5.8.99 (2026-08-26)

- Match the Complete Your Skylight Kit heading to the Specifications heading’s body font, 19px size, 600 weight and line height while retaining the accessory eyebrow and disclosure behavior.
- Give the existing PDP review-count link a subtle underline and small downward arrow so its click/scroll purpose is visible without adding explanatory copy.
- Preserve the review count, review-writing action, native review destination and existing review expansion behavior.

## 5.8.98 (2026-08-26)

- Increase the visual prominence of the Roof Flashing option heading and replace its lone red asterisk with the clearer red “* Required” indicator.
- Scope the treatment to fields explicitly named Roof Flashing; other product options, native required semantics, validation and the roof-selection guide remain unchanged.

## 5.8.97 (2026-08-26)

- Compact the full-PDP mobile quantity area into one horizontal label/control row while retaining the large full-width Add to Cart button and its dynamic accessory/preorder wording.
- Replace the competing outlined mobile Product Question button with a centered descriptive help link and tighten the gap before Complete Your Skylight Kit.
- Preserve desktop 5.8.96 layout, original cart/contact behavior, validation, touch targets and floating purchase bar.

## 5.8.96 (2026-08-26)

- Place the existing quantity selector and Add to Cart action in one aligned desktop PDP purchase row; preserve validation, quantity controls, wallet placement and the original cart flow.
- Present Product Question as a quiet, descriptive desktop text CTA immediately below the purchase row and reduce the gap before Complete Your Skylight Kit. Keep its existing button presentation and wording on mobile.
- Scope layout changes to full desktop PDPs; quick view, mobile, floating purchase bar, contact behavior and other page types remain unchanged.

## 5.8.95 (2026-08-26)

- Compact full-PDP mobile breadcrumbs into one row with visual ellipses for long labels; retain all links, complete accessible text and unchanged breadcrumb structured data.
- Reduce mobile PDP top margin, breadcrumb padding and gallery top padding; desktop, other page types and 5.8.94 purchase-bar behavior remain unchanged.

## 5.8.94 (2026-08-26)

- Added a full-PDP-only bottom purchase bar after the original Add to Cart scrolls above the measured header, including sale-bar offsets.
- Reused the original validated form, parent-first accessory cart flow and fast-cart preview; added scoped busy/option-request guards and scroll-preserving dialog focus.
- Summarized options, quantity, selected accessory quantities and numeric selection subtotal before shipping/discounts; unresolved prices retain the native product price instead of an invented total.
- Kept all editable configuration controls in their existing location, with Edit selection and missing-choice/quantity guidance from the bar.
- Moved the desktop help FAB above the visible bar; included mobile Need help in the bar and suppressed the mobile survey tab only while it is visible. Added an eligible-only quiet PDP feedback link using the existing survey.
- Reserved gallery/footer clearance and hid the bar during dialogs, navigation/search overlays and mobile text entry. Quick view, homepage, country mappings and sale scripts remain unchanged.

## 5.8.93 (2026-08-26)

- Open Complete Your Skylight Kit and Specifications by default on desktop and mobile; both remain collapsible and no accessories are preselected.
- Removed the Description accordion control and wrapper, rendering the product's rich description, snippets and videos as regular full-width page content.
- Retained the description styling/anchor ID, schema markup, sticky gallery, warranty/related-product controls and existing country routing.

## 5.8.92 (2026-08-26)

- Moved Additional Information into a collapsed Specifications section below the kit accessories on full product pages, with custom fields before SKU/UPC.
- Added a desktop sticky image-and-thumbnail gallery bounded by the upper product row; description and subsequent content retain normal full-width flow.
- Followed the actual header/sale-bar offset and capped the image stage only when needed; narrow or very short windows retain normal scrolling.
- Preserved mobile gallery behavior, variant identifier updates, quick view, cart actions, country routing and the 5.8.91 USA launch preparation.

## 5.8.91 (2026-08-26)

- Added explicit USA mega-menu mappings for Room Size and 20-inch extension-tube inclusion filters.
- Enabled the compatible skylight accessory panel on shop.solatube.com using verified USA product IDs and native storefront option/price rendering.
- Preserved automatic 160/290 and roof-pitch matching, integrated-NightLight exclusions, and the collapsed accessory panel.
- Enabled USA Need Help/Product Question routing to Formspree xeaqjjbl and the purchase survey to xppzaagk.
- Kept Canada, Belgium and UK routing intact. Sale Script Manager and homepage content remain separate and unchanged.

## 5.8.89 (2026-08-25)

- Removed the roof-guide eyebrow on mobile and tightened the title, introduction and question spacing.
- Reduced the mobile modal's top padding without changing its images or desktop presentation.
- When the Script Manager sale announcement is active, positioned and constrained the roof guide below the sale bar.

## 5.8.88 (2026-08-25)

- Made Cell phone required in the unified Need Help and Product Question form.
- Added a required country-aware ZIP code, postal code or postcode field.
- Added the submitted postal code to the existing GTM generate_lead data layer and cleanup lifecycle.
- Kept the compact two-column contact layout on mobile.

## 5.8.87 (2026-08-25)

- Made the compressed desktop-header hamburger open the first Solatube Skylights mega menu after revealing the primary navigation.
- Kept the existing mega-menu loading, exclusive-open, outside-click and Escape behavior.
- Closed open mega menus when the desktop header compresses again, without changing mobile navigation behavior.

## 5.8.31 (2026-08-20)

- Made Canada PDP accessory recommendations infer 160 versus 290 system compatibility from the parent product name, SKU, categories and breadcrumbs.
- Selects matching 160 or 290 variants in accessory forms so the correct variant is added to cart.
- Excludes the Solar NightLight recommendation from integrated NightLight, NightLight kit and ISn-series PDPs.
- Keeps extension tubes available as optional extra length, including on kits that already contain tubes.

## 5.8.30 (2026-08-20)

- Expanded the Canada Complete your system accessory panel from product ID 53 to every PDP in the Solatube Skylights category tree.
- Used both product-category assignments and PDP breadcrumbs for robust category eligibility while leaving the accessory catalog unchanged for context-awareness testing.

## 5.8.29 (2026-08-19)

- Added dynamic PLP titles for included and excluded extension-tube filters, including detected tube lengths such as 20-inch.
- Reserved dedicated facet-header space for Clear actions so long filter titles cannot overlap them.
- Shortened the blue title eyebrow to "Showing:" so it flows naturally into every dynamic title.

## 5.8.28 (2026-08-19)

- Removed active-filter chips from the desktop and mobile dynamic title bands.
- Made the native sidebar Clear all action more prominent.
- Restyled desktop sorting as a clean single-line control.
- Preserved the two-column mobile Filter/Sort toolbar while giving the selected sort value more room.
- Replaced the heavy blue title rail with a short Solatube-blue underline accent.

## 5.8.27 (2026-08-19)

- Moved desktop PLP sorting to the upper-right of the dynamic title band.
- Reordered mobile PLP controls so the dynamic title appears before filtering and sorting.
- Combined mobile Filter and Sort controls into one compact row and reduced title/filter spacing before the product grid.
- Kept active filter chips in a compact, horizontally scrollable mobile row.

## 5.8.26 (2026-08-19)

- Removed the redundant "Click to clear this view" instruction from dynamic PLP titles.
- Removed the duplicate clear icon from the title area; labelled filter chips remain the single clear action.

## 5.8.25 (2026-08-19)

- Restyled selected PLP views as prominent, shopper-facing dynamic H2 titles instead of filter-status bars.
- Composed useful titles from all active size, fixture, NightLight, roof and extension-tube facets, avoiding unhelpful single-value headings such as No or Round.
- Made the complete dynamic title clear the current view while labelled chips beneath it remove individual filters through BigCommerce's native AJAX flow.

## 5.8.24 (2026-08-19)

- Added a compact current-view title row above filtered category product grids.
- Added friendly smaller-space and larger-space titles while retaining the precise selected tube diameter as supporting text.
- Made each complete title chip a native BigCommerce facet-removal link with a large mobile touch target and automatic AJAX synchronization.

## 5.8.23 (2026-08-19)

- Made desktop quick search, featured mega menus and standard navigation dropdowns mutually exclusive.
- Opening search now closes any pinned or hovered navigation panel.
- Opening either navigation style now closes search suggestions and any competing navigation panel.

## 5.8.22 (2026-08-19)

- Restored pointer interaction on the mobile PDP image stage only while the custom inline product video is active.
- Kept the existing mobile image zoom/navigation suppression unchanged for ordinary product images.
- Enabled the inline video's native play, pause and seek controls without changing fullscreen playback.

## 5.8.21 (2026-08-19)

- Moved the shared language-button handler into the capture phase so legacy mobile-menu propagation blocking can no longer swallow language selections.
- Corrected the mobile SERP sorter selectors to match the actual search-page form markup.
- Made the real native sort select fill the complete 48px control with aligned options, clear focus treatment and a full-width touch target.

## 5.8.20 (2026-08-19)

- Replaced the fragile mobile Google-generated language dropdown with the same custom language buttons used on desktop.
- Routed desktop and mobile selections through one cookie, label, retry and reload-fallback translation path.
- Kept Google Translate as a hidden engine and automatically closes the language disclosure after a selection.

## 5.8.19 (2026-08-19)

- Removed category and brand suggestion panels from searches that already have product results.
- Preserved category, brand, spelling and recovery suggestions for genuine zero-result searches.
- Rebuilt the mobile SERP sort control as a full-width, touch-friendly native select whose opened menu aligns with the complete field.

## 5.8.18 (2026-08-14)

- Aligned the desktop quick-search dropdown to the exact left and right edges of its search field.
- Used the flexible search-wrapper width and border-box sizing so the alignment remains correct as the header resizes.
- Preserved the existing full-width mobile search layout.

## 5.8.17 (2026-08-14)

- Made the checkout page's existing accessible title visibly display as Secure Checkout beneath the centered logo.
- Kept the order-confirmation title screen-reader-only so completed orders are not incorrectly labelled as checkout.
- Added compact, responsive heading typography using the configured optimized-checkout font and colour.

## 5.8.16 (2026-08-14)

- Replaced the English and Canadian English checkout marketing-consent copy with: Yes, email me Solatube tips, updates and occasional offers.
- Centered the checkout and order-confirmation logos at desktop and mobile sizes.
- Used BigCommerce's native checkout language override instead of rewriting the consent label with JavaScript.

## 5.8.15 (2026-08-14)

- Hid the static returning-customer sign-in prompt while preserving BigCommerce customer authentication and wallet checkout behaviour.
- Restyled the native checkout coupon disclosure as a clear, full-width control with a Coupon label, blue chevron and visible hover, focus and expanded states.
- Kept the changes CSS-only so native coupon validation, order calculations and payment handling remain untouched.

## 5.8.14 (2026-08-14)

- Made both accessory images and Details links open the accessory information popover.
- Rebuilt the small text tooltip as a larger product-detail card with a substantially larger image, accessory name and the existing descriptive copy.
- Added a visible close control, accessible dialog relationships, click-away and Escape dismissal.
- Preserved viewport-aware placement and added a compact mobile layout with enlarged imagery.

## 5.8.13 (2026-08-14)

- Converted the two featured top-navigation category links into accessible mega-menu disclosure buttons; category navigation remains available through each panel's View All link.
- Added 350 ms hover intent, 300 ms delayed closing, click-to-pin, click-outside closing and Escape focus return for desktop mega menus.
- Made the entire featured category control expand and collapse on mobile instead of requiring a precise chevron tap.
- Changed search headings and live announcements to report product results rather than the combined product-and-content count.
- Limited BigCommerce's Did You Mean suggestion to genuine zero-product searches, retaining useful typo recovery without distracting from valid product matches.

## 5.8.12 (2026-08-14)

- Reduced quick-search debounce from 1.2 seconds to 300 milliseconds and added a visible loading state.
- Prevented stale search responses and cleared obsolete results when the query drops below three characters.
- Replaced full product cards with a compact five-product result list showing image, name and price.
- Added a persistent view-all action, wider desktop panel and viewport-safe mobile layout.
- Added keyboard navigation, Escape handling and combobox/listbox accessibility attributes.
- Added guided links for skylight kits, extension tubes, NightLight kits and parts/accessories.

## 5.8.11 (2026-08-14)

- Replaced the navy footer reassurance bar with a light grey treatment, dark text and Solatube-blue check accents.

## 5.8.10 (2026-08-14)

- Restored Solatube blue as the primary footer colour and moved navy to the slim reassurance bar.
- Reset inherited Cornerstone percentage widths and forced word-breaking so footer headings and links render at their intended column widths.
- Reduced footer spacing for a shorter, cleaner presentation.

## 5.8.9 (2026-08-14)

- Rebuilt the footer with a compact reassurance strip, stronger navigation hierarchy, consistent social icons and a cleaner payment/legal bar.
- Removed the storefront address so the unified theme does not display the USA address on non-USA storefronts.
- Retained storefront-managed category, information, social, phone, payment and copyright content.

## 5.8.8 (2026-08-14)

- Changed the exposed left rail of the open mobile menu from translucent grey to Solatube blue.

## 5.8.7 (2026-08-13)

- Keep the purchased skylight kit as the featured item in the fast-cart modal when accessories are added with it.
- Reduced the accessory quantity selector width so it clears the two-column card divider.

## 5.8.6 (2026-08-13)

- Replaced the mobile browser's inconsistent native quantity-select rendering with a theme-controlled chevron and explicit selected-number styling.
- Replaced the orange native focus ring with a subtle, accessible Solatube-blue focus state.

## 5.8.5 (2026-08-13)

- Made accessory detail tooltips viewport-aware so they open above or below based on available space.
- Clamped tooltip positioning inside desktop and mobile viewport edges and removed panel clipping.
- Close open accessory details during scrolling or resizing to prevent detached tooltip placement.
- Widened and restyled accessory quantity selectors so the selected number remains visible on desktop and mobile.

## 5.8.4 (2026-08-13)

- Fixed accessory quantity controls so only the extension tube selector is visible and it fits inside the compact card.
- Removed accessory PDP navigation from card images, names and details links.
- Replaced "Learn more" links with accessible in-card detail tooltips containing expanded accessory explanations.

## 5.8.3 (2026-08-13)

- Expanded the Canada PDP cross-sell panel to the full product-details width instead of inheriting the narrower Add to Cart width.
- Reworked accessories into a compact two-column grid with shorter merchandising names and reduced vertical space.
- Kept the test limited to the Canada 10-inch skylight kit PDP and retained single-column accessory rows on small phones.

## 5.8.2 (2026-08-13)

- Added a compact "Complete your system" cross-sell selector to the Canada 10-inch Solatube skylight kit PDP.
- Accessory cards load through BigCommerce storefront rendering so channel currency, current prices, images and product option values stay native.
- Added the selected 10-inch extension tube, NightLight, electric light add-on and daylight dimmer as separate cart line items after the skylight.
- Kept the test isolated to `solatubeshop.ca` product 53 so the unified theme can be safely evaluated before broader rollout.

## 5.8.1 (2026-08-13)

- Fixed featured mega-menu price extraction for both VAT-inclusive and tax-exclusive storefront markup.

## 5.8.0 (2026-08-13)

- Established one unified theme baseline for the USA, Canada, Belgium, and UK storefronts.
- Added explicit `shop.solatube.com` detection while retaining the existing generic USA facet fallback until its dedicated mapping is defined.
- Retained store-aware featured mega-menu behavior for `solatubeshop.ca`, `solatubeshop.be`, and `solatubedirect.co.uk`.
- Standardized the refined free-shipping badge, hidden PDP PayPal messaging, and hidden PDP social sharing across storefronts.
- Kept the homepage carousel disabled by default.
- Included the UK curated filter landings and Roof Tile Type selection guide introduced after 5.7.7.

## 5.7.7 (2026-08-12)

- Reused the same loaded video element in the mobile full-screen viewer instead of creating a second player.
- Prevented a rejected mobile play request from leaving a misleading frozen pause control.
- Started video when users navigate to its second-position slot in the full-screen gallery.
- Kept desktop native video full screen and the image lightbox behavior unchanged.

## 5.7.6 (2026-08-12)

- Made the custom expand button use the active video element's native full-screen mode.
- Preserved the exact player, timestamp, playback state, and native controls when expanding video.
- Declared custom-field video sources explicitly as `video/mp4` for stricter mobile browsers.
- Added iOS inline-video attributes and metadata preloading to improve physical-device playback.

## 5.7.5 (2026-08-11)

- Preserved the active video's timestamp when opening the custom full-screen viewer.
- Preserved playing or paused state, volume, mute setting, and playback speed.
- Returned the updated video state to the inline player when the custom viewer closes.

## 5.7.4 (2026-08-11)

- Centered the yellow video play button over the poster thumbnail.
- Removed the duplicate first image from the full-screen media sequence.
- Kept the custom-field video in position 2 in both the thumbnail gallery and full-screen viewer.

## 5.7.3 (2026-08-11)

- Synchronized the PDP video gallery styles into BigCommerce's precompiled theme stylesheet.
- Restored the designed poster thumbnail, yellow play icon, video badge, inline player, and mixed-media lightbox styling.
- Retained the Solatube blue optimized checkout button treatment from 5.7.2.

## 5.7.2 (2026-08-11)

- Replaced the checkout button red with Solatube blue.
- Set checkout primary buttons to blue with white text, changing to white with blue text and border on hover.
- Kept the PDP video gallery feature and version visible in the BigCommerce theme name.

## 5.7.1 (2026-08-11)

- Kept the version and feature update visible in the BigCommerce theme name.
- Updated optimized checkout primary buttons to use a red background with white text.
- Updated the checkout hover state to a white background with red text and border for clear contrast.

## 5.7.0 (2026-08-11)

- Added a custom-field-driven MP4 video as the second product gallery item.
- Added video support to the product gallery thumbnails and full-screen viewer.

## 5.2.2 ( 2024-03-31 )
- Fixed additonal Script Tag bug in base.html

## 5.2.1 ( 2024-03-31 )
- Fixed Script Tag Bug in base.html

## 5.2.0 ( 2024-03-26 )
- Added the "nonce" handlebar to the Script Tag

## 5.2.0 ( 2024-03-26 )
- Added the "nonce" handlebar to the Script Tag

## 5.1.0 ( 2024-05-21 )

- Implemented the Wallet Payment Buttons & Settings
- Modified the "Add To Cart" section to stack vertically.
- Fixed issue with Collapsed By Default filter setting not working.
- Fixed issue with Store Logo disappearing on Checkout Page.
- Fixed issue with Share feature on Product Detail Page
- Fixed issue with Variant Pricing Display when Variant Price had Sale Value
- Fixed Consent Banner not displaying when the Store Language was set to Italian
- Updated Twitter Logo to X logo in Footer
- Updated Twitter Logo to X logo in Share Icons
- Additional Theme Settings
- - Hide Physical Dimensions
  - Hide Newsletter Signup in Footer

## 5.0.0 (2023-8-1)

- Upgraded the theme to work with Node 18 
- Bump Stencil utils to 6.15.1 and other packages to match Cornerstone v6.12.0
- Updated Webpack config to work with updated packages 

## 4.2.1 (2022-5-17)
- Changed css variables for grid to use 'percentage()'
- Included missing css for sale flags
- Removed schema translation file that had been added from last merge with cornerstone. This feature is not currently supported by Roots
- Added option to customize the bg color of the sale badge on card hover

## 4.2.0 (2022-3-28)
- Fixed alignment of thumbnails on product pages
- Merged changes from Cornerstone v6.3.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/6.2.0...6.3.0

## 4.1.2 (2022-3-2)
- Center aligned newsletter summary text in footer
- Added setting to customize top & bottom border of main navigation

## 4.1.1 (2022-1-28)
- Removed duplicate display of MSRP price
- Updated theme setting "Brand Thumbnail" to control brand logo size on individual brand pages
- Updated "Payment Buttons" theme style settings

## 4.1.0 (2022-1-20)
- Fixed special characters display in description area of compare page
- Modified logo size styles on optimized checkout page
- Added option to theme styles to exclude quantity box in add to cart panel
- Fixed visibility of "Show More" link in mobile filters
- Fixed overlapping "Close to view results" link in mobile filters when no subcategories exist
- Updated footer payment logo for Klarna
- Fixed review popup functionality when clicking on link in "invitation to review products" email
- Fixed "undefined" error in bulk pricing display for non-english storefronts
- Merged changes from Cornerstone v6.2.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/6.1.1...6.2.0

## 4.0.2 (2021-11-17)
- Fixed broken "Show More" link in facets menu
- Made mini cart close on screen re-size to avoid visual placement issues on re-size
- Fixed mobile mini cart placement issues
- Fixed color of mini cart close 'x' button - was previously the same color as the background

## 4.0.1 (2021-10-14)
- Fixed product card hover display of quick view and add to cart buttons

## 4.0.0 (2021-10-6)
- Gave body initial padding top to eliminate CLS issues on page load (desktop & mobile)
- Made mobile quick search results dropdown scrollable
- Merged changes from Cornerstone v6.1.1 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/5.7.0...6.1.1
- Prevented window from zooming when interacting with inputs

## 3.5.3 (2021-9-20)
- Stopped header nav "person" icon from changing color when hovering over account links
- Modified mobile navigation display of account links
- Increased width of product name container inside mobile add to cart modal
- Fixed search query text "# RESULTS FOR { SEARCH_QUERY }" on search results page

## 3.5.2 (2021-8-18)
- Modified footer "Built by" text to "Theme by"
- Fixed social share links for product pages and blog posts

## 3.5.1 (2021-8-6)
- Fixed display of apostrophes in card stock message
- Fixed toggle functionality of custom filters containing special characters
- Added scroll bar to quick search results dropdown

## 3.5.0 (2021-7-8)
- Removed "Shop By Price" sidebar panel when BigCommerce filters are enabled. This panel doesn't work properly when filters are enabled.
- Removed empty "Shopping Cart & Checkout" section from theme editor
- Merged changes from Cornerstone v5.7.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/5.6.0...5.7.0

## 3.4.0 (2021-6-15)
- Merged changes from Cornerstone v5.6.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/5.5.0...5.6.0
- Fixed button align in add to cart pop up


## 3.3.0 (2021-6-14)
- Fixed compare page close (x) button display
- Merged changes from Cornerstone v5.5.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/5.4.0...5.5.0

## 3.2.3 (2021-5-21)
- Fixed position of quick search result images to be contained within bounding border
- Removed theme editor settings for geotrust SSL - this is replaced by the new footer global region for adding in security seals

## 3.2.2 - (2021-5-17)
- Fixed card link from extending past visual border

## 3.2.1 - (2021-5-11)
- Made quick search stock badge smaller
- Adjusted alignment of "Out of Stock" button on product pages
- Fixed position of product images on compare page
- Fixed console bug happening on stores not using the homepage carousel builder

## 3.2.0 - (2021-5-4)
- Fixed pagination display on account orders page
- Adjusted wishlist dropdown display so it's no longer getting cut off
- Adjusted clickable area for hamburger icon
- Merged changes from Cornerstone v5.4.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/5.3.0...5.4.0

## 3.1.7 - (2021-4-26)
- Set carousel to auto scroll

## 3.1.6 - (2021-4-22)
- Fixed issue where carousel slides were getting cut off
- Center aligned social icons in mobile footer
- Fixed spacing between add to cart button and wish list button on responsive product page

## 3.1.5 - (2021-4-8)
- Fixed content width of search results page when filters are disabled / no sidebar present
- Fixed placement of 'x' in mobile search results dropdown
- Removed scroll bar for text logos on desktop

## 3.1.4 - (2021-4-1)
- Added toggle in theme editor for element focus outline

## 3.1.3 - (2021-4-1)
- Moved social icons below ATC when wishlist is disabled

## 3.1.2 - (2021-3-31)
- Left aligned page breadcrumbs
- Fixed underline width in navigation dropdowns
- Adjusted position of cart preview on mobile
- Fixed ATC button on mobile not clickable when wishlist not enabled

## 3.1.1 - (2021-3-26)
- Fixed long page bug when there is a long list of "Product Pick List" options

## 3.1.0 - (2021-3-25)
- Fixed display of apostrophes in brand names on brand pages
- Fixed "News & Information" tab visibility on search results page
- Merged changes from Cornerstone v5.3.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/5.1.0...5.3.0 

## 3.0.7 - (2021-3-15)
- Fixed display issue with mobile logo when size set to display as "Original (as uploaded)"
- Hide Add to Cart button for catalogue only items
- Fixed image display on brands page

## 3.0.6 - (2021-3-10)
- Fixed issue with stacking carousel slides

## 3.0.5 - (2021-3-8)
- version bump

## 3.0.4 - (2021-3-8)
- Fixed aria label on carousel arrows
- Fixed horizontal scroll on home page caused by carousel
- Fixed outline display on logo focus

## 3.0.3 - (2021-3-8)
- Fixed carousel visibility issue

## 3.0.2 - (2021-02-23)
- Fixed duplicate "Show Subcategories" button on mobile category pages when filters are disabled. 

## 3.0.1 - (2021-02-16)
- Updated theme verticals
- Fixed SKU bug where if base product didn't have an assigned SKU then the SKU wouldn't show even after selecting a variant with an assigned SKU. 
- Fixed PDP display in IE 11

## 3.0.0 - (2021-02-5)
- Fixed comparison feature functionality after selecting a product filter.
- Merged changes from Cornerstone v5.1.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/4.9.0...5.1.0 

## 2.8.8 - (2021-01-31)
- Fixed add to cart button issue where the button was hidden if the default option was out of stock but then wouldn't re-appear if an in stock combination was selected. 

## 2.8.7 - (2021-01-20)
- Removed all instances of "Created with Sketch" text from theme icons.
- Adjusted position of carousel text on tablet size devices.

## 2.8.6 - (2020-12-31)
- Modified position of page builder block at the bottom of category pages to avoid displaying beside pagination.

## 2.8.5 - (2020-12-8)
- Fixed bulk pricing table display to improve visual jump

## 2.8.4 - (2020-11-19)
- Fixed alignment of navigation links

## 2.8.3 - (2020-10-23)
- Fixed required "*" showing on optional product option labels

## 2.8.2 - (2020-10-22)
- Fixed category sidebar logic
- Modified order confirmation page styles
- Added setting to customize header 'hamburger' icon on desktop
- Fixed "Shop By Price" block visibility
- Fixed sticky header functionality when BigCommerce admin bar is present
- Fixed text logo getting cut off on mobile
- Added global region to header for page builder
- Fixed alignment of strikethrough on out of stock options

## 2.8.1 - (2020-09-9)
- Hotfix for carousel button. Previously the button wouldn't show unless a heading or text was also entered - it is now setup to show even if no other text is added in the carousel builder. 

## 2.8.0 - (2020-09-9)
- Merged changes from Cornerstone v4.9.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/4.7.0...4.9.0 

## 2.7.2 - (2020-09-02)
- Added option to change the background color of the grid blocks

## 2.7.1 - (2020-08-25)
- Fixed empty left column in deepest category level.

## 2.7.0 - (2020-07-14)
- Fixed display of special characters in reviewers names
- Fixed display of filters on mobile search results page
- Merged changes from Cornerstone v4.7.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/4.6.1...4.7.0

## 2.6.2 - (2020-06-10)
- Formatting adjustment to order confirmation page when using one page checkout (not optimized checkout)

## 2.6.1 - (2020-06-10)
- Removed empty left column when shop by price is enabled and only one product is visible in a category
- Removed schema translation file that had been added from last merge with cornerstone. This feature is not currently supported by Roots

## 2.6.0 - (2020-05-29)
- Added page builder regions to category-nofilters template
- Fixed special character display in search results heading
- Fixed stock display when set on the variant level
- Fixed visibility of price in quick search results when login for pricing is enabled. Previously would show "Login for price" even when a customer was logged in
- Merged changes from Cornerstone v4.6.1 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/4.5.0...4.6.1

## 2.5.6 - (2020-05-19)
- Fixed placement of page builder region on mobile product page

## 2.5.5 - (2020-05-19)
- Fixed accordion (show/hide) functionality on category filters
- Updated currency dropdown background on mobile to inherit from navigation background setting
- Fixed quick search bug on mobile where the input box would disappear after clicking into it. This was caused by the screen re-size triggered by the mobile keyboard appearing.

## 2.5.4 - (2020-05-08)
- Removed "responsive" option from Payment Buttons "Button size". This option breaks the display of the payment icons and causes them to get cut off.
- Fixed bug on category page where empty left column would show when filters were turned off, and subcategories and shop by price were disabled for the left column. Now the product grid will take up the full width when the left column is empty.
- Fixed alignment of quantity label on mobile product page.
- Fixed display of special characters in logged in customers address display and product options display on cart page.
- Fixed display of "Shop by price" on mobile

## 2.5.3 - (2020-04-29)
- Fixed visibility of price in related products block when login for pricing is enabled. Previously would show "Login for price" even when a customer was logged in. 

## 2.5.2 - (2020-04-27)
- Updated theme editor setting options for # of products per page to max out at 100. This is to reflect the limitations of BigCommerce.
- Removed page builder region from sticky header

## 2.5.1 - (2020-04-09)
- Fixed build errors relating to schema

## 2.5.0 - (2020-04-09)
- Fixed bug on product page in firefox where buy block would wrap below main image if image size was less than 60% wide.
- Fixed left column shop by price block. Previously wasn't possible to enable.
- Merged changes from Cornerstone v4.5.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/4.4.0...4.5.0

## 2.4.2 - (2020-03-16)
- Fixed bug with theme editor option "# of Product Reviews" where dimensions were shown instead of numbers

## 2.4.1 - (2020-03-11)
- Fixed bug where product card expanded on hover even when no action button or quick view button were enabled.
- Fixed text logo bug where text would wrap onto multiple lines before taking up full width of logo container.
- Fixed brands grid display bug in safari where first row would show 3 and second row would show 4.
- Updated color of "show more" link in sidebar filters to match general site link color.

## 2.4.0 - (2020-02-13)
- Increased width of page content on contact us page so content entered in WISIWYG is the full width of the site.
- Fixed bug where product weight data on PDP was not reflecting variant weights when selected
- Fixed schema markup for description and sku data on the PDP
- Merged changes from Cornerstone v4.4.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/4.3.1...4.4.0

## 2.3.0 - (2020-01-21)
- Fixed styles for order confirmation page "See Details" modal on mobile. Previously the content wasn't visible when this modal was triggered.
- Font size of home page product block headings are now controlled by the theme editor setting for h2 elements.
- Fixed product page thumbnail bug where tall narrow images displayed taller than their containing box.
- Merged changes from Cornerstone v4.3.1 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/4.2.1...4.3.1
- Fixed bug with pre-order message displaying as "undefined undefined"

## 2.2.1 - (2019-12-09)
- Removed "Description" heading on product page when no description or videos exist. Previously would always show even when description field was empty.
- Fixed pricing issue where default price wasn't matching the default variant price.
- Removed black background from mobile carousel when no text is added the the slide.
- Scroll to top of option form when action button is clicked. This ensures that any error messages on options are visible.
- Removed height restrictions on carousel slides.

## 2.2.0 - (2019-11-13)
- Merged changes from Cornerstone v4.2.1 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/4.1.0...4.2.1
- Fixed navigation bug where the dropdown would start with a blank column. This would happen if the first subcategory group contained more links than the number set in the theme editor setting for "Number of links per column in dropdowns".
- Fixed bug with product images where main image wouldn't update after selecting an option whose rule changed the main image.
- Show brands in simple list on /brands/ page if no brands have been assigned an image. Previously always showed "image coming soon" even when no brands had an image.

## 2.1.1 - (2019-09-25)
- Hotfix for un-functional add to cart button on mobile product page.

## 2.1.0 - (2019-09-18)
- Fixed social share button links. Previously information parameters weren't being passed properly.
- Reverted to previous lazy load functionality where a spinner is shown while images load instead of a blurry version of the image. 

## 2.0.1 - (2019-09-16)
- Fixed issue where buy block would wrap below product image block (safari specific)
- Added visibility settings for Amazon Pay & Google Pay footer icons
- Added back apple Pay icon to footer - was erroneously removed in last update
- User nav icons now inherit their color from the nav user link setting in the theme editor

## 2.0.0 - (2019-09-11)
- Merged changes from Cornerstone v4.1.0 See version comparison here: https://github.com/bigcommerce/cornerstone/compare/3.2.0...4.1.0
- Fixed issue where buy block would wrap below product image block
- Fixed issue where quantity wouldn't update when manually entered on cart page

## 1.0.5 (2019-09-03)
- Hotfix for product options overlapping product specs on mobile

## 1.0.4 (2019-08-29)
- Hotfix for product page display when using Yotpo reviews. Had been showing Yotpo reviews on same row as product image and buy block causing everything to be squished and unusable. 
- Added theme editor option to control number of recent posts to display on home page. Previously you were unable to remove this section using theme settings.
- Fixed modal display on mobile. Previously the modals would display too low on the screen and the content wouldn't be visible.

## 1.0.3 (2019-08-27)
- Modified default number of blog posts that display per page to 6. This lines up better with the theme structure which displays 3 per row.
- Added store design setting for number of blog posts to display per page so it can be modified by users. 
- Fixed visual bug of card image border caused by last update. 

## 1.0.2 (2019-08-20)
- Adjusted placement of card image border to be attached to image instead of image container
- Fixed social share icon link color on hover. Previously had been set to white, now inherits from general link color and general link hover color. 

## 1.0.1 (2019-08-15)
- Updated support e-mail

## 1.0.0 (2019-08-13)
- First publish ready version of Roots

## 0.1.3 (2019-08-08)
- Updated config.json meta information

## 0.1.2 (2019-07-24)
- Adjusted default logo size
- Fixed 'as uploaded' logo option bug where logo didn't line up with left side of nav

## 0.1.1 (2019-07-9)
- Added theme editor setting for text logo font size on mobile
- Added ellipsis on text logo on mobile to prevent overlap on menu and cart logos
- Fixed logo from getting cut off when "optimized for theme" sizing selected

## 0.1.0 (2019-06-27)
- General testing and refinements
- First official version for review

## 0.0.0
- Initial version of Roots for review
