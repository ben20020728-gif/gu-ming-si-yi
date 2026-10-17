
import json
import urllib.request

sources = {
    "TWSE": "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL",
    "OTC": "https://www.tpex.org.tw/www/zh-tw/afterTrading/otc?response=json",
}

for market, url in sources.items():
    print(f"\n=== {market} ===")
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.load(response)

        print("資料型態：", type(data).__name__)

        if isinstance(data, list):
            print("筆數：", len(data))
            print("第一筆：", data[0] if data else "空")
        elif isinstance(data, dict):
            print("欄位：", list(data.keys()))
            for key, value in data.items():
                if isinstance(value, list):
                    print(f"{key} 筆數：", len(value))
                    if value:
                        print("第一筆：", value[0])
                    break
    except Exception as e:
        print("測試失敗：", str(e))
