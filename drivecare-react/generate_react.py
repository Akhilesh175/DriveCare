import os
import re
from html.parser import HTMLParser

base_dir = '/Users/akhilesh/.gemini/antigravity/scratch/drivecare-react'
html_path = '/Users/akhilesh/Downloads/drivecare-complete (2).html'

def write_f(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Scaffold Vite + React
package_json = """{
  "name": "drivecare-react",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
"""
write_f(f'{base_dir}/package.json', package_json)

vite_config = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
"""
write_f(f'{base_dir}/vite.config.js', vite_config)

index_html = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0a0a0b" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <title>DriveCare React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""
write_f(f'{base_dir}/index.html', index_html)

main_jsx = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""
write_f(f'{base_dir}/src/main.jsx', main_jsx)

# Parse HTML file
with open(html_path, 'r', encoding='utf-8') as f: content = f.read()

# 1. CSS
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match: write_f(f'{base_dir}/src/index.css', style_match.group(1))

# 2. Main Script
script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
if script_match: 
    s_cont = script_match.group(1)
    s_cont = s_cont.replace('document.addEventListener("DOMContentLoaded"', 'window.initApp = function()')
    s_cont = s_cont.replace('document.addEventListener(\'DOMContentLoaded\'', 'window.initApp = function()')
    write_f(f'{base_dir}/src/legacyScript.js', s_cont)

# 3. HTML Body extraction
body_match = re.search(r'<body>(.*?)<script>', content, re.DOTALL)
if not body_match:
    body_match = re.search(r'<body>(.*?)</body>', content, re.DOTALL)

body_html = body_match.group(1)

# Basic JSX cleanup
body_html = body_html.replace('class=', 'className=').replace('for=', 'htmlFor=').replace('onclick=', 'onClick=')
body_html = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body_html, flags=re.DOTALL)
body_html = re.sub(r'<img([^>]*?)(?<!/)>', r'<img\1/>', body_html)
body_html = re.sub(r'<input([^>]*?)(?<!/)>', r'<input\1/>', body_html)
body_html = re.sub(r'<br([^>]*?)(?<!/)>', r'<br\1/>', body_html)
body_html = re.sub(r'<hr([^>]*?)(?<!/)>', r'<hr\1/>', body_html)
body_html = re.sub(r'<meta([^>]*?)(?<!/)>', r'<meta\1/>', body_html)
body_html = body_html.replace('style="display: none;"', 'style={{display:"none"}}')
body_html = body_html.replace('style="display:none;"', 'style={{display:"none"}}')
body_html = body_html.replace('style="display:none"', 'style={{display:"none"}}')
body_html = body_html.replace('style="width:0%"', 'style={{width:"0%"}}')
body_html = body_html.replace('style="left:0%"', 'style={{left:"0%"}}')
# Need to escape curly braces if any text node contains bare {} (common in JS, but here it's HTML, so probably safe)

app_jsx = f"""import React, {{ useEffect }} from 'react';
import './legacyScript.js';

export default function App() {{
  useEffect(() => {{
    if (window.initApp) {{
      window.initApp();
      if (typeof window.switchMode === 'function') {{
        // optional init logic
      }}
    }}
  }}, []);

  return (
    <div id="drive-care-container">
      {body_html}
    </div>
  );
}}
"""
write_f(f'{base_dir}/src/App.jsx', app_jsx)
print("React structure generated successfully!")
