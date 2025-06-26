import { buildings } from "./hooks/useBuildings";

// First, define the 5 hardcoded items
const HARDCODED_ITEMS = [
  {
    id: 1,
    image: "/IMG_0517.webp",
    name: "ThinkPad T14 Gen1",
    description: "Kancelářský notebook Lenovo",
    lastCheck: "2024-05-04",
    note: "Chybí napájecí adaptér",
    colors: ["black"],
    location: { building: "A", story: "1", room: "101" }
  },
  {
    id: 2,
    image: "/globe.svg",
    name: "iMac 24 M1",
    description: "All-in-one počítač Apple",
    lastCheck: "2024-05-08",
    note: "",
    colors: ["silver", "white"],
    location: { building: "A", story: "1", room: "102" }
  },
  {
    id: 3,
    image: "/window.svg",
    name: "iPhone 13 Pro",
    description: "Mobilní telefon Apple",
    lastCheck: "2024-05-10",
    note: "Poškrábaný povrch",
    colors: ["blue"],
    location: { building: "A", story: "2", room: "201" }
  },
  {
    id: 4,
    image: "/vercel.svg",
    name: "Monitor LG 27UL500",
    description: "4K monitor pro grafické práce",
    lastCheck: "2024-05-12",
    note: "",
    colors: ["white"],
    location: { building: "A", story: "2", room: "202" }
  },
  {
    id: 5,
    image: "/file.svg",
    name: "MacBook Air M2",
    description: "Ultrabook Apple s čipem M2",
    lastCheck: "2024-05-15",
    note: "Chybí napájecí adaptér",
    colors: ["gray"],
    location: { building: "B", story: "1", room: "103" }
  }
];

// Then generate the rest starting from id 6
const DYNAMIC_ITEMS = Array.from({ length: 95 }, (_, i) => {
  const idx = i + 5 + 1; // +5 to account for hardcoded items, +1 to start from id 6
  const baseColor = ["blue", "silver", "white", "black", "gray", "red"][i % 6];
  // Cycle through all available locations
  const buildingList = buildings;
  const location = buildingList[i % buildingList.length];
  
  // Generate descriptions for dynamic items
  const descriptions = [
    "Kancelářské vybavení",
    "Technické zařízení",
    "Elektronické zařízení",
    "Počítačové vybavení",
    "Kancelářský nábytek",
    "Multimediální zařízení",
    "Síťové vybavení"
  ];
  const description = descriptions[i % descriptions.length];
  
  return {
    id: idx,
    image: ["/file.svg", "/globe.svg", "/window.svg", "/vercel.svg"][i % 4],
    name: `Item ${idx}`,
    description,
    lastCheck: `2024-05-${(i % 28 + 1).toString().padStart(2, "0")}`,
    note: i % 7 === 0 ? "Chybí napájecí adaptér" : i % 5 === 0 ? "Poškrábaný povrch" : "",
    colors: baseColor === "red" ? ["gray", "red"] : [baseColor],
    location
  };
});

// Combine both sets
const MOCK_DATA = [...HARDCODED_ITEMS, ...DYNAMIC_ITEMS];

// Fetch function stays the same
export async function fetchStocktaking({ offset = 0, limit = 10 }) {
  await new Promise(res => setTimeout(res, 500)); // Simulate network delay
  return {
    items: MOCK_DATA.slice(offset, offset + limit),
    total: MOCK_DATA.length
  };
}

// Operations function remains unchanged
const MOCK_OPERATIONS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  date: `2024-06-${(i % 28 + 1).toString().padStart(2, "0")}`,
  note: i % 2 === 0 ? "Pravidelná inventura" : "Mimořádná kontrola"
}));

export async function fetchStocktakingOperations() {
  await new Promise(res => setTimeout(res, 300)); // Simulate network delay
  return {
    operations: MOCK_OPERATIONS
  };
}


export async function createStocktaking() {
  await new Promise(res => setTimeout(res, 1000)); // Simulate 1 second delay
  return { id: 5 }; // Fixed mock ID
}