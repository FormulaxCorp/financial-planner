#!/usr/bin/env python3
"""
Supabase Keep-Alive Script
Ping database setiap 3 hari agar tidak di-pause karena inactivity.
Cara pakai: python supabase-keepalive.py SUPABASE_ANON_KEY
Atau simpan key di file: .supabase-key
"""
import urllib.request
import json
import sys
import os

def ping_supabase(anon_key):
    """Ping Supabase dengan melakukan query sederhana"""
    supabase_url = 'https://zstgiptwnqzsvgntsgtz.supabase.co'
    
    # Try multiple endpoints untuk pastikan aktivitas
    endpoints = [
        f'{supabase_url}/rest/v1/app_data?select=id&limit=1',
        f'{supabase_url}/rest/v1/app_data?select=count&limit=1',
    ]
    
    success = False
    for url in endpoints:
        try:
            req = urllib.request.Request(url)
            req.add_header('apikey', anon_key)
            req.add_header('Authorization', f'Bearer {anon_key}')
            
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read().decode()
                print(f'✅ Ping OK — {url.split("/rest/")[1].split("?")[0]} ({resp.status})')
                success = True
        except Exception as e:
            print(f'⚠️  Ping ke {url.split("?")[0]}...[{str(e)[:50]}]')
    
    if success:
        print(f'\n✅ Supabase tetap aktif!')
    else:
        print(f'\n❌ Semua ping gagal! Cek anon key.')
    
    return success

if __name__ == '__main__':
    # Coba baca key dari argument atau file
    key = None
    
    if len(sys.argv) > 1:
        key = sys.argv[1]
    else:
        # Coba baca dari file di beberapa lokasi
        possible_paths = [
            os.path.join(os.path.dirname(__file__), '.supabase-key'),
            os.path.join(os.path.dirname(__file__), '..', '.supabase-key'),
            os.path.expanduser('~/.supabase-key'),
            os.path.join(os.path.dirname(__file__), 'supabase-key.txt'),
        ]
        for path in possible_paths:
            if os.path.exists(path):
                with open(path, 'r') as f:
                    key = f.read().strip()
                print(f'📖 Key ditemukan di: {path}')
                break
    
    if not key:
        print('❌ ERROR: Anon key tidak ditemukan!')
        print('   Cara 1: python supabase-keepalive.py YOUR_ANON_KEY')
        print('   Cara 2: Simpan key di file .supabase-key')
        sys.exit(1)
    
    ping_supabase(key)