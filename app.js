const today=new Date().toISOString().slice(0,10);
document.getElementById('date').value=today;

function weekKey(d=new Date()){
 const date=new Date(d);
 const onejan=new Date(date.getFullYear(),0,1);
 const week=Math.ceil((((date-onejan)/86400000)+onejan.getDay()+1)/7);
 return `${date.getFullYear()}-W${week}`;
}

let data=JSON.parse(localStorage.getItem('budgetData')||'{"weeks":{}}');
const current=weekKey();
if(!data.weeks[current]) data.weeks[current]=[];

function save(){
 localStorage.setItem('budgetData',JSON.stringify(data));
}

function refreshWeeks(){
 const s=document.getElementById('weekSelect');
 s.innerHTML='';
 Object.keys(data.weeks).sort().reverse().forEach(w=>{
  const o=document.createElement('option');
  o.value=w;o.textContent=w;s.appendChild(o);
 });
 s.value=current;
}

function addExpense(){
 const week=current;
 data.weeks[week].push({
  date:date.value,
  cat:cat.value,
  label:document.getElementById('label').value,
  amount:+amount.value
 });
 save(); render();
}

function delExpense(i){
 const week=weekSelect.value;
 data.weeks[week].splice(i,1);
 save(); render();
}

let chart;
function render(){
 refreshWeeks();
 const week=weekSelect.value||current;
 const arr=data.weeks[week]||[];
 rows.innerHTML='';
 let spent=0;
 arr.forEach((e,i)=>{
  spent+=e.amount;
  rows.innerHTML+=`<tr><td>${e.date}</td><td>${e.cat}</td><td>${e.label}</td><td>${e.amount.toFixed(2)}€</td><td><button class="delete-btn" onclick="delExpense(${i})">X</button></td></tr>`;
 });

 const budget=+document.getElementById('budget').value;
 const remain=budget-spent;

 const day=new Date().getDay();
 const left=Math.max(1,7-(day||7)+1);

 budgetVal.textContent=budget.toFixed(2)+'€';
 spentVal.textContent=spent.toFixed(2)+'€';
 remainVal.textContent=remain.toFixed(2)+'€';
 dayVal.textContent=(remain/left).toFixed(2)+'€';

 const days=["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
 const totals=[0,0,0,0,0,0,0];

 arr.forEach(e=>{
   let d=new Date(e.date).getDay();
   d=(d===0?6:d-1);
   totals[d]+=e.amount;
 });

 if(chart) chart.destroy();
 chart=new Chart(document.getElementById('chart'),{
   type:'bar',
   data:{labels:days,datasets:[{label:'Dépenses',data:totals}]}
 });
}

function exportCSV(){
 const week=weekSelect.value||current;
 const arr=data.weeks[week]||[];
 let csv="Date;Categorie;Libelle;Montant\n";
 arr.forEach(e=>csv+=`${e.date};${e.cat};${e.label};${e.amount}\n`);
 const blob=new Blob([csv],{type:'text/csv'});
 const a=document.createElement('a');
 a.href=URL.createObjectURL(blob);
 a.download=`${week}.csv`;
 a.click();
}

render();
