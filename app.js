const $=id=>document.getElementById(id);
const CFG=window.QUIZ||{id:"quiz",pass:0,total:(typeof Q!=="undefined"?Q.length:0)};
const KEY="rev.stats."+CFG.id;
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}S=S||{q:{},runs:0,best:0,passed:false};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const st=i=>S.q[i]||(S.q[i]={a:0,c:0,m:0,h:0,s:0,l:0,idk:0});
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const TOPICS=[[/motorcycle|helmet|saddle|rider|R\.A\.\s*10666/i,"Motorcycles & gear"],[/\bsigns?\b|marking|rumble|pavement/i,"Signs & markings"],[/light|signal|arrow|flashing/i,"Lights & signals"],[/alcohol|drink|drug|illness|fatigue|sleepy|rest stop|tired/i,"Fitness to drive"],[/fuel|oil|engine|pollution|tire|tyre|brake fluid|maintenance/i,"Vehicle care"],[/licen|permit|LTO|registration|OR\/CR|plate/i,"Licensing & documents"],[/overtak|speed|lane|shoulder/i,"Speed & overtaking"],[/intersection|right-of-way|yield|pedestrian|crosswalk/i,"Right of way"],[/park|stop(?!ping distance)|loading|towing/i,"Parking & stopping"],[/violat|fine|penalt|apprehen|enforcer|confiscat/i,"Violations & penalties"]];
const topic=i=>(TOPICS.find(t=>t[0].test(Q[i][0]))||[0,"General rules"])[1];
let order,pos,rec,score,missed,view="quiz",prevView="quiz";
const open=r=>["open","skipped","deferred"].includes(r.status);
const right=r=>r.o.find(o=>o.c).t;
const say=(t,k)=>{const f=$("fb");f.className=k||"";f.textContent=t};
const tagEl=(l,cls,t)=>{l.classList.add(cls);l.insertAdjacentHTML("beforeend",'<b class="tag">'+t+"</b>")};
const show=v=>{view=v;["quiz","done","stats"].forEach(x=>{if($(x))$(x).hidden=x!==v})};

function begin(list){order=list;pos=0;score=0;missed=new Set();rec=[];S.runs++;save();show("quiz");go(0)}
function go(p){pos=p;rec[p]=rec[p]||{qi:order[p],o:shuffle(Q[order[p]].slice(1).map((t,i)=>({t,c:!i}))),tries:0,hints:0,wrong:[],elim:-1,pick:-1,status:"open"};render()}

function render(){
  const r=rec[pos],qi=r.qi,n=qi+1,o=open(r);
  $("q").textContent=Q[qi][0];
  $("pic").innerHTML=(typeof IMG!=="undefined"&&IMG[n])?'<div class="question-image"><img src="'+IMG[n]+'" alt="'+(ALT[n]||"")+'"></div>':"";
  $("topic").textContent=topic(qi);
  $("prog").textContent="Question "+(pos+1)+" of "+order.length;
  $("score").textContent="Correct: "+score;
  $("bar").setAttribute("aria-valuemax",order.length);$("bar").setAttribute("aria-valuenow",pos);
  $("fill").style.width=(pos/order.length*100)+"%";
  const gone=i=>o&&(r.wrong.includes(i)||r.elim===i);
  $("opts").innerHTML=r.o.map((x,i)=>'<label class="opt'+(gone(i)?" gone":"")+'"><input type="radio" name="a" value="'+i+'"'+(!o||gone(i)?" disabled":"")+'><b class="k">'+(i+1)+"</b><span>"+x.t+"</span></label>").join("");
  const L=[...document.querySelectorAll(".opt")];
  r.wrong.forEach(i=>tagEl(L[i],"bad","✗ Your pick"));
  if(o&&r.elim>=0&&!r.wrong.includes(r.elim))L[r.elim].insertAdjacentHTML("beforeend",'<b class="tag mute">Ruled out</b>');
  if(r.status==="right")tagEl(L[r.pick],"ok","✓ Correct");
  if(r.status==="idk")tagEl(L[r.pick],"idk","🤷 IDK (clue used)");
  if(r.status==="revealed")tagEl(L[r.o.findIndex(x=>x.c)],"ok","✓ Answer");
  const exp=(typeof EXP!=="undefined"&&EXP[qi])?" "+EXP[qi]:"";
  const msg={
    right:["ok","Correct on your own!"+exp],
    idk:["idk","That's the right answer — but you used a clue, so this counts as an honest IDK, not a score. 🤷"+exp],
    wrong:["bad","Not quite. Try again, or show the answer."],
    revealed:["ok","The correct answer is: "+right(r)+"."+exp],
    skipped:["","You skipped this earlier. Answer it now, or keep going."],
    deferred:["","You skipped this earlier. Answer it now, or keep going."],
    open:["",""]
  }[r.status];
  say(msg[1],msg[0]);
  const hs=["Topic: "+topic(qi)+((typeof IMG!=="undefined"&&IMG[n])?". Study the picture: its shape and colour hint at the sign's family.":"."),r.elim<0?"Every wrong answer here has already been tried.":"One wrong answer has been ruled out for you.","The answer starts with \u201c"+right(r).split(" ").slice(0,2).join(" ")+"\u2026\u201d"];
  $("hint").innerHTML=hs.slice(0,r.hints).map((h,i)=>"<p><b>Clue "+(i+1)+"</b>"+h+"</p>").join("");$("hint").hidden=!r.hints;
  const live=o||r.status==="wrong";
  $("back").hidden=pos===0;$("skip").hidden=!live;
  $("clue").hidden=!live||r.hints>=3;$("clue").innerHTML="\ud83d\udca1 Clue <small>"+(3-r.hints)+" left</small>";
  $("check").hidden=!o;$("retry").hidden=$("show").hidden=r.status!=="wrong";
  $("next").hidden=!["right","idk","revealed"].includes(r.status);
  $("next").textContent=pos===order.length-1?"See results":"Next question";
  $("dots").innerHTML=order.map((_,p)=>{const x=rec[p];let c="";if(x){if(x.status==="right")c="ok";else if(x.status==="idk")c="idk";else if(["wrong","revealed"].includes(x.status))c="bad";else if(["skipped","deferred"].includes(x.status))c="skip"}return'<button type="button" class="dot '+c+(p===pos?" cur":"")+'" data-p="'+p+'" aria-label="Question '+(p+1)+'"'+(x?"":" disabled")+"></button>"}).join("");
}
function advance(){
  if(pos<order.length-1)return go(pos+1);
  const p=rec.map((r,i)=>r.status==="skipped"?i:-1).filter(i=>i>=0);
  if(p.length){p.forEach(i=>{rec[i].status="deferred";order.push(order[i])});return go(pos+1)}
  finish();
}
function finish(){
  const u=new Set(order).size,m=missed.size,pct=Math.round(score/u*100);
  const hints=rec.reduce((a,r)=>a+r.hints,0),skips=rec.filter(r=>r.status==="deferred").length,tries=rec.reduce((a,r)=>a+r.tries,0),idks=rec.filter(r=>r.status==="idk").length;
  $("fill").style.width="100%";
  $("ring").style.setProperty("--p",pct);$("pct").textContent=pct+"%";
  const full=u>=CFG.total&&CFG.pass>0;
  let passLine="";
  if(full){
    const passed=score>=CFG.pass;
    if(score>S.best)S.best=score;
    if(passed)S.passed=true;
    save();
    passLine='<p class="passline '+(passed?"pass":"fail")+'">'+(passed?"\u2705 Passing score reached":"\u2b55 Not yet passing")+" \u2014 you need "+CFG.pass+" of "+CFG.total+" correct ("+Math.round(CFG.pass/CFG.total*100)+"%) to pass. Best so far: "+S.best+"/"+CFG.total+".</p>";
  }
  $("passline").innerHTML=passLine;
  $("sum").textContent="You got "+score+" of "+u+" right without help."+(m?" Review the "+m+" you missed or guessed:":" Perfect run.");
  $("rkp").innerHTML=[["Attempts",tries],["Clues used",hints],["Marked IDK",idks],["Skipped",skips]].map(x=>'<div class="kpi"><span>'+x[0]+"</span><b>"+x[1]+"</b></div>").join("");
  $("res").innerHTML=[...missed].map(i=>"<li><b>"+Q[i][0]+"</b><p>Answer: "+Q[i][1]+"</p></li>").join("");
  $("again").hidden=!m;show("done");$("rh").focus();
}
function stats(){
  const ks=Object.keys(S.q).filter(k=>S.q[k].a>0),sum=f=>ks.reduce((a,k)=>a+S.q[k][f],0),A=sum("a"),C=sum("c");
  $("kpis").innerHTML=[["Practiced",ks.length+" / "+CFG.total],["Accuracy",A?Math.round(C/A*100)+"%":"\u2013"],["Mastered",ks.filter(k=>S.q[k].l).length],["Clues used",sum("h")],["Marked IDK",sum("idk")],["Sessions",S.runs]].map(x=>'<div class="kpi"><span>'+x[0]+"</span><b>"+x[1]+"</b></div>").join("");
  const tp={};ks.forEach(k=>{const t=topic(k),o=tp[t]||(tp[t]={a:0,c:0});o.a+=S.q[k].a;o.c+=S.q[k].c});
  $("topics").innerHTML=Object.entries(tp).filter(([,o])=>o.a>0).sort((x,y)=>x[1].c/x[1].a-y[1].c/y[1].a).map(([t,o])=>{const p=Math.round(o.c/o.a*100);return'<div class="row"><span>'+t+'</span><i><u style="width:'+p+'%"></u></i><b>'+p+"%</b></div>"}).join("")||'<p class="muted">Answer a few questions to see your topic strength.</p>';
  $("hard").innerHTML=ks.filter(k=>S.q[k].m>0).sort((a,b)=>S.q[b].m-S.q[a].m).slice(0,5).map(k=>"<li><span>"+Q[k][0]+"</span><b>"+S.q[k].m+"\u00d7</b></li>").join("")||'<li class="muted">No misses yet. Nice.</li>';
  $("bestline").textContent=S.best?("Best full run: "+S.best+" / "+CFG.total+(S.passed?" \u2014 you've passed this set before.":"")):"No full run completed yet.";
  show("stats");$("sh").focus();
}
$("check").onclick=()=>{
  const r=rec[pos],x=document.querySelector("input[name=a]:checked");
  if(!x){say("Choose an answer first.","bad");return}
  const i=+x.value,s=st(r.qi);r.tries++;r.pick=i;s.a++;
  if(r.o[i].c){
    if(r.hints>0){r.status="idk";s.idk++;s.l=0;missed.add(r.qi)}
    else{r.status="right";s.c++;if(r.tries===1&&!missed.has(r.qi))score++;s.l=r.tries===1?1:0}
  }else{r.status="wrong";r.wrong.push(i);s.m++;s.l=0;missed.add(r.qi)}
  save();render();$("fb").focus();
};
$("retry").onclick=()=>{rec[pos].status="open";render();const x=document.querySelector("input[name=a]:not(:disabled)");x&&x.focus()};
$("show").onclick=()=>{const r=rec[pos];r.status="revealed";missed.add(r.qi);st(r.qi).l=0;save();render();$("fb").focus()};
$("skip").onclick=()=>{const r=rec[pos];r.status="skipped";st(r.qi).s++;save();advance()};
$("clue").onclick=()=>{const r=rec[pos];r.hints++;st(r.qi).h++;if(r.hints===2){const cand=r.o.map((_,i)=>i).filter(i=>!r.o[i].c&&!r.wrong.includes(i));if(cand.length)r.elim=cand[0]}save();render()};
$("back").onclick=()=>go(pos-1);
$("next").onclick=()=>{advance();const x=document.querySelector("input[name=a]:not(:disabled)");x&&x.focus()};
$("dots").onclick=e=>{const b=e.target.closest(".dot");if(b&&!b.disabled)go(+b.dataset.p)};
$("again").onclick=()=>begin(shuffle([...missed]));
$("all").onclick=()=>begin(shuffle(Q.map((_,i)=>i)));
$("statsBtn").onclick=$("toStats").onclick=()=>{if(view!=="stats"){prevView=view;stats()}};
$("closeStats").onclick=()=>show(prevView);
$("resetStats").onclick=()=>{if(confirm("Erase all saved analytics for this reviewer on this device?")){S={q:{},runs:0,best:0,passed:false};save();stats()}};
document.addEventListener("keydown",e=>{
  if(e.metaKey||e.ctrlKey||e.altKey||view!=="quiz")return;
  const k=e.key,t=e.target.tagName;
  if(/^[1-9]$/.test(k)){const x=document.querySelectorAll("input[name=a]")[k-1];if(x&&!x.disabled){x.checked=true;x.focus()}}
  else if(k==="Enter"&&t!=="BUTTON"){const b=["check","next","retry"].map($).find(b=>!b.hidden);b&&b.click()}
  else if(/^h$/i.test(k)){!$("clue").hidden&&$("clue").click()}
  else if(/^s$/i.test(k)){!$("skip").hidden&&$("skip").click()}
  else if(k==="ArrowLeft"&&t!=="INPUT"&&!$("back").hidden)$("back").click();
  else if(k==="ArrowRight"&&t!=="INPUT"&&!$("next").hidden)$("next").click();
});
begin(Q.map((_,i)=>i));
