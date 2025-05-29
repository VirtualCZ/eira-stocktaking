// Example mock dataset (expand as needed)
const MOCK_DATA = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  image: ["/file.svg","/globe.svg","/window.svg","/vercel.svg"][i%4],
  name: `Item ${i + 1}`,
  lastCheck: `2024-05-${(i%28+1).toString().padStart(2,"0")}`,
  note: i % 7 === 0 ? "Chybí napájecí adaptér" : i % 5 === 0 ? "Poškrábaný povrch" : "",
  colors: ["blue","silver","white","black","gray","red"][i%6] === "red" ? ["gray","red"] : [["blue","silver","white","black","gray","red"][i%6]],
}));

export async function fetchStocktaking({ offset = 0, limit = 10 }) {
  await new Promise(res => setTimeout(res, 500)); // Simulate network delay
  return {
    items: MOCK_DATA.slice(offset, offset + limit),
    total: MOCK_DATA.length
  };
}


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