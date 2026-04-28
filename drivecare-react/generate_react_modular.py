import os
import re
from bs4 import BeautifulSoup

base_dir = '/Users/akhilesh/.gemini/antigravity/scratch/drivecare-react'
html_path = '/Users/akhilesh/Downloads/drivecare-complete (2).html'

def write_f(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def html_to_jsx(html_str):
    """Converts HTML string to JSX compliant syntax"""
    s = html_str
    s = s.replace('class=', 'className=')
    s = s.replace('for=', 'htmlFor=')
    s = s.replace('onclick=', 'onClick=')
    s = s.replace('oninput=', 'onInput=')
    s = s.replace('tabindex=', 'tabIndex=')
    s = s.replace('style="display: none;"', 'style={{display: "none"}}')
    s = s.replace('style="display:none;"', 'style={{display: "none"}}')
    s = s.replace('style="display:none"', 'style={{display: "none"}}')
    s = s.replace('style="width:0%"', 'style={{width: "0%"}}')
    # Close unclosed tags
    s = re.sub(r'<input([^>]*?)(?<!/)>', r'<input\1/>', s)
    s = re.sub(r'<img([^>]*?)(?<!/)>', r'<img\1/>', s)
    s = re.sub(r'<hr([^>]*?)(?<!/)>', r'<hr\1/>', s)
    s = re.sub(r'<br([^>]*?)(?<!/)>', r'<br\1/>', s)
    # Fix HTML comments 
    s = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', s, flags=re.DOTALL)
    # Fix inline styles with variables (naive replacement)
    s = re.sub(r'style="([^"]*)"', '', s) # Strip remaining complex inline styles to avoid JSX parse errors since we extract static CSS anyway
    return s

with open(html_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# Create component files
imports = []
routes = []

app_shell = soup.find(id='app-shell')
main_area = soup.find(id='main-area')

screens = main_area.find_all('div', class_='screen')
modals = [child for child in main_area.children if child.name == 'div' and ('screen' not in child.get('class', []))]
sidebars = soup.find_all(id='sidebar')

# 1. Generate Screens
for screen in screens:
    # Disable manual style block for screen component since Router handles visibility
    screen['style'] = '' 
    s_id = screen.get('id', 'Unknown')
    # capitalize first letter
    c_name = s_id[0].upper() + s_id[1:]
    
    jsx = html_to_jsx(str(screen))
    file_content = f"""import React from 'react';

export default function {c_name}() {{
  return (
    <>
      {jsx}
    </>
  );
}}
"""
    write_f(f'{base_dir}/src/screens/{c_name}.jsx', file_content)
    imports.append(f"import {c_name} from './screens/{c_name}.jsx';")
    # Default route is auth if exists
    path = '/' if s_id == 'auth' else f'/{s_id}'
    routes.append(f"          <Route path=\"{path}\" element={{<{c_name} />}} />")

# 2. Generate Global Components (Sidebar, Modals)
sidebar_jsx = ""
if sidebars:
    sidebar_jsx = html_to_jsx(str(sidebars[0]))

modals_html = "".join([str(m) for m in modals if m])
modals_jsx = html_to_jsx(modals_html)

global_comp = f"""import React from 'react';

export function Sidebar() {{
  return (
    <>
      {sidebar_jsx}
    </>
  );
}}

export function GlobalModals() {{
  return (
    <>
      {modals_jsx}
    </>
  );
}}
"""
write_f(f'{base_dir}/src/components/Globals.jsx', global_comp)
imports.append("import { Sidebar, GlobalModals } from './components/Globals.jsx';")

# 3. Generate App.jsx
app_jsx = f"""import React, {{ useEffect }} from 'react';
import {{ BrowserRouter as Router, Routes, Route }} from 'react-dom'; // Will use react-router-dom
import './legacyScript.js';
{chr(10).join(imports)}

export default function App() {{
  useEffect(() => {{
    if (window.initApp) {{
      window.initApp();
    }}
  }}, []);

  return (
    <Router>
      <div id="drive-care-container" style={{{{display: "flex", width: "100%", height: "100vh", overflow: "hidden"}}}}>
        <Sidebar />
        <div id="main-area" style={{{{flex: 1, display: "flex", flexDirection: "column", position: "relative", minWidth: 0}}}}>
          <GlobalModals />
          <Routes>
{chr(10).join(routes)}
          </Routes>
        </div>
      </div>
    </Router>
  );
}}
"""
# Note: Since the real app depends on react-router-dom, update App.jsx import
app_jsx = app_jsx.replace("import { BrowserRouter as Router, Routes, Route } from 'react-dom';", "import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';")

write_f(f'{base_dir}/src/App.jsx', app_jsx)
print("Modular React structure generated successfully!")
