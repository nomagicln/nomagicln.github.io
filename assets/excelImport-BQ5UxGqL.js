import{a as e,f as t,i as n,n as r,u as i}from"./catalog-BxYle-Ki.js";import{t as a}from"./exceljs-Dxd0PerC.js";function o(e){if(e==null)return``;if(typeof e==`string`)return e.trim();if(typeof e==`number`||typeof e==`boolean`)return String(e);if(Array.isArray(e))return e.map(e=>String(e)).join(` `);if(typeof e==`object`){let t=e;if(typeof t.text==`string`)return t.text.trim();if(Array.isArray(t.richText))return t.richText.map(e=>{let t=e;return typeof t.text==`string`?t.text:``}).join(``).trim()}return String(e).trim()}function s(e,t,n){let r=Math.max(n,1);return{name:e,rowCount:t.length,columnCount:r,rows:t.map(t=>({id:`${e}-${t.rowNumber}`,sourceRowNumber:t.rowNumber,cells:Array.from({length:r},(e,n)=>t.cells[n]??``)}))}}async function c(e){return e.name.toLowerCase().endsWith(`.csv`)?d(e):l(e)}async function l(e){let t=new(await(a())).Workbook,n=await e.arrayBuffer();await t.xlsx.load(n);let r=t.worksheets.map(e=>{let t=e.rowCount,n=Math.max(e.columnCount,1),r=[];for(let i=1;i<=t;i+=1){let t=e.getRow(i);n=Math.max(n,t.cellCount);let a=Array.from({length:n},(e,n)=>o(t.getCell(n+1).value));r.push({rowNumber:i,cells:a})}return s(e.name||`Sheet${e.id}`,r,n)});return{sourceType:`xlsx`,sheets:r.length>0?r:[{name:`Sheet1`,rowCount:0,columnCount:1,rows:[]}]}}function u(e){let t=[],n=``,r=!1;for(let i=0;i<e.length;i+=1){let a=e[i];if(a===`"`){r&&e[i+1]===`"`?(n+=`"`,i+=1):r=!r;continue}if(a===`,`&&!r){t.push(n.trim()),n=``;continue}n+=a}return t.push(n.trim()),t}async function d(e){let t=(await e.text()).split(/\r?\n/).map(e=>e.replace(/^\uFEFF/,``)).filter(e=>e.length>0).map(e=>u(e)),n=Math.max(1,...t.map(e=>e.length));return{sourceType:`csv`,sheets:[s(`CSV`,t.map((e,t)=>({rowNumber:t+1,cells:Array.from({length:n},(t,n)=>e[n]??``)})),n)]}}function f(e){return e.replace(/\|/g,`\\|`).replace(/[\r\n]+/g,` `).trim()}function p(e,t){let n=e.map(e=>f(e||`-`));return[`| ${n.join(` | `)} |`,`| ${n.map(()=>`---`).join(` | `)} |`,...t.map(t=>`| ${e.map((e,n)=>f(t[n]??``)).join(` | `)} |`)].join(`
`)}function m(a){let{partType:o}=a,s=n[o],c=r[o],l=e.map(e=>`"${e.value}"`).join(` | `),u=e.map(e=>`  - ${e.value} = ${e.label}`).join(`
`),d=(`tableSections`in a?a.tableSections:[{sheetName:a.sheetName,markdownTable:a.markdownTable}]).map((e,t)=>{let n=e.rangeLabel?`${e.sheetName} ${e.rangeLabel}`:e.sheetName;return[`片段 ${t+1}：${n}`,e.markdownTable].join(`
`)}).join(`

`),f=c.map(e=>{if(e.type===`select`){let t=(e.options??[]).map(e=>`"${e.value}"（${e.label}）`).join(` | `);return`- "${e.key}"（${e.label}）: ${t}`}if(e.type===`boolean`)return`- "${e.key}"（${e.label}）: true | false`;if(e.type===`tags`)return`- "${e.key}"（${e.label}）: string[]  字符串数组`;if(e.type===`number`){let t=e.placeholder?`  示例：${e.placeholder}`:``;return`- "${e.key}"（${e.label}）: number${t}`}let t=e.placeholder?`  示例：${e.placeholder}`:``;return`- "${e.key}"（${e.label}）: string${t}`}).join(`
`),p={};for(let e of c)e.type===`select`?p[e.key]=e.defaultValue??e.options?.[0]?.value??``:e.type===`boolean`?p[e.key]=e.defaultValue??!1:e.type===`tags`?p[e.key]=[]:e.type===`number`?p[e.key]=0:p[e.key]=``;let m=[{id:`550e8400-e29b-41d4-a716-446655440000`,type:o,name:``,vendor:``,model:``,internalCodes:[],supplyStatus:`pending`,notes:``,tags:[],updatedAt:`2026-01-01T00:00:00.000Z`,details:p}];return`你是一位服务器硬件规格专家，请根据我提供的一个或多个表格片段，提取并补全可导入系统的结构化 JSON 数据。

## 部件类型
${s.label}：${s.description}

## 输出字段说明

### 基础字段
- "id"（string）：UUID v4
- "type"（string）：固定为 "${o}"
- "name"（string）：完整产品名称（不为空）
- "vendor"（string）：厂商名，如 Intel / AMD / Samsung / NVIDIA
- "model"（string）：型号编号（不为空）
- "internalCodes"（string[]）：内部编码数组，无可用信息可填 []
- "supplyStatus"（${l}）
${u}
- ${i(o)}
- "tags"（string[]）：品牌、代际、平台等标签
- "updatedAt"（string）：ISO 8601 UTC 时间字符串

### details 专属规格字段（${s.label}）
${f}

## 输出模板（用实际数据填充，勿附带任何额外说明）
\`\`\`json
${JSON.stringify(m,null,2)}
\`\`\`

## 表格片段（Markdown）
${d}

注意：
1. 只返回 JSON 数组，不要附加任何说明。
2. 数组中的每一项必须是 JSON 对象，不能是字符串、数字或其他类型。
3. 严格按 model 去重，不能输出重复型号。
4. 若字段无法确认：number 填 0，string 填 ""，boolean 填 false，string[] 填 []，对象字段不可缺失。
5. 如果多个片段来自不同 Sheet，请综合判断并去重，不要重复输出同一型号。
6. 新查询条目默认使用 supplyStatus="pending"，仅在有明确证据时才改为 available / limited / blocked。
${t(o).map((e,t)=>`${t+7}. ${e}`).join(`
`)}`}export{m as n,c as r,p as t};