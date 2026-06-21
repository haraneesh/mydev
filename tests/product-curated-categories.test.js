import assert from 'assert';
import constants from '../imports/modules/constants';
import { toggleCuratedCategory } from '../imports/modules/productCuratedCategories';
import Products from '../imports/api/Products/Products';
import ProductLists from '../imports/api/ProductLists/ProductLists';
import { Orders } from '../imports/api/Orders/Orders';
import { displayProductsByType } from '../imports/ui/components/Orders/ProductsOrderCommon/ProductsOrderCommon';

const baseProduct = {
  _id: 'test-product-id',
  sku: 'TEST001',
  name: 'Test Product',
  unitOfSale: 'kg',
  unitprice: 100,
  wSaleBaseUnitPrice: 90,
  unitsForSelection: '0,1,2',
  type: constants.ProductTypeName.Dhals.name,
  category: 'lentils',
  vendor_details: {
    id: 1,
    slug: 'test-vendor',
    name: 'Test Vendor',
  },
};

const getProduct = (overrides = {}) => ({
  ...baseProduct,
  ...overrides,
});

const displayProductGroups = (productOverrides = {}, options = {}) =>
  displayProductsByType({
    products: {
      [baseProduct._id]: getProduct(productOverrides),
    },
    isMobile: true,
    isAdmin: false,
    isShopOwner: false,
    updateProductQuantity: () => {},
    isDeliveryInChennai:
      options.isDeliveryInChennai === undefined
        ? true
        : options.isDeliveryInChennai,
  });

describe('product curated categories', function () {
  it('validates products without curated categories', function () {
    assert.doesNotThrow(() => Products.schema.validate(getProduct()));
  });

  it('validates products with one curated category', function () {
    assert.doesNotThrow(() =>
      Products.schema.validate(
        getProduct({
          curatedCategories: [
            constants.ProductCuratedCategory.proteinRich.name,
          ],
        }),
      ),
    );
  });

  it('validates products with multiple curated categories', function () {
    assert.doesNotThrow(() =>
      Products.schema.validate(
        getProduct({
          curatedCategories: constants.ProductCuratedCategory.names,
        }),
      ),
    );
  });

  it('rejects unknown curated categories', function () {
    assert.throws(() =>
      Products.schema.validate(
        getProduct({
          curatedCategories: ['unknownCategory'],
        }),
      ),
    );
  });

  it('validates product-list snapshots with curated categories', function () {
    assert.doesNotThrow(() =>
      ProductLists.schema.validate({
        _id: 'test-product-list-id',
        activeStartDateTime: new Date('2026-06-19T00:00:00.000Z'),
        activeEndDateTime: new Date('2026-06-20T00:00:00.000Z'),
        products: [
          {
            ...getProduct({
              curatedCategories: [
                constants.ProductCuratedCategory.gutHealth.name,
              ],
            }),
            totQuantityOrdered: 0,
          },
        ],
      }),
    );
  });

  it('validates order product snapshots with curated categories', function () {
    assert.doesNotThrow(() =>
      Orders.schema.validate({
        expectedDeliveryDate: new Date('2026-06-20T00:00:00.000Z'),
        products: [
          {
            ...getProduct({
              curatedCategories: constants.ProductCuratedCategory.names,
            }),
            quantity: 1,
          },
        ],
        customer_details: {
          role: constants.Roles.customer.name,
          _id: 'test-customer-id',
          name: 'Test Customer',
          mobilePhone: 9999999999,
          deliveryAddress: 'Test Address',
        },
        order_status: constants.OrderStatus.Saved.name,
        total_bill_amount: 100,
        productOrderListId: 'test-product-list-id',
        deliveryPincode: '600001',
      }),
    );
  });

  it('toggles curated categories without losing existing categories', function () {
    const withProtein = toggleCuratedCategory(
      [],
      constants.ProductCuratedCategory.proteinRich.name,
    );
    assert.deepStrictEqual(withProtein, [
      constants.ProductCuratedCategory.proteinRich.name,
    ]);

    const withBoth = toggleCuratedCategory(
      withProtein,
      constants.ProductCuratedCategory.gutHealth.name,
    );
    assert.deepStrictEqual(withBoth, [
      constants.ProductCuratedCategory.proteinRich.name,
      constants.ProductCuratedCategory.gutHealth.name,
    ]);

    const withoutProtein = toggleCuratedCategory(
      withBoth,
      constants.ProductCuratedCategory.proteinRich.name,
    );
    assert.deepStrictEqual(withoutProtein, [
      constants.ProductCuratedCategory.gutHealth.name,
    ]);
  });

  it('groups protein rich products additively', function () {
    const productGroups = displayProductGroups({
      curatedCategories: [constants.ProductCuratedCategory.proteinRich.name],
    });

    assert.strictEqual(productGroups.productProteinRich.length, 1);
    assert.strictEqual(productGroups.productDhals.length, 1);
    assert.strictEqual(productGroups.productGutHealth.length, 0);
  });

  it('groups gut health products additively', function () {
    const productGroups = displayProductGroups({
      curatedCategories: [constants.ProductCuratedCategory.gutHealth.name],
    });

    assert.strictEqual(productGroups.productGutHealth.length, 1);
    assert.strictEqual(productGroups.productDhals.length, 1);
    assert.strictEqual(productGroups.productProteinRich.length, 0);
  });

  it('groups multiply tagged products into both health shelves', function () {
    const productGroups = displayProductGroups({
      curatedCategories: constants.ProductCuratedCategory.names,
    });

    assert.strictEqual(productGroups.productProteinRich.length, 1);
    assert.strictEqual(productGroups.productGutHealth.length, 1);
    assert.strictEqual(productGroups.productDhals.length, 1);
  });

  it('does not put untagged products in health shelves', function () {
    const productGroups = displayProductGroups();

    assert.strictEqual(productGroups.productProteinRich.length, 0);
    assert.strictEqual(productGroups.productGutHealth.length, 0);
    assert.strictEqual(productGroups.productDhals.length, 1);
  });

  it('increments health shelf metadata for selected quantities', function () {
    const productGroups = displayProductGroups({
      curatedCategories: constants.ProductCuratedCategory.names,
      quantity: 2,
    });

    assert.strictEqual(
      productGroups.productGroupMetaHash.productProteinRich.orderedItemCount,
      1,
    );
    assert.strictEqual(
      productGroups.productGroupMetaHash.productGutHealth.orderedItemCount,
      1,
    );
  });

  it('keeps special produce hidden outside Chennai', function () {
    const productGroups = displayProductGroups(
      {
        type: constants.ProductTypeName.Fruits.name,
        displayAsSpecial: true,
        curatedCategories: [constants.ProductCuratedCategory.proteinRich.name],
      },
      {
        isDeliveryInChennai: false,
      },
    );

    assert.strictEqual(productGroups.productSpecials.length, 0);
    assert.strictEqual(productGroups.productProteinRich.length, 0);
    assert.strictEqual(productGroups.productFruits.length, 0);
  });
});
