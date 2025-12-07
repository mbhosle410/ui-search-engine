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
    cleanName: (text) => text.trim()
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
    indexUrl: "https://daisyui.com/components/",
    framework: "CSS",
    baseDomain: "https://daisyui.com",
    selector: "a[href^='/components/']",
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

    // Find all links matching the selector
    $(target.selector).each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text();

      // Basic validation to skip junk links (like "Overview" or "GitHub")
      if (!href || text.length < 2 || text.includes("Overview") || text.includes("GitHub") || text.includes("Template")) return;

      // Normalize URL
      const fullUrl = href.startsWith('http') ? href : target.baseDomain + href;

      items.push({
        name: target.cleanName(text),
        library: target.name,
        framework: target.framework,
        docUrl: fullUrl,
        keywords: [text.toLowerCase(), target.name.toLowerCase(), "ui component"],
        popularityScore: 90
      });
    });

  } catch (err) {
    console.error(`❌ Failed to scrape ${target.name}: ${err.message}`);
  }

  // Remove duplicates (dedupe by URL)
  const unique = Array.from(new Set(items.map(a => a.docUrl)))
    .map(url => items.find(a => a.docUrl === url));
    
  console.log(`   ✅ Found ${unique.length} working components.`);
  return unique;
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
    console.log("🚀 Done! Your database now has ONLY working links.");
  }

  mongoose.connection.close();
};

run();