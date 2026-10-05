const PAYMENT_SETTINGS = {
    flatFee: 0.30,         // $0.30 fixed fee
    percentageFee: 0.025,  // 2.5% variable fee
    acceptedCurrencies: ['USD'],
  };
  
  /**
   * Validates the structure and values of a payment object.
   * @param {Object} payment 
   * @returns {boolean} true if valid, throws Error if invalid
   */
  function validatePayment(payment) {
    if (!payment || typeof payment !== 'object') {
      throw new Error('Payment must be an object');
    }
  
    const { amount, currency, source, destination } = payment;
  
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
  
    if (!PAYMENT_SETTINGS.acceptedCurrencies.includes(currency)) {
      throw new Error(`Currency not accepted: ${currency}`);
    }
  
    if (!source || !destination) {
      throw new Error('Payment must include both source and destination');
    }
  
    return true;
  }
  
  /**
   * Calculates the total fee for a given amount.
   * @param {number} amount 
   * @returns {number} fee
   */
  function calculateFee(amount) {
    const { flatFee, percentageFee } = PAYMENT_SETTINGS;
    const fee = flatFee + (amount * percentageFee);
    return parseFloat(fee.toFixed(2));
  }
  
  /**
   * Generates a random reference ID for a transaction.
   * @returns {string}
   */
  function generateReferenceId() {
    const now = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `REF-${now}-${random}`.toUpperCase();
  }
  
  module.exports = {
    validatePayment,
    calculateFee,
    generateReferenceId,
  };