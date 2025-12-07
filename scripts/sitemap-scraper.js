require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const xml2js = require('xml2js');

// --- DATABASE SETUP ---
const ComponentSchema = new mongoose.Schema({
  name: String, library: String, framework: String, docUrl: String, keywords: [String], popularityScore: Number
});
const Component = mongoose.models.Component || mongoose.model('Component', ComponentSchema);

// --- CONFIGURATION ---
const TARGETS = [
  {
    library: "Material UI",
    sitemap: "https://mui.com/sitemap.xml", // This is an INDEX
    framework: "React",
    // MUI URLs often look like /material-ui/react-button/
    filter: (url) => url.includes("/react-") && !url.includes("/api/") && !url.includes("/guides/"),
    nameExtractor: (url) => {
      // Extract "button" from ".../react-button/"
      const match = url.match(/react-([^/]+)/);
      return match ? match[1].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Unknown";
    }
  },
  {
    library: "ShadCN UI",
    sitemap: "https://ui.shadcn.com/sitemap.xml",
    framework: "React",
    filter: (url) => url.includes("/docs/components/"),
    nameExtractor: (url) => url.split("/components/")[1].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  },
  {
    library: "Radix UI",
    sitemap: "https://www.radix-ui.com/sitemap.xml",
    framework: "React",
    filter: (url) => url.includes("/primitives/docs/components/"),
    nameExtractor: (url) => url.split("/components/")[1].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  },
  {
    library: "Mantine",
    sitemap: "https://mantine.dev/sitemap.xml",
    framework: "React",
    filter: (url) => url.includes("/core/") || url.includes("/hooks/"),
    nameExtractor: (url) => {
        const parts = url.split('/');
        // URL is usually mantine.dev/core/button/ -> we take the second to last part
        return parts[parts.length - 2].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }
  }
];

// --- HELPER: FAKE BROWSER REQUEST ---
const fetchWithHeaders = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        // 🚨 CRITICAL: Look like a real browser to avoid 403/404 blocks
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    return data;
  } catch (error) {
    console.log(`   ⚠️ Failed to fetch ${url}: ${error.response?.status || error.message}`);
    return null;
  }
};

// --- LOGIC: RECURSIVE PARSER ---
async function parseSitemap(url, target) {
  console.log(`   ➡️ Fetching: ${url}`);
  const xmlData = await fetchWithHeaders(url);
  if (!xmlData) return [];

  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlData);

  let collectedUrls = [];

  // CASE A: It's a Sitemap Index (A list of other sitemaps)
  if (result.sitemapindex) {
    console.log(`      📂 Found Index with ${result.sitemapindex.sitemap.length} sub-sitemaps. Parsing...`);
    for (const sub of result.sitemapindex.sitemap) {
      const subUrl = sub.loc[0];
      const subData = await parseSitemap(subUrl, target); // Recursion
      collectedUrls = [...collectedUrls, ...subData];
    }
  } 
  // CASE B: It's a standard UrlSet (The actual links)
  else if (result.urlset) {
    const rawUrls = result.urlset.url.map(entry => entry.loc[0]);
    // Apply the specific library filter
    const filtered = rawUrls.filter(target.filter);
    
    const mapped = filtered.map(link => ({
        name: target.nameExtractor(link),
        library: target.library,
        framework: target.framework,
        docUrl: link,
        keywords: [target.library.toLowerCase(), "ui component"],
        popularityScore: 80
    }));
    collectedUrls = mapped;
  }

  return collectedUrls;
}

// --- MAIN RUNNER ---
const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to DB");

  let allComponents = [];

  for (const target of TARGETS) {
    console.log(`\n🔍 Scanning ${target.library}...`);
    const components = await parseSitemap(target.sitemap, target);
    console.log(`   🎉 Found ${components.length} items for ${target.library}`);
    allComponents = [...allComponents, ...components];
  }

  // Remove duplicates
  const uniqueComponents = Array.from(new Set(allComponents.map(a => a.docUrl)))
    .map(url => allComponents.find(a => a.docUrl === url));

  console.log(`\n📦 Total Unique Components: ${uniqueComponents.length}`);

  if (uniqueComponents.length > 0) {
    await Component.deleteMany({}); // Start fresh
    await Component.insertMany(uniqueComponents, { ordered: false });
    console.log("🚀 Database fully populated!");
  } else {
    console.log("❌ No components found. Check your filters.");
  }

  mongoose.connection.close();
};

run();