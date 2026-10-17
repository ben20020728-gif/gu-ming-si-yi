#!/usr/bin/env python3
"""Fetch official TWSE/TPEx listed company rosters; fail closed on partial downloads."""
import json, pathlib, re, time, urllib.request
from datetime import datetime, timezone
SOURCES={"TWSE":"https://openapi.twse.com.tw/v1/opendata/t187ap03_L", "OTC":"https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O"}
all_rows=[]
for market,url in SOURCES.items():
    for attempt in range(3):
        try:
            request=urllib.request.Request(url,headers={"User-Agent":"StockNameQuiz/1.0 (educational noncommercial)","Accept":"application/json"})
            with urllib.request.urlopen(request,timeout=45) as response:
                data=json.load(response)
            break
        except Exception:
            if attempt==2: raise
            time.sleep(2*(attempt+1))
    if not isinstance(data,list): raise ValueError(f"{market}: expected list")
    rows=[]
    for r in data:
        code=str(r.get("公司代號","")).strip()
        name=str(r.get("公司簡稱") or r.get("公司名稱") or "").strip()
        if not re.fullmatch(r"[0-9]{4}",code) or not name: continue
        rows.append({"code":code,"name":name,"industry":str(r.get("產業別") or "未分類").strip(),"market":market,"tier":1})
    if len(rows)<500: raise ValueError(f"{market}: only {len(rows)} stocks, refusing to publish incomplete dataset")
    print(f"{market}: {len(rows)}")
    all_rows+=rows
unique={r['code']:r for r in all_rows}
if len(unique)<1200: raise ValueError(f"Only {len(unique)} unique stocks, refusing incomplete dataset")
result=sorted(unique.values(),key=lambda r:r['code'])
output=pathlib.Path(__file__).resolve().parent/'stocks.json'
output.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(f"Wrote {len(result)} stocks to {output.name} at {datetime.now(timezone.utc).isoformat()}")
