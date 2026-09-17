export const budgetOptions = [
  { value: "5000", label: "₹5,000" },
  { value: "15000", label: "₹15,000" },
  { value: "25000", label: "₹25,000+" },
];

export const sharingOptions = [
  { value: "single", label: "Single Private Room" },
  { value: "double", label: "2 Sharing (Twin)" },
  { value: "triple", label: "3 Sharing (Triple)" },
  { value: "quad", label: "4+ Sharing (Dorm)" },
];

export const amenityOptions: { value: string; label: string; match: string }[] = [
  { value: "ac", label: "Air Conditioning (AC)", match: "AC" },
  { value: "wifi", label: "High-Speed Wi-Fi", match: "WiFi" },
  { value: "washroom", label: "Attached Washroom", match: "Attached Washroom" },
  { value: "power", label: "24/7 Power Backup", match: "Power Backup" },
  { value: "laundry", label: "Washing Machine", match: "Laundry" },
  { value: "cctv", label: "CCTV & Biometric", match: "CCTV" },
];

export const hasAmenity = (amenities: string[], keyword: string) =>
  amenities.some((a) => a.toLowerCase().includes(keyword.toLowerCase()));

export const hasFood = (amenities: string[]) => hasAmenity(amenities, "Food");