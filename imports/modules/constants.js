const Sort = {
   ASCENDING: 1,
   DESCENDING: -1,
}

const ControlStates ={
        edit: " EDIT ",
        view: " VIEW "
}

//This for organizing tabs in the order screen
const ProductType = ["Vegetables","Groceries","Batter"]

//This is for reporting purposes
const ProductCategory = [
        "Vegetable - country",
        "Vegetable - hill",
        "Vegetable - essential",
        "Vegetable - greens",
        "Provisions - processed",
        "Provisions - whole",
        "Fruit"
        ]

/*
Pending — customer started the checkout process, but did not complete it.
      Incomplete orders are assigned a "Pending" status, and can be found under the More tab in the View Orders screen.
Awaiting Payment — customer has completed checkout process, but payment has yet to be confirmed.
      Authorize only transactions that are not yet captured have this status.
Awaiting Fulfillment — customer has completed the checkout process and payment has been confirmed
Awaiting Shipment — order has been pulled and packaged, and is awaiting collection from a shipping provider
Awaiting Pickup — order has been pulled, and is awaiting customer pickup from a seller-specified location
Partially Shipped — only some items in the order have been shipped, due to some products being pre-order only or other reasons
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
    Pending:{ name: "Pending", display_value: "Pending", label: "warning" },
    Awaiting_Payment: { name: "Awaiting_Payment", display_value: "Awaiting Payment", label: "warning" },
    Awaiting_Fulfillment: { name: "Awaiting_Fulfillment", display_value: "Awaiting Fulfillment", label: "info" },
    Awaiting_Shipment: { name: "Awaiting_Shipment", display_value: "Awaiting Shipment", label: "info" },
    Completed: { name: "Completed", display_value: "Completed", label: "success" },
    Cancelled: { name: "Cancelled", display_value: "Cancelled", label: "default" },
    Shipped: { name: "Shipped", display_value: "Shipped", label: "info" },
}

const ProductListStatus = {
    Expired:{ name: "Expired", display_value: "Expired", label: "default" },
    Active_Now: { name: "Active_Now", display_value: "Active Now", label: "success"},
    Future: { name: "Future", display_value: "Future", label: "warning" },
}

const Roles = {
    admin:{ name: "admin", display_value: "Admin" },
}


export default constants = {
  ProductType,
  ProductCategory,
  OrderStatus,
  ProductListStatus,
  Sort,
  Roles,
  ControlStates
}
