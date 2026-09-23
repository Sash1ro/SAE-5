import { Appearance } from "react-native"

const currentTheme = Appearance.getColorScheme();
const isDark = currentTheme === "dark"

const light = {
  main: "#3d5aff",        
  background: "#ffffff", 
  bg2: "#f3f4f6",         
  border: "#e5e7eb",     
  onMain: "#ffffff",    
  onBg: "#111827",      
  altText: "#4b5563",     
  placeHolder: "#9ca3af",
  error: '#ef4444', 
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
  error: '#ef4444', 
};

export const colors = isDark ? dark : light

