const seed=`2330|台積電|半導體|1
2317|鴻海|電子代工|1
2454|聯發科|半導體|1
2303|聯電|半導體|1
2308|台達電|電子零組件|1
2881|富邦金|金控|1
2882|國泰金|金控|1
2884|玉山金|金控|1
2891|中信金|金控|1
2886|兆豐金|金控|1
2885|元大金|金控|1
2883|凱基金|金控|1
2880|華南金|金控|2
2892|第一金|金控|2
2890|永豐金|金控|2
5880|合庫金|金控|2
2887|台新新光金|金控|2
2603|長榮|海運|1
2609|陽明|海運|1
2615|萬海|海運|1
2618|長榮航|航空|1
2610|華航|航空|1
2634|漢翔|航太|2
2382|廣達|電子代工|1
3231|緯創|電子代工|1
2356|英業達|電子代工|2
2324|仁寶|電子代工|2
2376|技嘉|電腦硬體|2
2357|華碩|電腦硬體|2
2377|微星|電腦硬體|2
2344|華邦電|記憶體|2
2408|南亞科|記憶體|2
2337|旺宏|記憶體|2
6770|力積電|半導體|2
3711|日月光投控|半導體|2
3034|聯詠|半導體|2
2379|瑞昱|半導體|2
3008|大立光|光學|1
3406|玉晶光|光學|2
6669|緯穎|伺服器|2
3017|奇鋐|散熱|2
3324|雙鴻|散熱|2
1519|華城|重電|2
1513|中興電|重電|2
1503|士電|重電|2
1514|亞力|重電|2
2002|中鋼|鋼鐵|1
2014|中鴻|鋼鐵|2
2027|大成鋼|鋼鐵|2
1101|台泥|水泥|1
1102|亞泥|水泥|2
1216|統一|食品|1
1201|味全|食品|2
1227|佳格|食品|2
1301|台塑|塑化|1
1303|南亞|塑化|1
1326|台化|塑化|1
6505|台塑化|塑化|2
2412|中華電|電信|1
3045|台灣大|電信|1
4904|遠傳|電信|1
5871|中租-KY|租賃|2
2801|彰銀|銀行|2
2834|臺企銀|銀行|2
2812|台中銀|銀行|2
2809|京城銀|銀行|2
2207|和泰車|汽車|2
2201|裕隆|汽車|2
2204|中華|汽車|2
9904|寶成|製鞋|2
9910|豐泰|製鞋|2
1476|儒鴻|紡織|2
1477|聚陽|紡織|2
2301|光寶科|電子零組件|2
2327|國巨|電子零組件|2
2368|金像電|PCB|2
3037|欣興|PCB|2
8046|南電|PCB|2
3189|景碩|PCB|2
2347|聯強|通路|2
3702|大聯大|通路|2
2606|裕民|散裝航運|2
2605|新興|散裝航運|2
2612|中航|散裝航運|2
2637|慧洋-KY|散裝航運|2`.split('\n').map(x=>{const [code,name,industry,tier]=x.split('|');return {code,name,industry,tier:+tier,market:'TWSE'}});
let raw=loadStocks();
const byId=id=>document.getElementById(id), shuffle=a=>{let b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};const store=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};let settings={mode:'mixed',level:'easy',count:10,category:'all'},questions=[],at=0,score=0,selected=false,started=0,missed=[],reviewing=false;
function show(id){['home','quiz','result','records'].forEach(x=>byId(x).classList.toggle('hidden',x!==id));window.scrollTo(0,0)}function syncWrong(){byId('wrongCount').textContent=Object.keys(load('stockWrong',{})).length}function setupGroup(id,key){byId(id).addEventListener('click',e=>{let b=e.target.closest('button[data-value]');if(!b)return;settings[key]=key==='count'?+b.dataset.value:b.dataset.value;if(key==='category')updateCategoryStatus();byId(id).querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b))})}setupGroup('categories','category');setupGroup('modes','mode');setupGroup('levels','level');setupGroup('counts','count');
const related={金控:['銀行','租賃'],銀行:['金控','租賃'],半導體:['記憶體'],記憶體:['半導體'],海運:['散裝航運','航空'],散裝航運:['海運'],航空:['海運','航太'],電子代工:['伺服器','電腦硬體'],電腦硬體:['電子代工','伺服器'],重電:['電子零組件'],PCB:['電子零組件'],光學:['半導體'],散熱:['電子零組件'],塑化:['紡織'],電信:['通路']};
function distractors(stock,pool,level){let others=pool.filter(x=>x.code!==stock.code && x.name!==stock.name);if(level==='hard'){let same=shuffle(others.filter(x=>x.industry===stock.industry));let near=shuffle(others.filter(x=>related[stock.industry]?.includes(x.industry)));let rest=shuffle(others);return [...new Map([...same,...near,...rest].map(x=>[x.code,x])).values()].slice(0,3)}return shuffle(others).slice(0,3)}
function categoryPool(){if(settings.category==='all')return raw.filter(x=>x.market==='TWSE'||x.market==='OTC');if(settings.category==='listed')return raw.filter(x=>x.market==='TWSE');if(settings.category==='otc')return raw.filter(x=>x.market==='OTC');if(settings.category==='top100')return raw.filter(x=>Number.isInteger(x.marketCapRank)&&x.marketCapRank>=1&&x.marketCapRank<=100);return raw.filter(x=>Number.isFinite(x.avgDailyVolumeShares20d)&&x.avgDailyVolumeShares20d<1500000&&x.avgVolumeEndDate)}
function updateCategoryStatus(){let n=categoryPool().length;const labels={all:'上市櫃混合',listed:'上市',otc:'上櫃',top100:'高權值',lowvolume:'冷門股'};byId('categoryStatus').textContent=`${labels[settings.category]}：目前 ${n} 檔可用${n<4?'；請先匯入包含所需欄位的正式資料':''}。${settings.category==='lowvolume'?'以最近 20 個交易日日均成交量低於 1,500 張判定。':settings.category==='top100'?'以全市場市值排名前 100 名判定。':''}`}
function begin(isReview=false){let pool=categoryPool();if(settings.level==='easy')pool=pool.filter(x=>x.tier===1);if(pool.length<4){alert('此分類的可用股票不足 4 檔，請更新或匯入完整題庫；不會以其他分類代替。');return}let targets=isReview?pool.filter(x=>load('stockWrong',{})[x.code]):pool;if(!targets.length){alert('這個分類目前沒有錯題可以複習');return}const count=isReview?Math.min(settings.count,targets.length):Math.min(settings.count,targets.length);let sequence=shuffle(targets).slice(0,count);questions=sequence.map(s=>{let mode=settings.mode==='mixed'?(Math.random()<.5?'code':'name'):settings.mode;let opts=shuffle([s,...distractors(s,pool,settings.level)]);return {s,mode,opts}});at=0;score=0;missed=[];selected=false;started=Date.now();reviewing=isReview;show('quiz');render()}
function render(){const q=questions[at];byId('counter').textContent=`第 ${at+1} / ${questions.length} 題`;byId('liveScore').textContent=`答對 ${score} 題`;byId('bar').style.width=`${at/questions.length*100}%`;byId('prompt').textContent=q.mode==='code'?'以下代碼是哪間公司？':'以下公司的股票代碼是？';byId('stem').textContent=q.mode==='code'?q.s.code:q.s.name;byId('industry').textContent=q.s.industry||'未分類';byId('feedback').textContent='';byId('next').classList.add('hidden');byId('next').textContent=at===questions.length-1?'查看成績':'下一題 →';byId('options').replaceChildren();selected=false;q.opts.forEach((o,i)=>{let b=document.createElement('button');b.className='option';let tag=document.createElement('span');tag.textContent='ABCD'[i];b.append(tag,document.createTextNode(q.mode==='code'?o.name:o.code));b.addEventListener('click',()=>answer(o.code));byId('options').append(b)})}
function answer(code){if(selected)return;selected=true;let q=questions[at],right=code===q.s.code;if(right){score++;let w=load('stockWrong',{});if(w[q.s.code]){delete w[q.s.code];store('stockWrong',w)}}else{missed.push(q.s);let w=load('stockWrong',{});w[q.s.code]=(w[q.s.code]||0)+1;store('stockWrong',w)}[...byId('options').children].forEach((b,i)=>{b.disabled=true;if(q.opts[i].code===q.s.code)b.classList.add('good');else if(q.opts[i].code===code)b.classList.add('bad')});byId('feedback').textContent=`${right?'✓ 答對了！':'✕ 答錯了！'} 正解：${q.s.code} ${q.s.name}`;byId('bar').style.width=`${(at+1)/questions.length*100}%`;byId('next').classList.remove('hidden');syncWrong()}
function finish(early=false){let sec=Math.round((Date.now()-started)/1000),record={date:new Date().toLocaleString('zh-TW'),score,total:early?at+(selected?1:0):questions.length,planned:questions.length,early,sec,level:settings.level,mode:settings.mode,category:settings.category};store('stockHistory',[record,...load('stockHistory',[])].slice(0,100));const answered=early?at+(selected?1:0):questions.length;byId('finalScore').textContent=answered?`${Math.round(score/answered*100)} 分`:'0 分';byId('summary').textContent=`答對 ${score} / 已作答 ${answered} 題 · ${sec} 秒 · ${missed.length} 題答錯`;byId('resultNote').textContent=early?`提前結算：原訂 ${questions.length} 題，未作答題目不計入正確率。`:'';show('result')}
byId('start').onclick=()=>begin();byId('quizHome').onclick=()=>finish(true);byId('next').onclick=()=>{if(++at===questions.length)finish();else render()};byId('retry').onclick=()=>begin(reviewing);byId('homeBtn').onclick=()=>show('home');byId('back').onclick=()=>show('home');byId('review').onclick=()=>records('wrong');byId('history').onclick=()=>records('history');byId('reviewStart').onclick=()=>begin(true);byId('share').onclick=async()=>{let n=at+(selected?1:0);let t=`📈 股名思義：我答對 ${score}/${n} 題，正確率 ${n?Math.round(score/n*100):0}%！你也來挑戰：${location.origin+location.pathname}`;try{if(navigator.share)await navigator.share({title:'股名思義',text:t});else if(navigator.clipboard){await navigator.clipboard.writeText(t);alert('成績已複製，可貼到 LINE 分享')}else prompt('複製以下文字',t)}catch(e){if(e.name!=='AbortError')prompt('複製以下文字',t)}};
function records(kind){let body=byId('recordBody');body.replaceChildren();byId('reviewStart').classList.toggle('hidden',kind!=='wrong');byId('recordTitle').textContent=kind==='wrong'?'錯題本':'歷史成績';if(kind==='wrong'){let w=load('stockWrong',{}),list=raw.filter(x=>w[x.code]);if(!list.length)body.textContent='目前沒有錯題，繼續保持！';list.forEach(s=>{let div=document.createElement('div');div.className='wrong';div.textContent=`${s.code} ${s.name} · ${s.industry}（答錯 ${w[s.code]} 次）`;body.append(div)});if(!list.length)byId('reviewStart').classList.add('hidden')}else{let h=load('stockHistory',[]);if(!h.length)body.textContent='尚無測驗紀錄';h.forEach(r=>{let div=document.createElement('div');div.className='wrong';div.textContent=`${r.date}｜${r.score}/${r.total} 題${r.early?'（提前結算）':''}｜${r.sec} 秒｜${r.level}`;body.append(div)})}show('records')}
syncWrong();if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

// 官方資料可由 GitHub Actions 定期產生 stocks.json，或在瀏覽器手動匯入 CSV。
function loadStocks(){try{const x=JSON.parse(localStorage.getItem('stockQuizFullData'));if(Array.isArray(x)&&x.length>=4)return x}catch(e){}return seed}
function normalize(rows,market){return rows.map(r=>{const code=String(r['公司代號']||r['Code']||r.code||'').trim();const name=String(r['公司簡稱']||r['公司名稱']||r['CompanyAbbreviation']||r.name||'').trim();const industry=String(r['產業別']||r['Industry']||r.industry||'未分類').trim();return {code,name,industry,market: String(r.market||r['市場別']||market).toUpperCase()==='OTC'?'OTC':'TWSE',tier:1,marketCapRank:Number(r.marketCapRank||r['市值排名'])||null,avgDailyVolumeShares20d:r.avgDailyVolumeShares20d!==undefined&&r.avgDailyVolumeShares20d!==''?Number(r.avgDailyVolumeShares20d):r['20日平均成交股數']!==undefined&&r['20日平均成交股數']!==''?Number(String(r['20日平均成交股數']).replace(/,/g,'')):null,avgVolumeEndDate:r.avgVolumeEndDate||r['均量截止日期']||null}}).filter(x=>/^\d{4}$/.test(x.code)&&x.name)}
function combine(list){const map=new Map();for(const x of list)if(!map.has(x.code))map.set(x.code,x);return [...map.values()]}
function installData(rows,source){const merged=combine(rows);if(merged.length<4)throw Error('有效股票不足四檔');raw=merged;store('stockQuizFullData',raw);store('stockQuizSource',{source,at:new Date().toLocaleString('zh-TW')});updateDataStatus();updateCategoryStatus();syncWrong()}
function updateDataStatus(){const meta=load('stockQuizSource',null);byId('dataStatus').textContent=meta?`目前題庫：${raw.length} 檔｜${meta.source}｜${meta.at}`:`目前題庫：${raw.length} 檔示範股票（尚未載入完整上市櫃）`}
async function fetchJson(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const data=await r.json();if(!Array.isArray(data))throw Error('資料格式錯誤');return data}
async function refreshData(){const b=byId('refreshData');b.disabled=true;b.textContent='正在更新題庫…';try{let rows=await fetchJson('./stocks.json');if(rows.length<1200)throw Error('stocks.json 尚未建立完整上市櫃資料');installData(rows,'網站完整資料');alert(`已載入 ${raw.length} 檔上市櫃股票`)}catch(e){alert('目前網站尚未提供完整題庫。可使用下方 CSV 匯入，或由網站管理者執行資料更新。\n'+e.message)}finally{b.disabled=false;b.textContent='更新完整上市櫃題庫'}}
function parseCSV(text){text=text.replace(/^\uFEFF/,'');let out=[],row=[],cell='',quote=false;for(let i=0;i<text.length;i++){let c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){cell+='"';i++}else quote=!quote}else if(c===','&&!quote){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))out.push(row);row=[];cell=''}else cell+=c}row.push(cell);if(row.some(x=>x.trim()))out.push(row);const header=out.shift()?.map(x=>x.trim())||[];return out.map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]||''])))}
byId('refreshData').onclick=refreshData;
byId('csvFiles').onchange=async e=>{try{let files=[...e.target.files];if(!files.length)return;let all=[];for(let f of files){let text=await f.text();let rows=parseCSV(text);let market=/otc|上櫃|tpex/i.test(f.name)?'OTC':'TWSE';all.push(...normalize(rows,market))}if(all.length<4)throw Error('找不到足夠的公司代號與公司簡稱，請使用官方 UTF-8 CSV');installData(all,'手動匯入 CSV');alert(`成功匯入 ${raw.length} 檔股票`)}catch(err){alert('匯入失敗：'+err.message)}finally{e.target.value=''}};
updateDataStatus();updateCategoryStatus();

// On each website visit, load a verified full roster if this deployment includes one.
(async()=>{try{const rows=await fetchJson('./stocks.json');const a=rows.filter(x=>x.market==='TWSE').length,b=rows.filter(x=>x.market==='OTC').length;if(rows.length>=1200&&a>=500&&b>=500)installData(rows,'官方完整上市櫃題庫（網站內建）')}catch(e){/* Offline or initial demo deployment; keep existing local dataset. */}})();
