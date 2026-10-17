#!/usr/bin/env python3
"""Build the TWSE + OTC stock roster for 股名思義."""
import csv
import io
import json
import pathlib
import re
import time
import urllib.request
from datetime import datetime, timezone

SOURCES = {
    "TWSE": "https://openapi.twse.com.tw/v1/opendata/t187ap03_L",
    "OTC": "https://mopsfin.twse.com.tw/opendata/t187ap03_O.csv",
}

def download(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 StockNameQuiz/1.0",
                    "Accept": "*/*",
                },
            )
            with urllib.request.urlopen(req, timeout=60) as response:
                return response.read()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(3 * (attempt + 1))

def parse_csv(raw):
    for encoding in ("utf-8-sig", "cp950", "big5"):
        try:
            content = raw.decode(encoding)
            rows = list(csv.DictReader(io.StringIO(content)))
            if rows and "公司代號" in rows[0]:
                return rows
        except (UnicodeError, csv.Error):
            continue
    raise ValueError("OTC CSV encoding or headers are invalid")

all_rows = []

for market, url in SOURCES.items():
    raw = download(url)
    if market == "TWSE":
        data = json.loads(raw.decode("utf-8-sig"))
        if not isinstance(data, list):
            raise ValueError("TWSE API did not return a list")
    else:
        data = parse_csv(raw)

    rows = []
    for item in data:
        code = str(item.get("公司代號") or "").strip()
        name = str(
            item.get("公司簡稱")
            or item.get("公司名稱")
            or ""
        ).strip()
        industry = str(item.get("產業別") or "未分類").strip()

        if not re.fullmatch(r"[0-9]{4}", code) or not name:
            continue

        rows.append({
            "code": code,
            "name": name,
            "industry": industry,
            "market": market,
            "tier": 1,
        })

    if len(rows) < 500:
        raise ValueError(
            f"{market}: only {len(rows)} stocks; refusing incomplete dataset"
        )

    print(f"{market}: {len(rows)} stocks")
    all_rows.extend(rows)

unique = {row["code"]: row for row in all_rows}
if len(unique) < 1200:
    raise ValueError("Combined stock roster is unexpectedly small")

result = sorted(unique.values(), key=lambda row: row["code"])
output = pathlib.Path(__file__).resolve().parent / "stocks.json"
output.write_text(
    json.dumps(result, ensure_ascii=False, separators=(",", ":")),
    encoding="utf-8",
)
print(
    f"Wrote {len(result)} stocks to {output.name} "
    f"at {datetime.now(timezone.utc).isoformat()}"
)
