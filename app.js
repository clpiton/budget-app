const today=new Date().toISOString().slice(0,10);
document.getElementById('date').value=today;

function weekKey(d=new Date()){
 const date=new Date(d);
 const onejan=new Date(date.getFullYear(),0,1);
 const week=Math.ceil((((date-onejan)/86400000)+onejan.getDay()+1)/7);
 return `${date.getFullYear()}-W${week}`;
}

let data=JSON.parse(localStorage.getItem('budgetData')||'{"weeks":{}}');
function getCurrentWeek() {
    return weekKey();
}

if(!data.weeks[getCurrentWeek()]) {
    data.weeks[getCurrentWeek()] = [];
}

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
const currentWeek = getCurrentWeek();

if(data.weeks[currentWeek]) {
    s.value = currentWeek;
}
}

function addExpense(){
 const week=getCurrentWeek();

if(!data.weeks[week]) {
    data.weeks[week] = [];
}
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
const currentWeek = getCurrentWeek();

if(!data.weeks[currentWeek]) {
    data.weeks[currentWeek] = [];
    save();
}

const week = weekSelect.value || currentWeek;
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
function exportJSON() {

    const dataStr = JSON.stringify(data, null, 2);

    const blob = new Blob(
        [dataStr],
        { type: "application/json" }
    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = "budget-backup.json";

    a.click();
}

function importJSON(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const importedData =
                JSON.parse(e.target.result);

            if (!importedData.weeks) {
                throw new Error(
                    "Format invalide"
                );
            }

            data = importedData;

            save();

            render();

            alert(
                "Données importées avec succès !"
            );

        } catch(err) {

            alert(
                "Fichier JSON invalide."
            );
        }
    };

    reader.readAsText(file);
}
render();
