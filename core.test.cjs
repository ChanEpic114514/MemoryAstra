const assert=require('node:assert/strict');
const {test}=require('node:test');
const C=require('./core.js');
function entry(learned='2026-11-09'){return {id:'test-1',title:'词汇',subject:'English',body:'placid\n<script>literal</script>',learned,firstDate:learned,firstAt:+new Date(learned+'T12:25:00'),completed:{}};}
test('七次复习以首次背诵日为基准，跨月正确',()=>{assert.deepEqual(C.tasks(entry()).map(t=>t.date),['2026-11-09','2026-11-10','2026-11-11','2026-11-13','2026-11-16','2026-11-24','2026-12-09']);});
test('跨年与闰年',()=>{assert.equal(C.addDays('2026-12-31',1),'2027-01-01');assert.equal(C.addDays('2028-02-28',1),'2028-02-29');assert.equal(C.addDays('2027-02-28',1),'2027-03-01');assert.equal(C.validDate('2026-02-29'),false);});
test('首次复习在25分钟后到期',()=>{const t=C.tasks(entry())[0];assert.equal(C.due(t,new Date('2026-11-09T12:24:59')),false);assert.equal(C.due(t,new Date('2026-11-09T12:25:00')),true);});
test('午夜之后的首次复习按实际日期呈现',()=>{const e=entry();e.firstAt=+new Date('2026-11-10T00:15:00');e.firstDate='2026-11-10';assert.equal(C.tasks(e)[0].date,'2026-11-10');assert.equal(C.due(C.tasks(e)[0],new Date('2026-11-09T23:59:59')),false);});
test('漏复习仍到期，未来任务未到期',()=>{const ts=C.tasks(entry());assert.equal(C.due(ts[0],new Date('2026-11-11T12:00:00')),true);assert.equal(C.due(ts[6],new Date('2026-11-11T12:00:00')),false);});
test('完成记录与备份往返保持一致，正文是纯文本',()=>{const e=entry();e.completed[1]='2026-11-10T12:00:00.000Z';const db={version:1,entries:[e]};assert.deepEqual(C.validate(JSON.parse(JSON.stringify(db))),db);assert.equal(C.tasks(e)[1].done,e.completed[1]);assert.equal(C.tasks(e)[0].done,null);});
test('拒绝损坏、重复编号及非法完成记录',()=>{assert.throws(()=>C.validate({version:2,entries:[]}));const e=entry();assert.throws(()=>C.validate({version:1,entries:[e,e]}));e.completed[9]='bad';assert.throws(()=>C.validate({version:1,entries:[e]}));});
test('夏令时附近按日历日递增',()=>{assert.equal(C.addDays('2026-03-08',1),'2026-03-09');assert.equal(C.addDays('2026-11-01',1),'2026-11-02');});
