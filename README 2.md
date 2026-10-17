# 股名思義 v5 — 完整上市櫃股票抓取版

## 重點
- 官方上市來源：https://openapi.twse.com.tw/v1/opendata/t187ap03_L
- 官方上櫃來源：https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O
- `update_stocks.py` 抓取股票代碼、公司簡稱、產業代碼、市場別，檢查兩市場各至少 500 檔，總計至少 1200 檔，避免只抓到少量資料卻覆蓋正式題庫。
- 產生 `stocks.json` 後，網頁開啟時會自動載入完整題庫，不需要每位玩家手動按更新。

## 最簡單：用 GitHub Actions 建立 Netlify 可上傳網站
1. 在 GitHub 新增一個儲存庫，將這個資料夾的**所有檔案**（包含 `.github/workflows/update-stocks.yml`）放在儲存庫根目錄。
2. 進入 GitHub 儲存庫 **Actions → Build full stock quiz website → Run workflow**。
3. 執行成功後，開啟該次工作，從 **Artifacts** 下載 `股名思義-完整上市櫃題庫-網站.zip`。
4. 解壓縮該 ZIP，確認裡面有 `index.html` 與 `stocks.json`。
5. 在 Netlify 原本網站的 **Deploys** 頁面部署解壓後的資料夾（不要新建網站，才能保留網址）。
6. 之後網站會自動載入完整題庫。GitHub Actions 會在平日定時重新產生新的 Artifact，但**不會自動部署 Netlify**；要保持網站資料最新，需重新部署或另接自動部署流程。

也可以在有網路的電腦上執行 `python update_stocks.py`，將產生的 `stocks.json` 與網站檔案一起上傳。

**注意**：高權值（市值前100）與冷門股（20交易日均量 < 1500張）仍需要行情資料，這版先完成全上市櫃名單；不會以錯誤數據假裝已完成這兩個類型。
