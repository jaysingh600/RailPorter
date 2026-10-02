module.exports = {
  // Base configuration that can be overriden by admin later
  baseFare: 100,
  
  // Rate per bag beyond the included limit
  perBagAdditionalCharge: 30,
  includedBags: 2,
  
  // Platform service fee (Fixed amount added to base fare)
  serviceChargeFixed: 20,

  // Platform Commission Percentage (Deducted from Porter's final earnings)
  platformCommissionPercent: 15
};
