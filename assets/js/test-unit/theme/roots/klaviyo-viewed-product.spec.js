import trackKlaviyoViewedProduct from '../../../theme/roots/klaviyo-viewed-product';

describe('Klaviyo Viewed Product tracking', () => {
    beforeEach(() => {
        window._learnq = [];
    });

    it('queues Viewed Product and viewed-item events', () => {
        const product = {
            ProductName: 'Brighten "Up" Kit',
            ProductID: 123,
            SKU: 'KIT-123',
            Categories: ['Daylighting', 'Kits'],
            ImageURL: 'https://cdn.example.com/product.jpg',
            URL: 'https://example.com/product/',
            Brand: 'Solatube',
            Price: 299.95,
            CompareAtPrice: 349.95,
        };

        trackKlaviyoViewedProduct(product);

        expect(window._learnq).toEqual([
            ['track', 'Viewed Product', product],
            ['trackViewedItem', {
                Title: product.ProductName,
                ItemId: product.ProductID,
                Categories: product.Categories,
                ImageUrl: product.ImageURL,
                Url: product.URL,
                Metadata: {
                    Brand: product.Brand,
                    Price: product.Price,
                    CompareAtPrice: product.CompareAtPrice,
                },
            }],
        ]);
    });

    it('does not queue an event without a product ID', () => {
        trackKlaviyoViewedProduct({ ProductName: 'Missing ID' });

        expect(window._learnq).toEqual([]);
    });
});
