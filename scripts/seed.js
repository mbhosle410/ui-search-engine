require('dotenv').config();
const mongoose = require('mongoose');

// 1. DATABASE CONNECTION
const MONGODB_URI = process.env.MONGODB_URI;

// 2. SCHEMA DEFINITION
const ComponentSchema = new mongoose.Schema({
  name: String,
  library: String,
  framework: String,
  docUrl: String,
  keywords: [String],
  popularityScore: Number
});

const Component = mongoose.models.Component || mongoose.model('Component', ComponentSchema);

// 3. THE MEGA DATASET (50+ Items)
const seedData = [
  // --- BUTTONS ---
  { name: "Button", library: "Material UI", framework: "React", docUrl: "https://mui.com/material-ui/react-button/", keywords: ["click", "action", "submit", "loading"], popularityScore: 98 },
  { name: "Button", library: "ShadCN UI", framework: "React", docUrl: "https://ui.shadcn.com/docs/components/button", keywords: ["click", "ghost", "outline", "destructive"], popularityScore: 95 },
  { name: "Button", library: "Mantine", framework: "React", docUrl: "https://mantine.dev/core/button/", keywords: ["click", "action", "filled", "light"], popularityScore: 90 },
  { name: "Button", library: "Chakra UI", framework: "React", docUrl: "https://chakra-ui.com/docs/components/button", keywords: ["click", "solid", "outline", "ghost"], popularityScore: 88 },
  { name: "Button", library: "Ant Design", framework: "React", docUrl: "https://ant.design/components/button", keywords: ["click", "action", "loading", "icon"], popularityScore: 92 },

  // --- INPUTS (Text Fields) ---
  { name: "Text Field", library: "Material UI", framework: "React", docUrl: "https://mui.com/material-ui/react-text-field/", keywords: ["input", "form", "text", "password", "email"], popularityScore: 97 },
  { name: "Input", library: "ShadCN UI", framework: "React", docUrl: "https://ui.shadcn.com/docs/components/input", keywords: ["form", "text", "field", "password"], popularityScore: 94 },
  { name: "Input", library: "Mantine", framework: "React", docUrl: "https://mantine.dev/core/input/", keywords: ["text", "field", "form", "focus"], popularityScore: 85 },
  { name: "Input", library: "Chakra UI", framework: "React", docUrl: "https://chakra-ui.com/docs/components/input", keywords: ["text", "field", "password", "addon"], popularityScore: 86 },
  { name: "Input", library: "Ant Design", framework: "React", docUrl: "https://ant.design/components/input", keywords: ["text", "search", "password", "textarea"], popularityScore: 91 },

  // --- SELECTION (Select/Dropdown) ---
  { name: "Select", library: "Material UI", framework: "React", docUrl: "https://mui.com/material-ui/react-select/", keywords: ["dropdown", "menu", "picker", "options", "multi"], popularityScore: 96 },
  { name: "Select", library: "ShadCN UI", framework: "React", docUrl: "https://ui.shadcn.com/docs/components/select", keywords: ["dropdown", "combobox", "picker", "menu"], popularityScore: 93 },
  { name: "Native Select", library: "Mantine", framework: "React", docUrl: "https://mantine.dev/core/native-select/", keywords: ["dropdown", "browser", "default", "picker"], popularityScore: 80 },
  { name: "Select", library: "Chakra UI", framework: "React", docUrl: "https://chakra-ui.com/docs/components/select", keywords: ["dropdown", "picker", "options"], popularityScore: 84 },
  { name: "Select", library: "Ant Design", framework: "React", docUrl: "https://ant.design/components/select", keywords: ["dropdown", "tags", "search", "combobox"], popularityScore: 89 },

  // --- SWITCHES & CHECKBOXES ---
  { name: "Switch", library: "Material UI", framework: "React", docUrl: "https://mui.com/material-ui/react-switch/", keywords: ["toggle", "on", "off", "checkbox"], popularityScore: 94 },
  { name: "Switch", library: "ShadCN UI", framework: "React", docUrl: "https://ui.shadcn.com/docs/components/switch", keywords: ["toggle", "check", "boolean"], popularityScore: 91 },
  { name: "Checkbox", library: "Mantine", framework: "React", docUrl: "https://mantine.dev/core/checkbox/", keywords: ["check", "tick", "selection", "indeterminate"], popularityScore: 82 },
  { name: "Switch", library: "Chakra UI", framework: "React", docUrl: "https://chakra-ui.com/docs/components/switch", keywords: ["toggle", "control", "boolean"], popularityScore: 83 },
  { name: "Radio", library: "Ant Design", framework: "React", docUrl: "https://ant.design/components/radio", keywords: ["check", "selection", "group", "option"], popularityScore: 87 },

  // --- FEEDBACK (Modals, Toasts) ---
  { name: "Dialog", library: "Material UI", framework: "React", docUrl: "https://mui.com/material-ui/react-dialog/", keywords: ["modal", "popup", "window", "alert"], popularityScore: 95 },
  { name: "Dialog", library: "ShadCN UI", framework: "React", docUrl: "https://ui.shadcn.com/docs/components/dialog", keywords: ["modal", "popup", "overlay", "radix"], popularityScore: 94 },
  { name: "Modal", library: "Mantine", framework: "React", docUrl: "https://mantine.dev/core/modal/", keywords: ["dialog", "popup", "overlay", "window"], popularityScore: 88 },
  { name: "Modal", library: "Chakra UI", framework: "React", docUrl: "https://chakra-ui.com/docs/components/modal", keywords: ["dialog", "overlay", "popup", "window"], popularityScore: 89 },
  { name: "Drawer", library: "Ant Design", framework: "React", docUrl: "https://ant.design/components/drawer", keywords: ["sidebar", "panel", "slide", "modal"], popularityScore: 86 },

  // --- ALERTS & NOTIFICATIONS ---
  { name: "Snackbar", library: "Material UI", framework: "React", docUrl: "https://mui.com/material-ui/react-snackbar/", keywords: ["toast", "alert", "notification", "message"], popularityScore: 90 },
  { name: "Toast", library: "ShadCN UI", framework: "React", docUrl: "https://ui.shadcn.com/docs/components/toast", keywords: ["notification", "alert", "snackbar", "message"], popularityScore: 92 },
  { name: "Notification", library: "Mantine", framework: "React", docUrl: "https://mantine.dev/core/notification/", keywords: ["toast", "alert", "message", "feedback"], popularityScore: 84 },
  { name: "Alert", library: "Chakra UI", framework: "React", docUrl: "https://chakra-ui.com/docs/components/alert", keywords: ["feedback", "warning", "error", "success"], popularityScore: 85 },
  { name: "Message", library: "Ant Design", framework: "React", docUrl: "https://ant.design/components/message", keywords: ["toast", "notification", "feedback", "loading"], popularityScore: 91 },

  // --- NAVIGATION (Tabs, Breadcrumbs) ---
  { name: "Tabs", library: "Material UI", framework: "React", docUrl: "https://mui.com/material-ui/react-tabs/", keywords: ["navigation", "panels", "switch", "menu"], popularityScore: 88 },
  { name: "Tabs", library: "ShadCN UI", framework: "React", docUrl: "https://ui.shadcn.com/docs/components/tabs", keywords: ["navigation", "panels", "segments"], popularityScore: 89 },
  { name: "Breadcrumbs", library: "Mantine", framework: "React", docUrl: "https://mantine.dev/core/breadcrumbs/", keywords: ["navigation", "path", "history", "links"], popularityScore: 78 },
  { name: "Breadcrumb", library: "Chakra UI", framework: "React", docUrl: "https://chakra-ui.com/docs/components/breadcrumb", keywords: ["navigation", "path", "links", "hierarchy"], popularityScore: 79 },
  { name: "Pagination", library: "Ant Design", framework: "React", docUrl: "https://ant.design/components/pagination", keywords: ["navigation", "pages", "list", "numbers"], popularityScore: 87 },

  // --- DATA DISPLAY (Tables, Cards) ---
  { name: "Table", library: "Material UI", framework: "React", docUrl: "https://mui.com/material-ui/react-table/", keywords: ["grid", "data", "rows", "columns"], popularityScore: 93 },
  { name: "Card", library: "ShadCN UI", framework: "React", docUrl: "https://ui.shadcn.com/docs/components/card", keywords: ["container", "panel", "box", "display"], popularityScore: 94 },
  { name: "Card", library: "Mantine", framework: "React", docUrl: "https://mantine.dev/core/card/", keywords: ["container", "paper", "box", "image"], popularityScore: 85 },
  { name: "Table", library: "Chakra UI", framework: "React", docUrl: "https://chakra-ui.com/docs/components/table", keywords: ["grid", "data", "rows", "columns"], popularityScore: 82 },
  { name: "Table", library: "Ant Design", framework: "React", docUrl: "https://ant.design/components/table", keywords: ["grid", "data", "spreadsheet", "sort"], popularityScore: 95 },

  // --- SKELETONS (Loading States) ---
  { name: "Skeleton", library: "Material UI", framework: "React", docUrl: "https://mui.com/material-ui/react-skeleton/", keywords: ["loading", "placeholder", "shimmer", "loader"], popularityScore: 85 },
  { name: "Skeleton", library: "ShadCN UI", framework: "React", docUrl: "https://ui.shadcn.com/docs/components/skeleton", keywords: ["loading", "placeholder", "pulse", "loader"], popularityScore: 86 },
  { name: "Skeleton", library: "Mantine", framework: "React", docUrl: "https://mantine.dev/core/skeleton/", keywords: ["loading", "placeholder", "animate"], popularityScore: 78 },
  { name: "Skeleton", library: "Chakra UI", framework: "React", docUrl: "https://chakra-ui.com/docs/components/skeleton", keywords: ["loading", "placeholder", "shimmer"], popularityScore: 79 },
  { name: "Spin", library: "Ant Design", framework: "React", docUrl: "https://ant.design/components/spin", keywords: ["loading", "loader", "spinner", "wait"], popularityScore: 88 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    
    // Clear old data
    await Component.deleteMany({});
    console.log("🗑️  Old data cleared");

    // Insert new MEGA data
    await Component.insertMany(seedData);
    console.log(`🌱 Database seeded with ${seedData.length} components!`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

seedDB();