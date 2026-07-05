#!/usr/bin/env python3
"""
Input transaksi ke Financial Planner via Supabase API.
Format: tgl | jenis | kategori | keterangan | nominal | pos

Usage:
  python add-transaction.py "3/7 | keluar | Food | Makan siang | 35000 | Cash"
  python add-transaction.py "3/7 | masuk | Paycheck | Gaji Juli | 5200000 | Blu"
  python add-transaction.py "3/7 | pindah | - | Nabung | 500000 | Blu -> Comfort Life"
"""

import sys
import re
import json
import urllib.request
from datetime import datetime

# Read Supabase credentials
with open('C:/Users/Henry-AI/Document/financial-planner/js/supabase-init.js') as f:
    content = f.read()
    url_match = re.search(r"URL = '([^']+)'", content)
    key_match = re.search(r"ANON_KEY = '([^']+)'", content)

SUPABASE_URL = url_match.group(1)
ANON_KEY = key_match.group(1)

# Category mappings
INCOME_CATS = ['Paycheck', 'Side Income', 'Bonus', 'Gift', 'Refund', 'Other']
EXPENSE_CATS = [
    'Food', 'Groceries', 'Health & Medical', 'Home', 'Travel Expenses',
    'Utilities', 'Phone Credit', 'Entertainment', 'Skin & Body Care',
    "Hiroshi's", "Mpi's", "Henry's", 'Gifts', 'Public Transportation',
    'Event', 'Loan', 'Debt', 'Education', 'Subscription', 'Zakat',
    'Admin Fee', 'Other'
]
POS_NAMES = ['Blu', 'Comfort Life', 'Hiroshi', "Education", "Hiro's Room", 'Fidyah', 'Cash', 'E-money', 'Rekening', 'HBD hiro']

def parse_date(date_str):
    """Parse date like '3/7' or '3/7/26' to YYYY-MM-DD"""
    parts = date_str.strip().split('/')
    now = datetime.now()
    day = int(parts[0])
    month = int(parts[1])
    year = int(parts[2]) if len(parts) > 2 else now.year
    if year < 100:
        year += 2000
    return f"{year}-{month:02d}-{day:02d}"

def parse_transaction(text):
    """Parse transaction text in format: tgl | jenis | kategori | keterangan | nominal | pos"""
    parts = [p.strip() for p in text.split('|')]
    if len(parts) < 5:
        return None, "Format salah. Minimal: tgl | jenis | keterangan | nominal | pos"
    
    tanggal = parse_date(parts[0])
    jenis_raw = parts[1].lower()
    
    # Detect jenis
    if jenis_raw in ['masuk', 'in', 'income', 'pemasukan']:
        jenis = 'Masuk'
    elif jenis_raw in ['keluar', 'out', 'expense', 'pengeluaran']:
        jenis = 'Keluar'
    elif jenis_raw in ['pindah', 'transfer', 'mutasi']:
        jenis = 'Pindah'
    else:
        return None, f"Jenis '{parts[1]}' tidak dikenal. Pakai: masuk/keluar/pindah"
    
    # Handle different column counts
    if len(parts) == 6:
        kategori = parts[2]
        keterangan = parts[3]
        nominal_str = parts[4].replace('.', '').replace(',', '').replace(' ', '')
        pos = parts[5]
    elif len(parts) == 5:
        kategori = '-'
        keterangan = parts[2]
        nominal_str = parts[3].replace('.', '').replace(',', '').replace(' ', '')
        pos = parts[4]
    else:
        return None, "Jumlah kolom tidak sesuai"
    
    try:
        nominal = float(nominal_str)
    except ValueError:
        return None, f"Nominal '{parts[4]}' bukan angka"
    
    # Parse pos (handle transfer: "Blu -> Comfort Life")
    posAsal = pos
    posTujuan = ''
    if '->' in pos or '→' in pos:
        sep = '->' if '->' in pos else '→'
        pos_parts = [p.strip() for p in pos.split(sep)]
        posAsal = pos_parts[0]
        posTujuan = pos_parts[1] if len(pos_parts) > 1 else ''
    
    # Default kategori if not specified
    if kategori == '-' or kategori == '':
        if jenis == 'Masuk':
            kategori = 'Other'
        elif jenis == 'Keluar':
            kategori = 'Other'
        else:
            kategori = 'Transfer Dana'
    
    return {
        'tanggal': tanggal,
        'jenis': jenis,
        'kategori': kategori,
        'keterangan': keterangan,
        'nominal': nominal,
        'posAsal': posAsal,
        'posTujuan': posTujuan,
        'input': 'Chat',
        'oleh': 'Vina'
    }, None

def add_transaction(trans):
    """Add transaction to Supabase"""
    import datetime
    
    # Get current transactions
    req = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/app_data?id=eq.transactions&select=data',
        method='GET'
    )
    req.add_header('apikey', ANON_KEY)
    req.add_header('Authorization', f'Bearer {ANON_KEY}')
    
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
    
    if not data:
        return False, "Data transaksi tidak ditemukan"
    
    items = data[0].get('data', {}).get('items', [])
    
    # Generate ID
    trans['id'] = int(datetime.datetime.now().timestamp() * 1000) + int(datetime.datetime.now().microsecond / 1000)
    
    # Add transaction
    items.append(trans)
    
    # Save back to Supabase (upsert)
    save_data = json.dumps({
        'id': 'transactions',
        'data': {'items': items},
        'updated_at': datetime.datetime.now().isoformat()
    }).encode()
    
    req = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/app_data',
        data=save_data,
        method='POST'
    )
    req.add_header('apikey', ANON_KEY)
    req.add_header('Authorization', f'Bearer {ANON_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'resolution=merge-duplicates')
    
    with urllib.request.urlopen(req) as resp:
        if resp.status in [200, 201, 204]:
            return True, None
        else:
            return False, f"HTTP {resp.status}"

def format_rp(amount):
    """Format as Indonesian Rupiah"""
    return f"Rp {amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

def main():
    if len(sys.argv) < 2:
        print("Usage: python add-transaction.py \"tgl | jenis | kategori | keterangan | nominal | pos\"")
        sys.exit(1)
    
    text = sys.argv[1]
    trans, error = parse_transaction(text)
    
    if error:
        print(f"ERROR: {error}")
        sys.exit(1)
    
    success, error = add_transaction(trans)
    
    if success:
        pos_display = trans['posAsal']
        if trans['posTujuan']:
            pos_display = f"{trans['posAsal']} → {trans['posTujuan']}"
        
        print(f"OK: {trans['jenis']} | {trans['kategori']} | {trans['keterangan']} | {format_rp(trans['nominal'])} | {pos_display}")
    else:
        print(f"ERROR: Gagal menyimpan - {error}")
        sys.exit(1)

if __name__ == '__main__':
    main()
