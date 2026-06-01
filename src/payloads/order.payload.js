export function createOrderPayload(productId, quantity = 1) {
  return {
    productId,
    quantity,
    paymentMethod: 'credit_card',
  };
}
