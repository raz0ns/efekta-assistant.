const $ = id => document.getElementById(id);
const KEY = "efekta-assistant-vocab-v1";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const save = data => localStorage.setItem(KEY, JSON.stringify(data));
const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function analyze(text) {
  const s = text.trim();
  if (!s) return "Digite ou cole um texto para receber orientações.";
  const words = s.match(/[A-Za-z']+/g) || [];
  const lower = s.toLowerCase();
  const hints = [];
  if (/\b(am|is|are)\s+\w+ing\b/i.test(s)) hints.push("Parece haver uma estrutura de Present Continuous: sujeito + am/is/are + verbo terminado em -ing.");
  if (/\b(did|was|were|yesterday|last\s+\w+|ago)\b/i.test(s)) hints.push("Há um possível marcador de passado. Verifique se o verbo está no Past Simple e lembre-se de que, após did, use a forma base do verbo.");
  if (/\b(always|usually|often|sometimes|never|every day|every week)\b/i.test(s)) hints.push("Há um marcador de frequência. Considere o Present Simple para hábitos e rotinas.");
  if (/\b(will|going to|tomorrow|next\s+\w+)\b/i.test(s)) hints.push("Há um possível marcador de futuro. Confira se a frase pede will ou be going to.");
  if (/\b(more|most|-?er|than)\b/i.test(s)) hints.push("Pode ser uma comparação. Confira o uso de -er / more e a palavra than.");
  const isQuestion = /^(what|where|when|who|why|how|which|do|does|did|is|are|can|could|would)\b/i.test(s);
  if (isQuestion) hints.push("É uma pergunta. Identifique primeiro a palavra interrogativa, o sujeito e o verbo auxiliar; depois procure exatamente a informação solicitada.");
  if (!hints.length) hints.push("Leia a frase procurando sujeito, verbo principal, marcadores de tempo e palavras desconhecidas. Tente identificar o contexto antes de traduzir palavra por palavra.");
  return `Texto recebido (${words.length} palavras).\\n\\nOrientações:\\n• ${hints.join("\\n• ")}\\n\\nDica: tente formular sua própria resposta e confira se ela responde exatamente ao enunciado. Esta análise é heurística e pode não identificar corretamente todos os casos.`;
}
$("analyze").addEventListener("click", () => $("analysis").textContent = analyze($("question").value));
function render() {
  const q = $("search").value.toLowerCase();
  const data = load().filter(x => (x.word + " " + x.meaning).toLowerCase().includes(q));
  $("list").innerHTML = data.length ? data.map(x=>`<div class="entry"><b>${escapeHtml(x.word)}</b><small>${escapeHtml(x.meaning)}${x.example ? " · " + escapeHtml(x.example) : ""}</small></div>`).join("") : '<p class="muted">Nenhuma palavra salva ainda.</p>';
}
$("save").addEventListener("click", () => {
  const word = $("word").value.trim(), meaning = $("meaning").value.trim(), example = $("example").value.trim();
  if (!word) { $("status").textContent = "Digite uma palavra ou expressão."; return; }
  const data = load();
  if (data.some(x => x.word.toLowerCase() === word.toLowerCase())) { $("status").textContent = "Essa palavra já está salva."; return; }
  data.unshift({word,meaning,example}); save(data);
  $("word").value = $("meaning").value = $("example").value = "";
  $("status").textContent = "Palavra salva neste dispositivo."; render();
});
$("search").addEventListener("input", render);
$("export").addEventListener("click", () => {
  const rows = [["Palavra","Significado","Exemplo"], ...load().map(x=>[x.word,x.meaning,x.example])];
  const csv = rows.map(r=>r.map(v=>'"'+String(v||"").replace(/"/g,'""')+'"').join(";")).join("\\r\\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\\ufeff"+csv],{type:"text/csv;charset=utf-8"})); a.download = "vocabulario-efekta.csv"; a.click(); URL.revokeObjectURL(a.href);
});
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();