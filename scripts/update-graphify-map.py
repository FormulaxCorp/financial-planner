#!/usr/bin/env python3
"""
Update Graphify map untuk financial-planner.
Menjalankan skrip otomatis ketika ada perubahan file di project:
- Cek struktur file (index.html, js/, css/)
- Cek script include order di index.html
- Cek fungsi render di app.js
- Update referensi graphify jika ada perubahan

Cara pakai:
  python update-graphify-map.py [--dry-run]
"""
import os
import re
import json
import sys
import hashlib

PROJECT_DIR = os.path.expanduser('~/Document/financial-planner')
GRAPH_REF = os.path.expanduser('~/AppData/Local/hermes/profiles/home-support/skills/software-development/graphify/references/financial-planner-graph.md')
STATE_FILE = os.path.expanduser('~/AppData/Local/hermes/profiles/home-support/skills/software-development/graphify/references/.financial-planner-state.json')

def file_hash(path):
    """Hash file untuk deteksi perubahan"""
    try:
        with open(path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()[:12]
    except Exception:
        return None

def scan_project():
    """Scan struktur project dan kembalikan dict info"""
    info = {
        'files': {},
        'scripts': [],
        'pages': [],
        'render_funcs': [],
        'data_sections': [],
    }
    
    # Script order dari index.html
    index_path = os.path.join(PROJECT_DIR, 'index.html')
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Script includes
        info['scripts'] = re.findall(r'<script src="([^"]+)"></script>', content)
        
        # Pages
        info['pages'] = re.findall(r'<section class="page[^"]*" id="page-([^"]+)"', content)
    
    # Hash semua file penting
    for root, dirs, files in os.walk(PROJECT_DIR):
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', 'backups', '.github', 'icons')]
        for fname in files:
            if fname.endswith(('.html', '.js', '.css', '.json')):
                fpath = os.path.join(root, fname)
                rel = os.path.relpath(fpath, PROJECT_DIR).replace('\\', '/')
                info['files'][rel] = file_hash(fpath)
    
    # Render functions di app.js
    app_path = os.path.join(PROJECT_DIR, 'js', 'app.js')
    if os.path.exists(app_path):
        with open(app_path, 'r', encoding='utf-8') as f:
            content = f.read()
        info['render_funcs'] = re.findall(r'function (render\w+)\(', content)
        info['save_funcs'] = re.findall(r'function (save\w+)\(', content)
    
    return info

def load_state():
    try:
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return {}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def update_reference(info):
    """Update referensi graphify dengan info terbaru"""
    scripts = '\n'.join(f'  ├── {s}' for s in info['scripts'][1:]) if info['scripts'] else '  (none)'
    pages = ', '.join(info['pages']) if info['pages'] else '(none)'
    renders = ', '.join(info['render_funcs']) if info['render_funcs'] else '(none)'
    
    with open(GRAPH_REF, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update timestamp
    content = re.sub(
        r'> Last updated:.*',
        f'> Last updated: {__import__("datetime").date.today().isoformat()}',
        content
    )
    
    # Update script order section
    content = re.sub(
        r'  scripts:.*',
        f'  scripts: {info["scripts"][0] if info["scripts"] else "(none)"}',
        content
    )
    
    return content

def main():
    dry_run = '--dry-run' in sys.argv
    silent = '--silent' in sys.argv
    
    print(f'Scanning: {PROJECT_DIR}')
    info = scan_project()
    
    state = load_state()
    prev_files = state.get('files', {})
    
    changes = []
    for f, h in info['files'].items():
        if f not in prev_files:
            changes.append(f'  + {f} (baru)')
        elif prev_files[f] != h:
            changes.append(f'  ~ {f} (berubah)')
    
    for f in prev_files:
        if f not in info['files']:
            changes.append(f'  - {f} (dihapus)')
    
    if changes:
        if not silent:
            print(f'\n📦 Perubahan terdeteksi ({len(changes)}):')
            for c in changes:
                print(c)
        
        if not dry_run:
            new_content = update_reference(info)
            with open(GRAPH_REF, 'w', encoding='utf-8') as f:
                f.write(new_content)
            save_state(info)
            if not silent:
                print('\n✅ Graphify map updated!')
        elif not silent:
            print('\n(dry-run — tidak menulis perubahan)')
    else:
        if not silent:
            print('\n✅ Tidak ada perubahan — graphify map sudah up-to-date.')
        if not dry_run:
            save_state(info)

if __name__ == '__main__':
    main()