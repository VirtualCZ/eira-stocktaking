// First, define the 5 hardcoded items
const HARDCODED_ITEMS = [
  {
    id: 1,
    image: "/file.svg",
    name: "ThinkPad T14 Gen1",
    lastCheck: "2024-05-04",
    note: "Chybí napájecí adaptér",
    colors: ["black"]
  },
  {
    id: 2,
    image: "/globe.svg",
    name: "iMac 24 M1",
    lastCheck: "2024-05-08",
    note: "",
    colors: ["silver", "white"]
  },
  {
    id: 3,
    image: "/window.svg",
    name: "iPhone 13 Pro",
    lastCheck: "2024-05-10",
    note: "Poškrábaný povrch",
    colors: ["blue"]
  },
  {
    id: 4,
    image: "/vercel.svg",
    name: "Monitor LG 27UL500",
    lastCheck: "2024-05-12",
    note: "",
    colors: ["white"]
  },
  {
    id: 5,
    image: "/file.svg",
    name: "MacBook Air M2",
    lastCheck: "2024-05-15",
    note: "Chybí napájecí adaptér",
    colors: ["gray"]
  }
];

// Then generate the rest starting from id 6
const DYNAMIC_ITEMS = Array.from({ length: 95 }, (_, i) => {
  const idx = i + 5 + 1; // +5 to account for hardcoded items, +1 to start from id 6
  const baseColor = ["blue", "silver", "white", "black", "gray", "red"][i % 6];
  return {
    id: idx,
    image: ["/file.svg", "/globe.svg", "/window.svg", "/vercel.svg"][i % 4],
    name: `Item ${idx}`,
    lastCheck: `2024-05-${(i % 28 + 1).toString().padStart(2, "0")}`,
    note: i % 7 === 0 ? "Chybí napájecí adaptér" : i % 5 === 0 ? "Poškrábaný povrch" : "",
    colors: baseColor === "red" ? ["gray", "red"] : [baseColor]
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