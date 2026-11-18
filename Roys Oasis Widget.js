// Variables used by Scriptable.
// icon-color: teal; icon-glyph: home;
// ROYS OASIS - widget, iCloud Scriptable/roys-oasis-widget.json
const PRICE=257000, TARGET=77100, QUARTER=11565;
const fm=FileManager.iCloud();
const path=fm.joinPath(fm.documentsDirectory(),"roys-oasis-widget.json");
let info=null, error=null;
try {
  if(fm.fileExists(path)){
    await fm.downloadFileFromiCloud(path);
    const data=JSON.parse(fm.readString(path));
    if(data.property!=="A7+A8"||!Array.isArray(data.records))throw Error("Неверный файл данных");
    if(data.records.some(r=>!Number.isFinite(Number(r.amount))||Number(r.amount)<0))throw Error("Неверные суммы");
    info=data;
  }else error="Нет файла данных — выгрузи его из трекера";
}catch(e){error=String(e.message||e)}
if(!info){info={property:"A7+A8",records:[{date:"2026-11-17",amount:2300}],generatedAt:null}}
const paid=info.records.reduce((a,b)=>a+Number(b.amount),0);
const milestones=[{date:"26.11.2026",sum:25700,label:"Первый взнос"}];
for(let i=0;i<20;i++){
  const m=["02","05","08","11"][i%4],year=2027+Math.floor(i/4);
  milestones.push({date:"26."+m+"."+year,sum:25700+(i+1)*QUARTER,label:"Квартал "+(i+1)});
}
const upcoming=milestones.find(d=>paid+0.005<d.sum);
const due=upcoming?Math.max(0,upcoming.sum-paid):0;
const percent=(paid/PRICE*100).toFixed(2).replace(".",",");
const fmt=n=>Math.round(n).toLocaleString("ru-RU")+" €";
const w=new ListWidget();
w.backgroundColor=new Color("#123a41");
w.setPadding(15,15,13,15);
w.url="https://marieslip.github.io/Roys-Oasis/";
function line(t,size,col,bold){
  const x=w.addText(String(t));x.textColor=new Color(col||"#ffffff");x.font=bold?Font.boldSystemFont(size):Font.systemFont(size);x.lineLimit=1;return x;
}
line("ROYS OASIS · A7+A8",11,"#bad5d0",true);w.addSpacer(6);
line(percent+"%",32,"#ffffff",true);
line("Оплачено "+fmt(paid),11,"#a5ded3",false);
w.addSpacer(10);
const bar=w.addStack();const barWidth=config.widgetFamily==="medium"?260:118;bar.size=new Size(barWidth,8);bar.backgroundColor=new Color("#385e61");bar.cornerRadius=4;
const fill=bar.addStack();fill.size=new Size(Math.max(3,Math.min(barWidth,barWidth*paid/TARGET)),8);fill.backgroundColor=new Color("#64dcc1");fill.cornerRadius=4;
w.addSpacer(8);
line(paid>=TARGET?"30% ДЛЯ TAPU ДОСТИГНУТО":"До TAPU: "+fmt(TARGET-paid),12,"#ffffff",true);
w.addSpacer(5);
if(upcoming){
  line(upcoming.date+"  ·  "+fmt(due),11,"#bed4d2",false);
}else line("Все платежи по договору закрыты",11,"#bed4d2",false);
if(error){w.addSpacer(6);line("ДАННЫЕ НЕ ОБНОВЛЕНЫ",9,"#ffc9a7",true)}
else if(info.generatedAt){
  let d=new Date(info.generatedAt);line("Обновлено "+d.toLocaleDateString("ru-RU"),9,"#86b7b5",false);
}
if(config.runsInWidget){Script.setWidget(w)}else{await w.presentSmall()}
Script.complete();