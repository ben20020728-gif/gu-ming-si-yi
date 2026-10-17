
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

INDUSTRY_NAMES = {
    "01": "水泥工業",
    "02": "食品工業",
    "03": "塑膠工業",
    "04": "紡織纖維",
    "05": "電機機械",
    "06": "電器電纜",
    "08": "玻璃陶瓷",
    "09": "造紙工業",
    "10": "鋼鐵工業",
    "11": "橡膠工業",
    "12": "汽車工業",
    "14": "建材營造",
    "15": "航運業",
    "16": "觀光餐旅",
    "17": "金融保險",
    "18": "貿易百貨",
    "20": "其他業",
    "21": "化學工業",
    "22": "生技醫療業",
    "23": "油電燃氣業",
    "24": "半導體業",
    "25": "電腦及週邊設備業",
    "26": "光電業",
    "27": "通信網路業",
    "28": "電子零組件業",
    "29": "電子通路業",
    "30": "資訊服務業",
    "31": "其他電子業",
    "32": "文化創意業",
    "33": "農業科技業",
    "34": "電子商務業",
    "35": "綠能環保",
    "36": "數位雲端",
    "37": "運動休閒",
    "38": "居家生活",
}

BAD_CHARACTERS = ("\ufffd",)


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


def decode_csv(raw):
    for encoding in ("utf-8-sig", "cp950", "big5"):
        try:
            content = raw.decode(encoding, errors="strict")
            rows = list(csv.DictReader(io.StringIO(content)))

            if not rows:
                continue

            if "公司代號" not in rows[0]:
                continue

            return rows

        except (UnicodeError, csv.Error):
            continue

    raise ValueError("OTC CSV encoding or headers are invalid")


def clean_text(value):
    if value is None:
        return ""
    return str(value).strip().replace("\ufeff", "")


def validate_name(name, code, market):
    if not name:
        return False

    if any(char in name for char in BAD_CHARACTERS):
        raise ValueError(
            f"{market} {code}: stock name contains invalid characters: "
            f"{name!r}"
        )

    return True


def industry_label(value):
    value = clean_text(value)

    if value.isdigit():
        code = value.zfill(2)
        return INDUSTRY_NAMES.get(code, "未分類")

    return value or "未分類"


def parse_twse(raw):
    content = raw.decode("utf-8-sig", errors="strict")
    data = json.loads(content)

    if not isinstance(data, list):
        raise ValueError("TWSE API did not return a list")

    return data


def parse_otc(raw):
    return decode_csv(raw)


def build_market_rows(market, data):
    rows = []

    for item in data:
        code = clean_text(item.get("公司代號"))

        name = clean_text(
            item.get("公司簡稱")
            or item.get("公司名稱")
        )

        industry = industry_label(item.get("產業別"))

        if not re.fullmatch(r"[0-9]{4}", code):
            continue

        if not validate_name(name, code, market):
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
            f"{market}: only {len(rows)} stocks; "
            "refusing incomplete dataset"
        )

    return rows


def main():
    all_rows = []

    for market, url in SOURCES.items():
        print(f"Downloading {market}...")

        raw = download(url)

        if market == "TWSE":
            data = parse_twse(raw)
        else:
            data = parse_otc(raw)

        rows = build_market_rows(market, data)

        print(f"{market}: {len(rows)} stocks")
        all_rows.extend(rows)

    unique = {
        row["code"]: row
        for row in all_rows
    }

    if len(unique) < 1200:
        raise ValueError(
            "Combined stock roster is unexpectedly small"
        )

    result = sorted(
        unique.values(),
        key=lambda row: row["code"]
    )

    output = (
        pathlib.Path(__file__).resolve().parent
        / "stocks.json"
    )

    output.write_text(
        json.dumps(
            result,
            ensure_ascii=False,
            separators=(",", ":")
        ),
        encoding="utf-8"
    )

    print(
        f"Wrote {len(result)} stocks to {output.name} "
        f"at {datetime.now(timezone.utc).isoformat()}"
    )


if __name__ == "__main__":
    main()
