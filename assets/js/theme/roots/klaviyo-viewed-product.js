/**
 * Queue Klaviyo's standard Viewed Product and viewed-item events.
 * Klaviyo's BigCommerce integration loads the onsite script separately; the
 * queue allows these events to be registered before that script is ready.
 */
export default function trackKlaviyoViewedProduct(product) {
    if (!product || !product.ProductID) return;

    window._learnq = window._learnq || [];
    window._learnq.push(['track', 'Viewed Product', product]);
    window._learnq.push(['trackViewedItem', {
        Title: product.ProductName,
        ItemId: product.ProductID,
        Categories: product.Categories || [],
        ImageUrl: product.ImageURL,
        Url: product.URL,
        Metadata: {
            Brand: product.Brand,
            Price: product.Price,
            CompareAtPrice: product.CompareAtPrice,
        },
    }]);
}
