
import json
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

# 櫃買中心每日上櫃股票收盤行情
base = "https://www.tpex.org.tw/www/zh-tw/afterTrading/otc"

# 取得台灣當地日期
today = datetime.now(ZoneInfo("Asia/Taipei")).date()


def test(date):
    # 將西元日期轉換為民國日期
    roc_year = date.year - 1911
    roc_date = f"{roc_year}/{date.month:02d}/{date.day:02d}"

    params = urllib.parse.urlencode({
        "date": roc_date,
        "response": "json",
    })

    url = base + "?" + params

    print("=" * 40)
    print("查詢日期：", date)
    print("API 日期參數：", roc_date)

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.load(response)

        print("回傳日期：", result.get("date"))

        tables = result.get("tables", [])

        if not tables:
            print("沒有找到資料表")
            return

        for table in tables:
            print("資料表：", table.get("title"))

            fields = table.get("fields", [])
            rows = table.get("data", [])

            print("欄位：", fields)
            print("筆數：", len(rows))

            if rows:
                print("第一筆：", rows[0])
                print("測試成功：取得上櫃股票行情")
            else:
                print("此日期沒有取得股票資料")

    except Exception as e:
        print("查詢失敗：", str(e))


# 測試最近幾個日期
for days_ago in (1, 2, 3, 7):
    test(today - timedelta(days=days_ago))

print("=" * 40)
print("所有測試完成")
