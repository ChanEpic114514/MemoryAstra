(function(root){
 'use strict';
 const OFFSETS=[0,1,2,4,7,15,30];
 function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
 function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s&&s>='1900-01-01'&&s<='2101-12-31';}
 function addDays(s,n){const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
 function tasks(entry){return OFFSETS.map((offset,i)=>({entry,index:i,date:i===0?entry.firstDate:addDays(entry.learned,offset),done:entry.completed[String(i)]||null}));}
 function due(t,now=new Date()){return t.date<dateKey(now)||(t.date===dateKey(now)&&(t.index!==0||+now>=t.entry.firstAt));}
 function validate(data){
  if(!data||data.version!==1||!Array.isArray(data.entries)||data.entries.length>10000)throw Error('备份格式或版本不受支持。');
  const ids=new Set();const entries=data.entries.map(e=>{
   if(!e||typeof e.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(e.id)||ids.has(e.id))throw Error('条目编号无效或重复。');ids.add(e.id);
   for(const [key,max] of [['title',120],['subject',40],['body',100000]])if(typeof e[key]!=='string'||e[key].length>max||(key!=='subject'&&!e[key].trim()))throw Error('文本字段无效。');
   if(!validDate(e.learned)||!validDate(e.firstDate)||!Number.isFinite(e.firstAt)||!Number.isFinite(+new Date(e.firstAt))||e.firstDate<e.learned||e.firstDate>addDays(e.learned,1))throw Error('背诵日期无效。');
   if(!e.completed||typeof e.completed!=='object'||Array.isArray(e.completed))throw Error('完成记录无效。');
   const completed={};for(const [k,v] of Object.entries(e.completed)){if(!/^[0-6]$/.test(k)||typeof v!=='string'||!Number.isFinite(Date.parse(v)))throw Error('完成记录无效。');completed[k]=new Date(v).toISOString();}
   return {id:e.id,title:e.title,subject:e.subject,body:e.body,learned:e.learned,firstDate:e.firstDate,firstAt:e.firstAt,completed};
  });return {version:1,entries};
 }
 const api={OFFSETS,dateKey,validDate,addDays,tasks,due,validate};if(typeof module!=='undefined')module.exports=api;else root.MemoryCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
