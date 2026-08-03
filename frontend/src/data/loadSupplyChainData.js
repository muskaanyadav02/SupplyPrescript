import Papa from "papaparse";

export async function loadSupplyChainData() {
  const response = await fetch("/dashboard_sample.csv");
  const csv = await response.text();

  const result = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (header) => header.trim(),
  });

  return result.data;
}