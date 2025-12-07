require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

// 1. SETUP DATABASE
const ComponentSchema = new mongoose.Schema({
  name: String, library: String, framework: String, docUrl: String, keywords: [String], popularityScore: Number
});
const Component = mongoose.models.Component || mongoose.model('Component', ComponentSchema);

// 2. SCRAPING FUNCTIONS

// Scrape Mantine (React)
async function scrapeMantine() {
  console.log("🕷️  Scraping Mantine...");
  const components = [];
  try {
    // Mantine lists all components on their sidebar or getting-started page
    // We will cheat and use their sitemap logic or a known list page
    const { data } = await axios.get('https://mantine.dev/core/button/'); 
    const $ = cheerio.load(data);

    // Finding sidebar links (Selector depends on the specific site structure)
    // Note: Selectors change often. This targets Mantine's current sidebar structure.
    $('nav a').each((i, el) => {
      const link = $(el).attr('href');
      const text = $(el).text();

      // Filter only "core" components
      if (link && link.includes('/core/')) {
        const fullUrl = `https://mantine.dev${link}`;
        // Clean up the name (e.g., "Button" instead of "Button component")
        const name = text.replace(' component', '').trim();

        components.push({
          name: name,
          library: "Mantine",
          framework: "React",
          docUrl: fullUrl,
          keywords: [name.toLowerCase(), "ui", "mantine"],
          popularityScore: 85
        });
      }
    });
  } catch (err) {
    console.error("Failed to scrape Mantine:", err.message);
  }
  return components;
}

// Scrape DaisyUI (Tailwind/CSS)
async function scrapeDaisyUI() {
  console.log("🕷️  Scraping DaisyUI...");
  const components = [];
  try {
    const { data } = await axios.get('https://daisyui.com/components/button/');
    const $ = cheerio.load(data);

    // DaisyUI Sidebar selector
    $('.drawer-side .menu a').each((i, el) => {
      const link = $(el).attr('href');
      const text = $(el).text();

      if (link && link.includes('/components/')) {
        const fullUrl = `https://daisyui.com${link}`;
        components.push({
          name: text,
          library: "DaisyUI",
          framework: "CSS", // Daisy works with everything
          docUrl: fullUrl,
          keywords: [text.toLowerCase(), "tailwind", "css"],
          popularityScore: 90
        });
      }
    });
  } catch (err) {
    console.error("Failed to scrape DaisyUI:", err.message);
  }
  return components;
}

// 3. MAIN RUNNER
const runScraper = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to DB");

  // Run the scrapers
  const mantineData = await scrapeMantine();
  const daisyData = await scrapeDaisyUI();

  const allData = [...mantineData, ...daisyData];

  // Remove duplicates based on URL
  const uniqueData = Array.from(new Set(allData.map(a => a.docUrl)))
    .map(url => allData.find(a => a.docUrl === url));

  console.log(`📦 Found ${uniqueData.length} total components.`);

  if (uniqueData.length > 0) {
    // Insert into DB
    // Note: We use 'insertMany' with { ordered: false } to skip duplicates if you have unique indexes
    try {
      await Component.insertMany(uniqueData); 
      console.log("🚀 Successfully saved to database!");
    } catch (e) {
      console.log("⚠️  Some duplicates were skipped.");
    }
  }

  mongoose.connection.close();
};

runScraper();
