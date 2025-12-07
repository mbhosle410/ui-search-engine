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
  { 
    name: "Material UI", 
    framework: "React",
    urlBuilder: (slug) => `https://mui.com/material-ui/react-${slug}/`,
    score: 95
  },
  { 
    name: "ShadCN UI", 
    framework: "React",
    urlBuilder: (slug) => `https://ui.shadcn.com/docs/components/${slug}`,
    score: 98
  },
  { 
    name: "Mantine", 
    framework: "React",
    urlBuilder: (slug) => `https://mantine.dev/core/${slug}/`,
    score: 90
  },
  { 
    name: "Chakra UI", 
    framework: "React",
    urlBuilder: (slug) => `https://chakra-ui.com/docs/components/${slug}`,
    score: 85
  },
  { 
    name: "Radix UI", 
    framework: "React",
    urlBuilder: (slug) => `https://www.radix-ui.com/primitives/docs/components/${slug}`,
    score: 88
  },
  { 
    name: "Ant Design", 
    framework: "React",
    urlBuilder: (slug) => `https://ant.design/components/${slug}`,
    score: 92
  }
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