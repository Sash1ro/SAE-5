import { Appearance } from "react-native"

const currentTheme = Appearance.getColorScheme();
const isDark = currentTheme === "dark"

const light = {
  main: "#3d5aff",        
  background: "#ffffff",  // Clean pure white
  bg2: "#f3f4f6",         // Subtle gray for cards/inputs
  border: "#e5e7eb",      // Light structural borders
  onMain: "#ffffff",      // Text on primary buttons
  onBg: "#111827",        // High-contrast main text 
  altText: "#4b5563",     
  placeHolder: "#9ca3af", 
};

const dark = {
  main: "#5c7cfa",        
  background: "#0f172a",  
  bg2: "#1e293b",        
  border: "#334155",      
  onMain: "#ffffff",      
  onBg: "#f8fafc",       
  altText: "#94a3b8",    
  placeHolder: "#64748b", 
};

export const colors = isDark ? dark : light

