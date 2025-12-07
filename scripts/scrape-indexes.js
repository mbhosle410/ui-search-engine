require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

// --- 1. SETUP DATABASE ---
const MONGODB_URI = process.env.MONGODB_URI;
const ComponentSchema = new mongoose.Schema({
  name: String, library: String, framework: String, docUrl: String, keywords: [String], popularityScore: Number
});
const Component = mongoose.models.Component || mongoose.model('Component', ComponentSchema);

// --- 2. CONFIGURATION ---
const TARGETS = [
  // --- REACT LIBRARIES ---
  {
    name: "Tamagui",
    indexUrl: "https://tamagui.dev/ui/button",
    framework: "React",
    baseDomain: "https://tamagui.dev",
    selector: "a[href^='/ui/']",
    cleanName: (text) => text.trim()
  },
  {
    name: "Aceternity UI",
    indexUrl: "https://ui.aceternity.com/components",
    framework: "React",
    baseDomain: "https://ui.aceternity.com",
    selector: "a[href^='/components/']",
    cleanName: (text) => text.trim()
  },
  {
    name: "Tremor",
    indexUrl: "https://www.tremor.so/docs/visualizations/area-chart",
    framework: "React",
    baseDomain: "https://www.tremor.so",
    selector: "a[href^='/docs/visualizations/'], a[href^='/docs/inputs/'], a[href^='/docs/ui/']",
    cleanName: (text) => text.trim()
  },
  {
    name: "Radix Themes",
    indexUrl: "https://www.radix-ui.com/themes/docs/overview/getting-started",
    framework: "React",
    baseDomain: "https://www.radix-ui.com",
    selector: "a[href^='/themes/docs/components/'], a[href^='/themes/docs/layout/'], a[href^='/themes/docs/typography/']",
    cleanName: (text) => text.trim()
  },
  {
    name: "HeroUI",
    indexUrl: "https://www.heroui.com/docs/components/accordion",
    framework: "React",
    baseDomain: "https://www.heroui.com",
    selector: "a[href^='/docs/components/']",
    cleanName: (text) => text.trim()
  },
  {
    name: "MUI Joy UI",
    indexUrl: "https://mui.com/joy-ui/react-autocomplete/",
    framework: "React",
    baseDomain: "https://mui.com",
    selector: "a[href*='/joy-ui/react-']",
    cleanName: (text) => text.trim()
  },
  {
    name: "Headless UI",
    indexUrl: "https://headlessui.com/react/menu",
    framework: "React",
    baseDomain: "https://headlessui.com",
    selector: "ul a[href^='/react/']",
    cleanName: (text) => text.trim()
  },
  {
    name: "Mantine",
    indexUrl: "https://mantine.dev/core/package/",
    framework: "React",
    baseDomain: "https://mantine.dev",
    selector: "a[href^='/core/']",
    cleanName: (text) => text.trim()
  },
  {
    name: "ShadCN UI",
    indexUrl: "https://ui.shadcn.com/docs/components",
    framework: "React",
    baseDomain: "https://ui.shadcn.com",
    selector: "div.grid a[href^='/docs/components/']",
    cleanName: (text) => text.trim()
  },
  {
    name: "Material UI",
    indexUrl: "https://mui.com/material-ui/all-components/",
    framework: "React",
    baseDomain: "https://mui.com",
    selector: "a[href*='/material-ui/react-']",
    cleanName: (text) => text.trim()
  },
  {
    name: "Ant Design",
    indexUrl: "https://ant.design/components/overview/",
    framework: "React",
    baseDomain: "https://ant.design",
    selector: ".ant-row a[href*='/components/']",
    cleanName: (text) => text.replace(/([A-Z])/g, ' $1').trim()
  },
  {
    name: "Chakra UI",
    indexUrl: "https://v2.chakra-ui.com/docs/components",
    framework: "React",
    baseDomain: "https://v2.chakra-ui.com",
    selector: "a[href*='/docs/components/']",
    cleanName: (text) => text.trim()
  },

  // --- CSS / TAILWIND LIBRARIES ---
  {
    name: "HyperUI",
    indexUrl: "https://www.hyperui.dev/",
    framework: "CSS",
    baseDomain: "https://www.hyperui.dev",
    selector: "a[href^='/components/']",
    // 🧹 CLEANER: Removes emojis, numbers, and "components" text
    cleanName: (text) => text.replace(/[\d]+\s+components/gi, '').replace(/[^\w\s-]/g, '').trim()
  },
  {
    name: "Flowbite",
    indexUrl: "https://flowbite.com/docs/components/accordion/",
    framework: "CSS",
    baseDomain: "https://flowbite.com",
    selector: "aside a[href^='/docs/components/']",
    cleanName: (text) => text.trim()
  },
  {
    name: "DaisyUI",
    // 🧹 SWITCHED STRATEGY: Use the sidebar from a specific page instead of the card grid
    indexUrl: "https://daisyui.com/components/button/",
    framework: "CSS",
    baseDomain: "https://daisyui.com",
    selector: "div.drawer-side a[href^='/components/']",
    cleanName: (text) => text.trim()
  },
  
  // --- VUE LIBRARIES ---
  {
    name: "Headless UI (Vue)",
    indexUrl: "https://headlessui.com/v1/vue/menu",
    framework: "Vue",
    baseDomain: "https://headlessui.com",
    selector: "a[href^='/v1/vue/']",
    cleanName: (text) => text.replace(/\s*\(.*?\)/, '').trim()
  }
];

// --- 3. THE SCRAPER ---
const scrapeLibrary = async (target) => {
  console.log(`🕷️  Visiting ${target.name} Index: ${target.indexUrl}`);
  const items = [];
  
  try {
    const { data } = await axios.get(target.indexUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0' }
    });
    const $ = cheerio.load(data);

    $(target.selector).each((i, el) => {
      const href = $(el).attr('href');
      // Fix: Get text only from the immediate element to avoid grabbing hidden child elements
      let text = $(el).clone().children().remove().end().text();
      // If empty, try normal text (some links wrap text in spans)
      if (!text.trim()) text = $(el).text();

      if (!href || text.length < 2 || text.includes("Overview") || text.includes("GitHub") || text.includes("Template")) return;

      // 🧹 GLOBAL CLEANUP: Remove weird CSS strings and newlines
      let cleanName = target.cleanName(text).replace(/\s+/g, ' ').trim();
      
      // Reject bad names (CSS code, empty, or too long sentences)
      if (cleanName.startsWith('.') || cleanName.includes('{') || cleanName.length > 30) return;

      const fullUrl = href.startsWith('http') ? href : target.baseDomain + href;

      items.push({
        name: cleanName,
        library: target.name,
        framework: target.framework,
        docUrl: fullUrl.split('#')[0], // Remove anchor tags (dupe killer)
        keywords: [cleanName.toLowerCase(), target.name.toLowerCase(), "ui component"],
        popularityScore: 90
      });
    });

  } catch (err) {
    console.error(`❌ Failed to scrape ${target.name}: ${err.message}`);
  }

  // --- SMART DEDUPLICATION ---
  // If multiple links point to the same URL, keep the SHORTEST name (it's usually the cleanest)
  const uniqueMap = new Map();
  items.forEach(item => {
    const existing = uniqueMap.get(item.docUrl);
    if (!existing || item.name.length < existing.name.length) {
      uniqueMap.set(item.docUrl, item);
    }
  });

  const uniqueItems = Array.from(uniqueMap.values());
  console.log(`   ✅ Found ${uniqueItems.length} clean components.`);
  return uniqueItems;
};

// --- 4. MAIN RUNNER ---
const run = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log("🔌 Database Connected.");

  let allComponents = [];

  for (const target of TARGETS) {
    const data = await scrapeLibrary(target);
    allComponents = [...allComponents, ...data];
  }

  if (allComponents.length > 0) {
    console.log(`\n💾 Seeding ${allComponents.length} Verified Components...`);
    await Component.deleteMany({});
    await Component.insertMany(allComponents);
    console.log("🚀 Done! Your database is now CLEAN (No dups, no CSS code, no emojis).");
  }

  mongoose.connection.close();
};

run();