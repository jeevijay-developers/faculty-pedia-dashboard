/**
 * Comprehensive list of Indian banks for payout bank details
 * Includes Public Sector, Private Sector, Foreign, Small Finance, and Payment banks
 */

export const INDIAN_BANKS = [
  // Public Sector Banks
  "State Bank of India",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Bank of India",
  "Indian Bank",
  "Central Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "Punjab & Sind Bank",

  // Private Sector Banks
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Yes Bank",
  "IDFC FIRST Bank",
  "Federal Bank",
  "RBL Bank",
  "South Indian Bank",
  "Karur Vysya Bank",
  "City Union Bank",
  "Tamilnad Mercantile Bank",
  "Jammu & Kashmir Bank",
  "DCB Bank",
  "Lakshmi Vilas Bank",
  "Dhanlaxmi Bank",
  "Karnataka Bank",
  "Nainital Bank",

  // Small Finance Banks
  "AU Small Finance Bank",
  "Equitas Small Finance Bank",
  "Ujjivan Small Finance Bank",
  "Suryoday Small Finance Bank",
  "Utkarsh Small Finance Bank",
  "ESAF Small Finance Bank",
  "Fincare Small Finance Bank",
  "Jana Small Finance Bank",
  "North East Small Finance Bank",
  "Shivalik Small Finance Bank",
  "Capital Small Finance Bank",
  "Unity Small Finance Bank",

  // Payment Banks
  "Paytm Payments Bank",
  "Airtel Payments Bank",
  "India Post Payments Bank",
  "Fino Payments Bank",
  "NSDL Payments Bank",
  "Jio Payments Bank",

  // Foreign Banks (Operating in India)
  "Citibank",
  "HSBC",
  "Standard Chartered Bank",
  "Deutsche Bank",
  "Barclays Bank",
  "American Express Banking Corp",
  "Bank of America",
  "DBS Bank India",
  "Doha Bank",
  "Emirates NBD Bank",

  // Cooperative Banks (Major ones)
  "Saraswat Cooperative Bank",
  "Shamrao Vithal Cooperative Bank",
  "TJSB Sahakari Bank",
  "Abhyudaya Cooperative Bank",
  "Bassein Catholic Cooperative Bank",
  "Mehsana Urban Cooperative Bank",
  "Gujarat State Cooperative Bank",
  "Surat National Cooperative Bank",
  "Kalyan Janata Sahakari Bank",

  // Regional Rural Banks (Major ones)
  "Andhra Pradesh Grameena Vikas Bank",
  "Andhra Pragathi Grameena Bank",
  "Arunachal Pradesh Rural Bank",
  "Aryavart Bank",
  "Assam Gramin Vikash Bank",
  "Bangiya Gramin Vikash Bank",
  "Baroda Gujarat Gramin Bank",
  "Baroda Rajasthan Kshetriya Gramin Bank",
  "Baroda UP Bank",
  "Chhattisgarh Rajya Gramin Bank",
  "Dakshin Bihar Gramin Bank",
  "Ellaquai Dehati Bank",
  "Himachal Pradesh Gramin Bank",
  "J&K Grameen Bank",
  "Jharkhand Rajya Gramin Bank",
  "Karnataka Gramin Bank",
  "Karnataka Vikas Grameena Bank",
  "Kerala Gramin Bank",
  "Madhya Pradesh Gramin Bank",
  "Madhyanchal Gramin Bank",
  "Maharashtra Gramin Bank",
  "Manipur Rural Bank",
  "Meghalaya Rural Bank",
  "Mizoram Rural Bank",
  "Nagaland Rural Bank",
  "Odisha Gramya Bank",
  "Paschim Banga Gramin Bank",
  "Prathama UP Gramin Bank",
  "Puduvai Bharathiar Grama Bank",
  "Punjab Gramin Bank",
  "Rajasthan Marudhara Gramin Bank",
  "Saptagiri Grameena Bank",
  "Sarva Haryana Gramin Bank",
  "Saurashtra Gramin Bank",
  "Tamil Nadu Grama Bank",
  "Telangana Grameena Bank",
  "Tripura Gramin Bank",
  "Utkal Grameen Bank",
  "Uttar Bihar Gramin Bank",
  "Uttarakhand Gramin Bank",
  "Uttarbanga Kshetriya Gramin Bank",
  "Vidharbha Konkan Gramin Bank",
].sort();

export const getBankSuggestions = (query: string): string[] => {
  if (!query || query.length < 2) {
    return INDIAN_BANKS.slice(0, 10); // Return top 10 banks if no query
  }

  const lowerQuery = query.toLowerCase();
  return INDIAN_BANKS.filter((bank) => bank.toLowerCase().includes(lowerQuery));
};
