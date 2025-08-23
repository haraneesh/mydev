const Sort = {
  ASCENDING: 1,
  DESCENDING: -1,
};

const ControlStates = {
  edit: ' EDIT ',
  view: ' VIEW ',
};

const DifficultyLevels = ['Easy', 'Moderate', 'Hard'];
const RecipeCat = {
  breakfast: { name: 'breakfast', displayName: 'BreakFast' },
  plantmilk: { name: 'plantmilk', displayName: 'Plant Milk' },
  beverage: { name: 'beverage', displayName: 'Beverages / Smoothies' },
  salad: { name: 'salad', displayName: 'Salads' },
  side: { name: 'side', displayName: 'Sides / Snack' },
  soup: { name: 'soup', displayName: 'Soups' },
  chutney: { name: 'chutney', displayName: 'Chutney / Sauce' },
  maincourse: { name: 'maincourse', displayName: 'Main Course' },
  dessert: { name: 'dessert', displayName: 'Desserts' },
  diabetic: { name: 'diabetic', displayName: 'Diabetic Friendly' },
  pregnancy: { name: 'pregnancy', displayName: 'Healthy Pregnancy' },
};

RecipeCat.names = Object.keys(RecipeCat).map((cat) => RecipeCat[cat].name);
RecipeCat.displayNames = Object.keys(RecipeCat).map((cat) => RecipeCat[cat].displayName);
RecipeCat.viewNames = ['breakfast', 'plantmilk', 'beverage'];

const FoodGroups = {
  greens: { name: 'greens', displayName: 'Greens' },
  root: { name: 'root', displayName: 'Root' },
  gourds: { name: 'gourds', displayName: 'Gourds' },
  beans: { name: 'beans', displayName: 'Beans' },
  reds: { name: 'reds', displayName: 'Reds' },
  digestive: { name: 'digestive', displayName: 'Digestive' },
};

const PackingPreferences = {
  paperOnly: { name: 'paperOnly', displayName: 'Paper Only' },
  polythene: { name: 'polythene', displayName: 'Polythene Only' },
  noPacking: { name: 'noPacking', displayName: 'Avoid Packing' },
  noPreference: { name: 'noPreference', displayName: 'Any (Paper or Polythene)' },
};
PackingPreferences.names = Object.keys(PackingPreferences).map((cat) => PackingPreferences[cat].name);

const ProductUpdatePreferences = {
  sendMeProductPhotosOnWhatsApp: { name: 'sendMeProductPhotosOnWhatsApp', displayName: 'Send me product photos on WhatsApp' },
  dontSendMeProductPhotosOnWhatsApp: { name: 'dontSendMeProductPhotosOnWhatsApp', displayName: "Don't send me product photos on WhatsApp" },
};
ProductUpdatePreferences.names = Object.keys(ProductUpdatePreferences).map((cat) => ProductUpdatePreferences[cat].name);

FoodGroups.names = Object.keys(FoodGroups).map((cat) => FoodGroups[cat].name);
FoodGroups.displayNames = Object.keys(FoodGroups).map((cat) => FoodGroups[cat].displayName);

const DietaryPreferences = {
  vegan: { name: 'vegan', display_value: 'Vegan' },
  vegetarian: { name: 'vegetarian', display_value: 'Vegetarian' },
  nonVeg: { name: 'nonVeg', display_value: 'Non Vegetarian' },
};
DietaryPreferences.names = Object.keys(DietaryPreferences).map((cat) => DietaryPreferences[cat].name);
DietaryPreferences.displayNames = Object.keys(DietaryPreferences).map((cat) => DietaryPreferences[cat].displayName);

// This for organizing tabs in the order screen
// const ProductType = ['Vegetables', 'Fruits', 'Greens', 'Rice', 'Wheat', 'Cereals', 'Millets', 'Dhals', 'Sweetners', 'Spices', 'Oils', 'Eggs', 'Flours', 'DryFruits', 'Nuts', 'Millets', 'Beauty', 'Disposables'];

const ProductTypeName = {
  New: {
    name: 'New',
    display_value: 'New',
  },
  Vegetables: {
    name: 'Vegetables',
    display_value: 'Vegetables',
  },
  Fruits: {
    name: 'Fruits',
    display_value: 'Fruits',
  },
  Greens: {
    name: 'Greens',
    display_value: 'Leafy Greens',
  },
  Rice: {
    name: 'Rice',
    display_value: 'Rice & Products',
  },
  Wheat: {
    name: 'Wheat',
    display_value: 'Wheat & Products',
  },
  /*
  Cereals: {
    name: 'Cereals',
    display_value: 'Minor Millets & Cereals',
  },
  */
  Millets: {
    name: 'Millets',
    display_value: 'Millets & Products',
  },
  Dhals: {
    name: 'Dhals',
    display_value: 'Dals & Lentils',
  },
  Sweetners: {
    name: 'Sweetners',
    display_value: 'Sugars, Jaggery & Honey',
  },
  Salts: {
    name: 'Salts',
    display_value: 'Salts',
  },
  Spices: {
    name: 'Spices',
    display_value: 'Spices, Whole and Powders',
  },
  Nuts: {
    name: 'Nuts',
    display_value: 'Nuts',
  },
  DryFruits: {
    name: 'DryFruits',
    display_value: 'Dry Fruits',
  },
  Oils: {
    name: 'Oils',
    display_value: 'Oils',
  },
  Milk: {
    name: 'Milk',
    display_value: 'Milk & Products',
  },
  Eggs: {
    name: 'Eggs',
    display_value: 'Eggs & Mushrooms',
  },
  Prepared: {
    name: 'Prepared',
    display_value: 'Batter, Flour & Others',
  },
  Disposables: {
    name: 'Disposables',
    display_value: 'Disposables',
  },
  Beauty: {
    name: 'Beauty',
    display_value: 'Beauty Products',
  },
  Returnable: {
    name: 'Returnable',
    display_name: 'Returnable',
  },
};

const ProductTypeName1 = {
  New: {
    name: 'New',
    display_value: 'New',
  },
  Vegetables: {
    name: 'Vegetables',
    display_name: 'Vegetables',
  },
  Fruits: {
    name: 'Fruits',
    display_name: 'Fruits',
  },
  Dhals: {
    name: 'Dhals',
    display_name: 'Dhal, Lentils & Dried Beans',
  },
  Grains: {
    name: 'Grains',
    display_name: 'Rice & Millets',
  },
  Spices: {
    name: 'Spices',
    display_name: 'Masalas & Spices',
  },
  Oils: {
    name: 'Oils',
    display_name: 'Ghee & Oils',
  },
  Prepared: {
    name: 'Prepared',
    display_name: 'Pickles, Podis, Spreads',
  },
  Hygiene: {
    name: 'Hygiene',
    display_name: 'Personal Care & Others',
  },
  Sweetners: {
    name: 'Sweetners',
    display_name: 'Sweetners & Salts',
  },
  Flours: {
    name: 'Flours',
    display_name: 'Flours & Rava',
  },
  Batter: {
    name: 'Batter',
    display_name: 'Batter & Beverages',
  },
  Snacks: {
    name: 'Snacks',
    display_name: 'Dry Fruits, Nuts & Snacks',
  },
  Returnable: {
    name: 'Returnable',
    display_name: 'Returnable',
  },
};

const ReturnProductType = { name: 'Returnable', value: 'Returnable' };
// const ProductType = ['New', 'Vegetables', 'Fruits', 'Dhals', 'Grains', 'Spices', 'Oils', 'Prepared', 'Hygiene', 'Sweetners', ReturnProductType.name];
const ProductTypeNameArray = Object.keys(ProductTypeName).map((cat) => ProductTypeName[cat].name).sort((a, b) => a.localeCompare(b));
// const ProductTypeDisplayNames = Object.keys(ProductTypeName).map((cat) => ProductTypeName[cat].displayName);
/*
Saved - customer saved the current selection, with the intent to resume.
Processing — customer has placed and order and we are ready to start processing the request.
Pending — customer started the checkout process, but did not complete it.
      Incomplete orders are assigned a "Pending" status, and can be found under the More tab in the View Orders screen.
Awaiting Payment — customer has completed checkout process, but payment has yet to be confirmed.
      Authorize only transactions that are not yet captured have this status.
Awaiting Fulfillment — customer has completed the checkout process and payment has been confirmed
Awaiting Shipment — order has been pulled and packaged, and is awaiting collection from a shipping provider
Awaiting Pickup — order has been pulled, and is awaiting customer pickup from a seller-specified location
Partially Shipped — only some items in the order have been shipped, due to some products being pre-order only or other reasons
Partially Completed — only some items in the order have been invioiced and shipped, due to some products being pre-order only or other reasons
Completed — order has been shipped/picked up, and receipt is confirmed;
        client has paid for their digital product and their file(s) are available for download
Shipped — order has been shipped, but receipt has not been confirmed; seller has used the Ship Items action.
        A listing of all orders with a "Shipped" status can be found under the More tab of the View Orders screen.
Cancelled — seller has cancelled an order, due to a stock inconsistency or other reasons. Stock levels will automatically update depending on your Inventory Settings.
Declined — seller has marked the order as declined for lack of manual payment, or other reasons
Refunded — seller has used the Refund action. A listing of all orders with a "Refunded"
        status can be found under the More tab of the View Orders screen.
Disputed — customer has initiated a dispute resolution process for the PayPal transaction that paid for the order
Verification Required — order on hold while some aspect (e.g. tax-exempt documentation)
        needs to be manually confirmed. Orders with this status must be updated manually. Capturing funds or other order actions will not automatically update the status of an order marked Verification Required.
 */
const OrderStatus = {
  Saved: {
    name: 'Saved',
    display_value: 'Draft',
    label: 'warning',
  },
  Pending: {
    name: 'Pending',
    display_value: 'Order Placed',
    label: 'brand-yellow',
  },
  Processing: {
    name: 'Processing',
    display_value: 'Processing',
    label: 'warning',
  },
  Awaiting_Fulfillment: {
    name: 'Awaiting_Fulfillment',
    display_value: 'Packing',
    label: 'brand-yellow',
  },
  Awaiting_Payment: {
    name: 'Awaiting_Payment',
    display_value: 'Awaiting Payment',
    label: 'danger',
  },
  Completed: {
    name: 'Completed',
    display_value: 'Completed',
    label: 'success',
  },
  Cancelled: {
    name: 'Cancelled',
    display_value: 'Cancelled',
    label: 'primary',
  },
  Shipped: {
    name: 'Shipped',
    display_value: 'Shipped',
    label: 'info',
  },
  Partially_Completed: {
    name: 'Partially_Completed',
    display_value: 'Partially Completed',
    label: 'danger',
  },
};

const PorterStatus = {
  Not_Assigned: {
    name: 'Not_Assigned',
    display_value: '--',
    label: 'info',
  },
  live: {
    name: 'live',
    display_value: 'Created',
    label: 'success',
  },
  cancelled: {
    name: 'cancelled',
    display_value: 'Cancelled',
    label: 'info',
  },
};

PorterStatus.names = Object.keys(PorterStatus).map((cat) => PorterStatus[cat].name);

const UserAccountStatus = {
  Active: { name: 'Active', status_display_value: 'Active', btn_display_name: 'Activate Account' },
  Disabled: { name: 'Disabled', status_display_value: 'Disabled', btn_display_name: 'Disable Account' },
  NewSignUp: { name: 'NewSignUp', status_display_value: 'New & Active' },
};

UserAccountStatus.names = Object.keys(UserAccountStatus).map((cat) => UserAccountStatus[cat].name);

const StatementPeriod = {
  /* Today: { name: 'Today', display_value: 'Today' },
  Yesterday: { name: 'Yesterday', display_value: 'Yesterday' }, */

  ThisWeek: { name: 'ThisWeek', display_value: 'This Week' },
  PreviousWeek: { name: 'PreviousWeek', display_value: 'Last Week' },

  ThisMonth: { name: 'ThisMonth', display_value: 'This Month' },
  PreviousMonth: { name: 'PreviousMonth', display_value: 'Last Month' },

  ThisYear: { name: 'ThisYear', display_value: 'This Year' },
  PreviousYear: { name: 'PreviousYear', display_value: 'Last Year' },
};

const DaysFromTodayForward = {
  Today: {
    name: 'Today',
    display_value: 'Today',
    increment: 0,
  },
  Tomorrow: {
    name: 'Tomorrow',
    display_value: 'Tomorrow',
    increment: 1,
  },
  TodayPlus2: {
    name: 'TodayPlus2',
    display_value: 'Today + 2 days',
    increment: 2,
  },
  TodayPlus3: {
    name: 'TodayPlus3',
    display_value: 'Today + 3 days',
    increment: 3,
  },
};

const UnitOfRecipes = {
  Nums: {
    name: 'Nums',
    display_value: '',
  },
  TeaSpoons: {
    name: 'TeaSpoons',
    display_value: 'tea spoon',
  },
  Cups: {
    name: 'Cups',
    display_value: 'cup',
  },
  Ml: {
    name: 'Ml',
    display_value: 'ml',
  },
  Mg: {
    name: 'Mg',
    display_value: 'mg',
  },
  Liter: {
    name: 'Liter',
    display_value: 'l',
  },
  Grams: {
    name: 'Grams',
    display_value: 'gram',
  },
};

UnitOfRecipes.names = Object.keys(UnitOfRecipes).map((cat) => UnitOfRecipes[cat].name);

const ProductListStatus = {
  Expired: { name: 'Expired', display_value: 'Expired', label: 'info' },
  Active_Now: {
    name: 'Active_Now',
    display_value: 'Active',
    label: 'success',
  },
  Future: { name: 'Future', display_value: 'Future', label: 'warning' },
};

const Roles = {
  superAdmin: { name: 'superAdmin', display_value: 'Super Admin' },
  admin: { name: 'admin', display_value: 'Admin' },
  shopOwner: { name: 'shopOwner', display_value: 'Shop Owner' },
  supplier: { name: 'supplier', display_value: 'Supplier' },
  customer: { name: 'customer', display_value: 'Customer' },

};

Roles.allowedValues = [Roles.shopOwner.name, Roles.customer.name];

const InvitationStatus = {
  Sent: { name: 'Sent', display_value: 'Sent', label: 'default' },
  Accepted: { name: 'Accepted', display_value: 'Accepted', label: 'success' },
};

const PublishStatus = {
  Draft: { name: 'Draft', display_value: 'Draft' },
  Published: { name: 'Published', display_value: 'Published' },
};
PublishStatus.allowedValues = [PublishStatus.Draft.name, PublishStatus.Published.name];

const PostTypes = {
  Recipe: { name: 'Recipe', display_value: 'Recipe' },
  Product: { name: 'Product', display_value: 'Product' },
  Order: { name: 'Order', display_value: 'Order' },
  Messages: { name: 'Message', display_value: 'Message' },
};

PostTypes.allowedValues = _.reduce(PostTypes, (arr, postType) => {
  arr.push(postType.name);
  return arr;
}, []);

const MessageStatus = {
  Open: {
    name: 'Open',
    display_value: 'Open',
    label: 'warning',
  },
  Read: {
    name: 'Pending',
    display_value: 'Order Placed',
    label: 'logo-yellow',
  },
  Closed: {
    name: 'Closed',
    display_value: 'Closed',
    label: 'success',
  },
};

const OrderReceivedType = {
  whatsApp: {
    name: 'whatsApp',
    display_value: 'WhatsApp',
  },
  phone: {
    name: 'phone',
    display_value: 'Phone',
  },
};

OrderReceivedType.allowedValues = Object.keys(OrderReceivedType).map((typ) => OrderReceivedType[typ].name);

MessageStatus.allowedValues = _.reduce(MessageStatus, (arr, ticketStatus) => {
  arr.push(ticketStatus.name);
  return arr;
}, []);

const MessageTypes = {
  /* Suggestion: {
    name: 'Suggestion',
    display_value: 'Suggestion, Idea',
    label: 'success',
    iconClass: 'fas fa-lightbulb',
  },
  Appreciation: {
    name: 'Appreciation',
    display_value: 'Appreciation',
    label: 'success',
    iconClass: 'fas fa-heart',
  }, */
  Issue: {
    name: 'Issue',
    display_value: 'Suvai Admin ( Issue, Quality, Payments )',
    label: 'danger',
    iconClass: 'error',
  },
  Message: {
    name: 'Message',
    display_value: 'Suvai Community',
    label: 'info',
    iconClass: 'chat',
  },
};

MessageTypes.allowedValues = _.reduce(MessageTypes, (arr, ticketTypes) => {
  arr.push(ticketTypes.name);
  return arr;
}, []);

const FeedBackTypes = {
  allowedValues: ['NPS', 'SURVEY', 'PRODUCTFIT'],
};

const SpecialThemes = ['None', 'Yellow', 'Red', 'Green', 'Orange'];

const CommentTypes = {
  Approved: { name: 'Approved', display_value: 'Approved' },
  New: { name: 'New', display_value: 'New' },
};

const InfiniteScroll = {
  DefaultLimit: 20,
  LimitIncrement: 20,
  DefaultLimitOrders: 500,
  LimitIncrementOrders: 500,
};

const MediaStores = {
  Thumbnails: {
    name: 'Thumbnail',
    display_value: 'Thumbnail',
    width: '256',
    height: '256',
  },
  Originals: {
    name: 'Original',
    display_value: 'Original',
    width: '1024',
    height: '1024',
  },
};

const ScreenWidths = {
  iphone5: {
    width: 320,
    height: 568,
    name: 'iphone5',
  },
  ipad: {
    width: 768,
    height: 568,
    name: 'ipad',
  },
};
// The toolbarConfig object allows you to specify custom buttons, reorder buttons and to add custom css classes.
// Supported inline styles: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Inline-Styles.md
// Supported block types: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Custom-Block-Render.md#draft-default-block-render-map
const RichEditorToolbarConfig = {
  // Optionally specify the groups to display (displayed in the order listed).
  display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', /* 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', */ 'HISTORY_BUTTONS'],
  INLINE_STYLE_BUTTONS: [
    { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' },
  ],
  BLOCK_TYPE_DROPDOWN: [
    { label: 'Normal', style: 'unstyled' },
    { label: 'Heading Large', style: 'header-one' },
    { label: 'Heading Medium', style: 'header-two' },
    { label: 'Heading Small', style: 'header-three' },
  ],
  BLOCK_TYPE_BUTTONS: [
    { label: 'List', style: 'unordered-list-item' },
    { label: 'Numbered List', style: 'ordered-list-item' },
  ],
};

const SELECT_EMPTY_VALUE = '';

const constants = {
  ProductTypeName,
  ProductTypeNameArray,
  OrderStatus,
  PorterStatus,
  DaysFromTodayForward,
  StatementPeriod,
  ProductListStatus,
  Sort,
  Roles,
  ControlStates,
  InvitationStatus,
  PublishStatus,
  MediaStores,
  PostTypes,
  SpecialThemes,
  CommentTypes,
  RichEditorToolbarConfig,
  InfiniteScroll,
  DifficultyLevels,
  RecipeCat,
  FoodGroups,
  DietaryPreferences,
  FeedBackTypes,
  MessageStatus,
  MessageTypes,
  ScreenWidths,
  OrderReceivedType,
  UnitOfRecipes,
  SELECT_EMPTY_VALUE,
  ReturnProductType,
  UserAccountStatus,
  PackingPreferences,
  ProductUpdatePreferences,
};

export default constants;
