import { readFileSync, writeFileSync } from 'fs'

const additions = {
  'app.loading': '載入語料庫中……',
  'app.loadingNote': '首次載入約需下載 6 MB，請稍候。',
  'nav.embedding': '語意嵌入圖',
  'emb.title': '語意嵌入圖',
  'emb.subtitle': '所有文本投影至三維語意空間。距離越近代表故事越相似；群集顯露出共通的母題。',
  'emb.filterTitle': '篩選與突顯',
  'emb.searchPlaceholder': '突顯符合的文本……',
  'emb.neighbors': '最近鄰（語意）',
  'emb.axes': 'MiniLM 文本嵌入的三維 UMAP 投影——點越接近代表故事越相似。',
  'emb.hint': '拖曳以旋轉、滾輪縮放、右鍵拖曳平移。點擊節點可查看其語意鄰居。',
  'db.cat.myth-religion': '神話與宗教',
  'db.cat.myth-religion.short': '神話與宗教',
  'db.cat.myth-religion.desc': '神話與宗教同源而不可分割的傳統，其文本歸為一類（印度、北歐、約魯巴、非裔大西洋、凱爾特）。',
  'common.openDetails': '查看詳情',
  'search.loadingSemantic': '正在準備語意引擎——載入模型與嵌入向量（僅首次需要）……',
  'search.semanticFallback': '語意引擎暫時無法使用（離線或語料已變更）——改用關鍵字比對。',
  'search.strength.strong': '強匹配',
  'search.strength.related': '相關',
  'search.strength.possible': '可能相關',
  'search.shortQueryTip': '簡短查詢僅按用詞匹配。欲得更精準結果，請加入母題詞（洪水、蛇、太陽……）或描述整個故事——也可改用「比較」頁輸入完整描述。',
  'compare.yourMotifs': '從你的描述偵測到的母題',
  'compare.noMotifsDetected': '描述中未偵測到標準母題——下方匹配結果基於用詞與主題的相似度。',
  'compare.why': '故事為何相連、如何相連',
  'compare.carriesSame': '與你的描述共享同一母題。',
  'compare.matchedWording': '相近用語',
  'compare.noSharedMotif': '無共享的標準母題——此匹配來自用詞與主題，而非已標記的母題。',
}

const p = 'src/i18n/zh-TW.js'
const src = readFileSync(p, 'utf8')
const idx = src.lastIndexOf('}')
const lines =
  Object.entries(additions)
    .map(([k, v]) => `  '${k}': '${v.replace(/'/g, "\\'")}',`)
    .join('\n') + '\n'
writeFileSync(p, src.slice(0, idx) + lines + src.slice(idx))
console.log('added', Object.keys(additions).length, 'keys')
