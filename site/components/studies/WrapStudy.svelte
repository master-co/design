<script lang="ts">
 import { onMount, tick } from 'svelte'
 type Language = 'en' | 'zh-Hant'
 let mounted = $state(false), wrap = $state('pretty'), language = $state<Language>('en')
 // While a reply streams, shown holds what has arrived; otherwise the whole reply in the chosen words is shown.
 let shown = $state<string | null>(null), streaming = $state(false), reply = $state<HTMLParagraphElement>()
 // A count belongs to the wrap and the words it was measured with.
 let result = $state<{ count: number, wrap: string, language: Language } | null>(null)
 const moved = $derived(result && result.wrap === wrap && result.language === language ? result.count : null)
 onMount(() => { mounted = true })
 const copy = {
  en: {
   options: [['Hobby', 'One project, previews for every branch.'], ['Pro', 'Unlimited projects, fourteen regions and 400 build minutes a seat.'], ['Enterprise', 'From 5 seats, single sign-on, an audit log and a 99.99% uptime agreement.']],
   title: 'Ship every branch', lead: 'Open a pull request and share the link. What you review is what ships.',
   reply: 'The column is added as nullable first, then every existing row is backfilled in batches of ten thousand so the table stays available, and only after that is the constraint added and checked against what is already there.'
  },
  'zh-Hant': {
   options: [['個人', '一個專案，每個分支都有預覽。'], ['專業', '不限專案數量、十四個區域，每個席位 400 分鐘建置時間。'], ['企業', '5 個席位起，含單一登入、稽核紀錄與 99.99% 可用性承諾。']],
   title: '每個分支都能上線', lead: '開啟合併請求並分享連結，你審查的內容就是上線的內容。',
   reply: '先以可為空值的方式新增欄位，再以每批一萬列的方式回填所有既有資料列，讓資料表持續可用；完成後才加入約束條件，並檢查既有資料是否符合。'
  }
 }
 // English arrives a word at a time; Chinese, which has no spaces, two characters at a time.
 const pieces = (text: string) => language === 'en' ? text.split(/(?<= )/) : text.match(/.{1,2}/gsu) ?? []
 // The offset of the first character of each line.
 function breaks(node: HTMLElement) {
  const text = node.firstChild
  if (!text) return []
  const range = document.createRange(), starts: number[] = []
  let top: number | undefined
  for (let index = 0; index < text.textContent!.length; index++) {
   range.setStart(text, index); range.setEnd(text, index + 1)
   const rect = range.getClientRects()[0]
   if (!rect || /\s/.test(text.textContent![index])) continue
   if (top === undefined || rect.top > top + 1) { starts.push(index); top = rect.top }
  }
  return starts
 }
 async function stream() {
  const all = pieces(copy[language].reply)
  streaming = true; result = null; shown = ''
  let previous: number[] = [], count = 0
  for (const piece of all) {
   shown += piece
   await tick()
   const current = reply ? breaks(reply) : []
   // An earlier line now starts somewhere else: a word already read has moved.
   if (previous.slice(1).some((start, index) => current[index + 1] !== undefined && current[index + 1] !== start)) count++
   previous = current
   await new Promise(resolve => setTimeout(resolve, 70))
  }
  shown = null; result = { count, wrap, language }; streaming = false
 }
 function reset() { wrap = 'pretty'; language = 'en'; result = null; shown = null }
</script>
<section class="task-study" data-study="wrap" aria-label="Text wrap comparison" lang={language}>
 <fieldset disabled={!mounted}><legend class="study-sr">Wrap controls</legend><div class="study-controls">
  <label lang="en">Wrap<select class="select" name="wrap" bind:value={wrap} disabled={streaming}><option value="pretty">Pretty</option><option value="balance">Balance</option><option value="stable">Stable</option></select></label>
  <label lang="en">Words<select class="select" name="language" bind:value={language} disabled={streaming}><option value="en">English</option><option value="zh-Hant">Traditional Chinese</option></select></label>
 </div>
 <div class="wrap-specimens">
  <div class="wrap-options" data-wrap-options>
   {#each copy[language].options as [name, description] (name)}<div class="wrap-option"><strong>{name}</strong><span style:text-wrap={wrap}>{description}</span></div>{/each}
  </div>
  <div class="wrap-lead"><strong>{copy[language].title}</strong><span style:text-wrap={wrap} data-wrap-lead>{copy[language].lead}</span></div>
  <div class="wrap-reply">
   <p bind:this={reply} style:text-wrap={wrap} data-wrap-reply>{shown ?? copy[language].reply}</p>
   <div class="study-actions"><button class="btn" type="button" onclick={stream} disabled={streaming}>Stream the reply</button><button class="btn" type="button" onclick={reset} disabled={streaming}>Reset</button></div>
   <output class="study-output" lang="en" aria-live="polite">{#if moved !== null}An earlier line break moved {moved} {moved === 1 ? 'time' : 'times'} while the reply streamed in.{/if}</output>
  </div>
 </div>
 </fieldset>
 <noscript>The specimens are readable with ordinary wrapping; the wrap and stream controls require JavaScript.</noscript>
</section>
<style>
.wrap-specimens{display:grid;gap:1.5rem}
.wrap-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,11rem),1fr));gap:.75rem}
.wrap-option{display:grid;align-content:start;gap:.25rem;padding:.875rem;border:1px solid var(--color-line-divider);border-radius:.75rem;min-width:0;overflow-wrap:break-word}
.wrap-option span{color:var(--color-text-muted);font-size:.875rem;line-height:1.5}
.wrap-lead{display:grid;gap:.5rem;justify-items:center;max-width:24rem;margin-inline:auto;text-align:center;overflow-wrap:break-word}
.wrap-lead strong{font-size:1.25rem;line-height:1.3}
.wrap-lead span{line-height:1.6}
.wrap-reply p{max-width:30rem;margin:0;min-height:calc(1.6em * 5);line-height:1.6;overflow-wrap:break-word}
</style>
