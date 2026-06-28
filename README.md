# English Reading Studio

線上閱讀課程網站。三層結構：**首頁（課程列表）→ 課程頁（課文列表）→ 課文頁（學習單）**。
新增課文只要編輯 JSON，不用碰 HTML。

## 檔案結構

```
index.html            首頁（自動列出所有課程）
course.html           課程頁（自動列出該課程的課文）
lesson.html           課文頁（自動渲染學習單）
data/courses.json     ★ 課程與課文索引（最常編輯）
lessons/*.json        每篇課文的內容
assets/style.css      共用樣式
assets/app.js         共用渲染邏輯
```

## 如何新增一篇課文（兩步驟）

**1. 建立課文內容檔** `lessons/你的檔名.json`
   最簡單的方式：複製 `lessons/property-rights.json`，改裡面的內容。
   各欄位：
   - `vocabulary`：每個單字有 `word` / `meaning` / `example`
   - `idioms`：每個慣用語有 `term` / `meaning` / `examples`（陣列）
   - `reading`：原文段落陣列，每段的 `type` 可以是：
       - `"p"` 一般段落
       - `"h3"` 小標題
       - `"callout"` 灰底方框（需 `title` + `text`，段落間用兩個換行分隔）
       - `"quote"` 引言框（需 `text` + `who`）
   - `mcq`：每題有 `stem` / `options`（4個）/ `answer`（0=A,1=B,2=C,3=D）/ `explain`
   - `discussion`：每題有 `stem` / `hint` / `sample`

**2. 在 `data/courses.json` 登記這篇課文**
   找到對應課程的 `lessons` 陣列，加一筆：
   ```json
   {
     "id": "your-lesson-id",
     "title": "課文標題",
     "subtitle": "副標",
     "duration": "25 min",
     "file": "lessons/你的檔名.json"
   }
   ```

存檔、推上 GitHub，網站就會自動長出新課文，選單與列表都會更新。

## 如何新增一門課程

在 `data/courses.json` 的 `courses` 陣列加一筆：
```json
{
  "id": "your-course-id",
  "title": "課程名稱",
  "subtitle": "副標",
  "icon": "📗",
  "color": "#2E75B6",
  "lessons": []
}
```
然後照上面方式往 `lessons` 裡加課文。

## 部署到 GitHub Pages

1. 把整個資料夾的內容放進你的 repo（根目錄）。
2. GitHub repo → Settings → Pages → Source 選 `main` 分支、`/ (root)`。
3. 幾分鐘後網址會是 `https://你的帳號.github.io/repo名稱/`。
4. 把這個網址傳給老師即可。

> 注意：本網站用 `fetch()` 讀 JSON，**必須透過網址開啟**（GitHub Pages 或本機 server），
> 直接用瀏覽器開 `index.html`（file://）會因瀏覽器安全限制讀不到 JSON。

## 老師版 / 學生版

課文頁右上角有「老師版：展開全部答案」按鈕，一鍵展開所有選擇題答案與討論範例；
再按一次收合。預設是學生版（全部收合）。同一個網址兩種用途都能用。
