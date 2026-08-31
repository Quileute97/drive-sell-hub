import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fixVietnameseEncoding } from "../src/lib/vietnameseText.js";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTitles() {
  console.log("Scanning products for title encoding issues...");
  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, meta_title");

  if (error || !products) {
    console.error("Error fetching products:", error);
    return;
  }

  let fixedCount = 0;

  for (const p of products) {
    const fixedTitle = fixVietnameseEncoding(p.title);
    const fixedMeta = p.meta_title ? fixVietnameseEncoding(p.meta_title) : null;

    if (fixedTitle !== p.title || fixedMeta !== p.meta_title) {
      console.log(`Fixing product [${p.id}]:`);
      console.log(`  Old: "${p.title}"`);
      console.log(`  New: "${fixedTitle}"`);

      await supabase
        .from("products")
        .update({
          title: fixedTitle,
          ...(fixedMeta ? { meta_title: fixedMeta } : {}),
        })
        .eq("id", p.id);

      fixedCount++;
    }
  }

  console.log(`\n🎉 Completed title standardization. Fixed ${fixedCount} products.`);
}

fixTitles().catch(console.error);
