const $ = (s) => document.querySelector(s);
const readStore = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
let activeReader = readStore("dsbm_reader", null);
let journals = readStore("dsbm_journals", []);

function renderReader(){
  const status = $("#readerStatus");
  if(activeReader){
    status.textContent = `✨ ${activeReader.name} đang tham gia ${activeReader.region === "Chung" ? "Phòng đọc chung ba miền" : "Phòng đọc miền " + activeReader.region}.`;
  } else status.textContent = "Chưa có phiên đọc nào trên thiết bị này.";
  $("#profileText").textContent = activeReader ? `${activeReader.name} · ${activeReader.region === "Chung" ? "Phòng đọc chung ba miền" : "Phòng đọc miền " + activeReader.region}` : "Bạn chưa tham gia phòng đọc trên thiết bị này.";
}
function renderJournals(){
  const list = $("#journalList");
  if(!journals.length){ list.innerHTML = '<div class="empty-state">📚 Nhật ký đầu tiên đang chờ bạn viết.</div>'; return; }
  list.innerHTML = journals.map((j,i)=>`<article class="journal-item"><div><strong>${escapeHtml(j.title)}</strong><small>${escapeHtml(j.author || "Chưa ghi tác giả")} · ${escapeHtml(j.thought || "Một hành trình đọc đang tiếp tục.")}</small></div><div class="journal-minutes">${j.minutes} phút đọc <button data-delete="${i}" aria-label="Xóa nhật ký" style="border:0;background:none;color:#a46b50;cursor:pointer">×</button></div></article>`).join("");
  list.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{journals.splice(Number(btn.dataset.delete),1);saveJournals();}));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function saveJournals(){localStorage.setItem("dsbm_journals",JSON.stringify(journals));renderJournals();}
document.querySelectorAll(".region-card").forEach(card=>card.addEventListener("click",()=>{
  $("#readerRegion").value=card.dataset.region;
  $("#phong-doc").scrollIntoView({behavior:"smooth"});
}));
$("#joinForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("#readerName").value.trim();
  if(!name)return;
  activeReader={name,region:$("#readerRegion").value};
  localStorage.setItem("dsbm_reader",JSON.stringify(activeReader));
  renderReader();
  $("#readerStatus").textContent += " (Đây là phiên trải nghiệm trên thiết bị của bạn.)";
});
$("#journalForm").addEventListener("submit",e=>{
  e.preventDefault();
  const title=$("#bookTitle").value.trim(), minutes=Number($("#bookMinutes").value);
  if(!title || !Number.isFinite(minutes) || minutes<1)return;
  journals.unshift({title,author:$("#bookAuthor").value.trim(),minutes,thought:$("#bookThought").value.trim(),date:new Date().toISOString()});
  saveJournals(); e.target.reset();
});
$("#profileBtn").addEventListener("click",()=>$("#profileDialog").showModal());
renderReader();renderJournals();
