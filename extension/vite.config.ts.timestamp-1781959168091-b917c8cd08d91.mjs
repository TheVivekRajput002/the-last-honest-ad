// vite.config.ts
import { defineConfig } from "file:///C:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/Fullstack/The%20Last%20Honest%20Ad/extension/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/Fullstack/The%20Last%20Honest%20Ad/extension/node_modules/@vitejs/plugin-react/dist/index.js";
import { crx } from "file:///C:/Users/ASUS/Documents/VS%20code%20Files/WEB%20DEV/Fullstack/The%20Last%20Honest%20Ad/extension/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "The Last Honest Ad",
  version: "1.0.0",
  description: "Expose the true environmental footprint of products on e-commerce sites.",
  permissions: [
    "activeTab",
    "storage"
  ],
  host_permissions: [
    "https://*/*",
    "http://*/*"
  ],
  action: {
    default_popup: "index.html",
    default_title: "The Last Honest Ad"
  },
  content_scripts: [
    {
      matches: [
        "https://*/*",
        "http://*/*"
      ],
      js: [
        "src/content-script.ts"
      ]
    }
  ],
  icons: {
    "16": "public/icon16.png",
    "48": "public/icon48.png",
    "128": "public/icon128.png"
  }
};

// vite.config.ts
var vite_config_default = defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest_default })
  ],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFTVVNcXFxcRG9jdW1lbnRzXFxcXFZTIGNvZGUgRmlsZXNcXFxcV0VCIERFVlxcXFxGdWxsc3RhY2tcXFxcVGhlIExhc3QgSG9uZXN0IEFkXFxcXGV4dGVuc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQVNVU1xcXFxEb2N1bWVudHNcXFxcVlMgY29kZSBGaWxlc1xcXFxXRUIgREVWXFxcXEZ1bGxzdGFja1xcXFxUaGUgTGFzdCBIb25lc3QgQWRcXFxcZXh0ZW5zaW9uXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BU1VTL0RvY3VtZW50cy9WUyUyMGNvZGUlMjBGaWxlcy9XRUIlMjBERVYvRnVsbHN0YWNrL1RoZSUyMExhc3QlMjBIb25lc3QlMjBBZC9leHRlbnNpb24vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjcnggfSBmcm9tICdAY3J4anMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4vbWFuaWZlc3QuanNvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGNyeCh7IG1hbmlmZXN0IH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgaG1yOiB7XG4gICAgICBwb3J0OiA1MTczLFxuICAgIH0sXG4gIH0sXG59KTtcbiIsICJ7XG4gIFwibWFuaWZlc3RfdmVyc2lvblwiOiAzLFxuICBcIm5hbWVcIjogXCJUaGUgTGFzdCBIb25lc3QgQWRcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIkV4cG9zZSB0aGUgdHJ1ZSBlbnZpcm9ubWVudGFsIGZvb3RwcmludCBvZiBwcm9kdWN0cyBvbiBlLWNvbW1lcmNlIHNpdGVzLlwiLFxuICBcInBlcm1pc3Npb25zXCI6IFtcbiAgICBcImFjdGl2ZVRhYlwiLFxuICAgIFwic3RvcmFnZVwiXG4gIF0sXG4gIFwiaG9zdF9wZXJtaXNzaW9uc1wiOiBbXG4gICAgXCJodHRwczovLyovKlwiLFxuICAgIFwiaHR0cDovLyovKlwiXG4gIF0sXG4gIFwiYWN0aW9uXCI6IHtcbiAgICBcImRlZmF1bHRfcG9wdXBcIjogXCJpbmRleC5odG1sXCIsXG4gICAgXCJkZWZhdWx0X3RpdGxlXCI6IFwiVGhlIExhc3QgSG9uZXN0IEFkXCJcbiAgfSxcbiAgXCJjb250ZW50X3NjcmlwdHNcIjogW1xuICAgIHtcbiAgICAgIFwibWF0Y2hlc1wiOiBbXG4gICAgICAgIFwiaHR0cHM6Ly8qLypcIixcbiAgICAgICAgXCJodHRwOi8vKi8qXCJcbiAgICAgIF0sXG4gICAgICBcImpzXCI6IFtcbiAgICAgICAgXCJzcmMvY29udGVudC1zY3JpcHQudHNcIlxuICAgICAgXVxuICAgIH1cbiAgXSxcbiAgXCJpY29uc1wiOiB7XG4gICAgXCIxNlwiOiBcInB1YmxpYy9pY29uMTYucG5nXCIsXG4gICAgXCI0OFwiOiBcInB1YmxpYy9pY29uNDgucG5nXCIsXG4gICAgXCIxMjhcIjogXCJwdWJsaWMvaWNvbjEyOC5wbmdcIlxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRjLFNBQVMsb0JBQW9CO0FBQ3plLE9BQU8sV0FBVztBQUNsQixTQUFTLFdBQVc7OztBQ0ZwQjtBQUFBLEVBQ0Usa0JBQW9CO0FBQUEsRUFDcEIsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsYUFBZTtBQUFBLEVBQ2YsYUFBZTtBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0Esa0JBQW9CO0FBQUEsSUFDbEI7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBVTtBQUFBLElBQ1IsZUFBaUI7QUFBQSxJQUNqQixlQUFpQjtBQUFBLEVBQ25CO0FBQUEsRUFDQSxpQkFBbUI7QUFBQSxJQUNqQjtBQUFBLE1BQ0UsU0FBVztBQUFBLFFBQ1Q7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsSUFBTTtBQUFBLFFBQ0o7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNUO0FBQ0Y7OztBRDVCQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixJQUFJLEVBQUUsMkJBQVMsQ0FBQztBQUFBLEVBQ2xCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUEsTUFDSCxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
