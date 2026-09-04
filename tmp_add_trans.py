import re, json, urllib.request, datetime, os, sys

os.chdir(r'C:/Users/Henry-AI/Document/financial-planner')

with open('js/supabase-init.js', encoding='utf-8') as f:
    content = f.read()
url_m = re.search(r"https?://[a-z0-9]+\.supabase\.co", content)
key_m = re.search(r"SUPABASE_ANON_KEY\s*=\s*'([^']+)'", content)
assert url_m and key_m, "URL/KEY tidak ketemu di supabase-init.js"
url, key = url_m.group(0), key_m.group(1)

# ---- BACA TRANSISTION & FUNDS existing ----
def get_doc(doc_id):
    req = urllib.request.Request(url + '/rest/v1/app_data?id=eq.' + doc_id, headers={'apikey': key})
    rows = json.loads(urllib.request.urlopen(req).read())
    if not rows: return None
    return rows[0]

trans_row = get_doc('transactions')
funds_row = get_doc('funds')
items = (trans_row['data']['items'] if trans_row and 'items' in trans_row.get('data',{}) else [])
funds  = (funds_row['data']['items'] if funds_row and 'items' in funds_row.get('data',{}) else [])

print(f"Sebelum insert: {len(items)} transaksi")
blu_before = next((f for f in funds if f.get('id')=='Blu'), None)
if blu_before:
    print(f"  Blu startBalance={blu_before.get('startBalance')} saldoAwal={blu_before.get('saldoAwal')} balance={blu_before.get('balance')}")

# ---- TRANSISI BARU ----
now_wib = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=7)
new_trans = {
    'id': int(now_wib.timestamp()*1000),
    'tanggal': now_wib.strftime('%Y-%m-%d'),
    'jenis': 'Keluar',
    'kategori': 'Food',
    'keterangan': 'jajan indomaret',
    'nominal': 19700,
    'posAsal': 'Blu',
    'posTujuan': '',
    'input': 'Chat',
    'oleh': 'Vina'
}
items.append(new_trans)

# ---- UPSERT transactions ----
payload = json.dumps({'data':{'items': items}, 'updated_at': now_wib.isoformat()}).encode('utf-8')
req = urllib.request.Request(
    url + '/rest/v1/app_data?id=eq.transactions',
    data=payload, method='PATCH',
    headers={'apikey': key, 'Content-Type': 'application/json',
             'Prefer': 'resolution=merge-duplicates'}
)
urllib.request.urlopen(req).read()

# ---- VERIFY: GET lagi dari server ----
after = get_doc('transactions')['data']['items']
print(f"Setelah insert (dari server): {len(after)} transaksi")
last = after[-1]
assert last['keterangan']=='jajan indomaret' and last['nominal']==19700, "verifikasi gagal!"
print("OK - transaksi terakhir:", last)
