import zh from './ZohoBooks';

// List customer payments
//GET /customerpayments	List all the payments made by your customer.
//GET /customerpayments/:payment_id	Get the details of a customer payment.

//Create a customer payment
//POST /customerpayments	Create a payment made by your customer and you can also apply them to invoices either partially or fully.
function createCustomerPayment(order, paymentAmountInRs) {
}

//Update a customer payment
//PUT /customerpayments/:payment_id	Update an existing customer payment. You can also modify the amount applied to the invoices.

//Delete a customer payment
//DELETE /customerpayments/:payment_id	Delete an existing customer payment.

export default zohoPayments = {
    createCustomerPayment
}