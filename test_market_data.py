
import json
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

base = "https://www.tpex.org.tw/www/zh-tw/afterTrading/otc"

today = datetime.now(ZoneInfo("Asia/Taipei")).date()

def test(date):
    params = urllib.parse.urlencode({
        "date": date.strftime("%Y/%m/%d"),
        "response": "json",
    })
    url = base + "?" + params

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.load(response)

        print("查詢日期：", date)
        print("回傳日期：", result.get("date"))

        for table in result.get("tables", []):
            print("資料表：", table.get("title"))
            print("筆數：", len(table.get("data", [])))
            if table.get("data"):
                print("第一筆：", table["data"][0])
    except Exception as e:
        print("查詢失敗：", str(e))

for days_ago in (1, 2, 3, 7):
    test(today - timedelta(days=days_ago))
