import { resetDemoData } from "../src/lib/repository";

async function main() {
  await resetDemoData();
  console.log("Velora Voyages demo data seeded.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
