const pricingConfig = require('../config/pricing');

exports.calculateFare = (porterBaseRate, luggageCount) => {
  // If the porter has a custom base rate, use it, otherwise fallback to global
  const base = porterBaseRate || pricingConfig.baseFare;
  
  // Calculate additional luggage charge
  let additionalLuggage = 0;
  if (luggageCount > pricingConfig.includedBags) {
    const extraBags = luggageCount - pricingConfig.includedBags;
    additionalLuggage = extraBags * pricingConfig.perBagAdditionalCharge;
  }
  
  // Service charge
  const serviceCharge = pricingConfig.serviceChargeFixed;
  
  // Total
  const estimatedTotal = base + additionalLuggage + serviceCharge;

  return {
    baseFare: base,
    additionalLuggage,
    serviceCharge,
    estimatedTotal
  };
};
