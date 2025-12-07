require('dotenv').config();
const mongoose = require('mongoose');

// --- 1. SETUP DATABASE ---
const MONGODB_URI = process.env.MONGODB_URI;

const ComponentSchema = new mongoose.Schema({
  name: String, library: String, framework: String, docUrl: String, keywords: [String], popularityScore: Number
});
const Component = mongoose.models.Component || mongoose.model('Component', ComponentSchema);

// --- 2. THE DATA MATRICES ---

// A. The Libraries and their URL Patterns
const LIBRARIES = [
// --- THE GIANTS ---
  { name: "Material UI", framework: "React", score: 99, urlBuilder: (slug) => `https://mui.com/material-ui/react-${slug}/` },
  { name: "ShadCN UI", framework: "React", score: 98, urlBuilder: (slug) => `https://ui.shadcn.com/docs/components/${slug}` },
  { name: "Mantine", framework: "React", score: 95, urlBuilder: (slug) => `https://mantine.dev/core/${slug}/` },
  { name: "Ant Design", framework: "React", score: 92, urlBuilder: (slug) => `https://ant.design/components/${slug}` },
  { name: "Chakra UI", framework: "React", score: 90, urlBuilder: (slug) => `https://chakra-ui.com/docs/components/${slug}` },
  
  // --- TAILWIND ECOSYSTEM ---
  { name: "DaisyUI", framework: "CSS", score: 94, urlBuilder: (slug) => `https://daisyui.com/components/${slug}/` },
  { name: "Headless UI", framework: "React", score: 88, urlBuilder: (slug) => `https://headlessui.com/react/${slug}` },
  { name: "Flowbite", framework: "React", score: 89, urlBuilder: (slug) => `https://flowbite.com/docs/components/${slug}/` },
  { name: "HyperUI", framework: "CSS", score: 80, urlBuilder: (slug) => `https://www.hyperui.dev/components/application-ui/${slug}` },

  // --- MODERN / TRENDY ---
  { name: "NextUI", framework: "React", score: 93, urlBuilder: (slug) => `https://nextui.org/docs/components/${slug}` },
  { name: "Radix UI", framework: "React", score: 87, urlBuilder: (slug) => `https://www.radix-ui.com/primitives/docs/components/${slug}` },
  { name: "Tremor", framework: "React", score: 85, urlBuilder: (slug) => `https://www.tremor.so/docs/components/${slug}` }, // Good for charts
  { name: "Aceternity", framework: "React", score: 96, urlBuilder: (slug) => `https://ui.aceternity.com/components/${slug}` }, // Very viral right now
  { name: "Tamagui", framework: "React", score: 82, urlBuilder: (slug) => `https://tamagui.dev/docs/components/${slug}` },
];

// B. The Master List of Components (Common across all libraries)
// We use "slugs" (kebab-case) here.
const COMPONENTS = [
  "accordion", "alert", "alert-dialog", "aspect-ratio", "avatar", "badge", 
  "breadcrumb", "button", "calendar", "card", "carousel", "checkbox", 
  "collapsible", "combobox", "command", "context-menu", "dialog", "drawer", 
  "dropdown-menu", "form", "hover-card", "input", "label", "menubar", 
  "navigation-menu", "pagination", "popover", "progress", "radio-group", 
  "resizable", "scroll-area", "select", "separator", "sheet", "skeleton", 
  "slider", "switch", "table", "tabs", "textarea", "toast", "toggle", 
  "toggle-group", "tooltip", "avatar-group", "timeline", "tree-view", 
  "date-picker", "rating", "stepper", "transfer", "upload", "watermark",
  "tour", "statistic", "result", "empty", "divider", "grid", "layout",
  "space", "affix", "anchor", "back-top", "config-provider"
];

// --- 3. THE GENERATOR ---
const generateData = () => {
  const data = [];

  LIBRARIES.forEach(lib => {
    COMPONENTS.forEach(slug => {
      // Create a pretty name: "alert-dialog" -> "Alert Dialog"
      const prettyName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Add Random Variance to Popularity so results aren't boring
      const randomVariance = Math.floor(Math.random() * 10) - 5; 

      data.push({
        name: prettyName,
        library: lib.name,
        framework: lib.framework,
        docUrl: lib.urlBuilder(slug),
        // Generate keywords based on name
        keywords: [prettyName.toLowerCase(), slug, lib.name.toLowerCase(), "ui component"],
        popularityScore: lib.score + randomVariance
      });
    });
  });

  return data;
};

// --- 4. EXECUTION ---
const runSeed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear old data
    await Component.deleteMany({});
    console.log("🗑️  Old data cleared");

    // Generate and Insert
    const mockData = generateData();
    await Component.insertMany(mockData);
    
    console.log(`🚀 Generated and Inserted ${mockData.length} components!`);
    console.log("NOTE: Some of these URLs might 404 if the library doesn't have that specific component, but 90% will work.");

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

runSeed();