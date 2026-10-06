
const today=new Date().toISOString().slice(0,10);
document.getElementById('date').value=today;

function weekKey(d = new Date()) {

    const date = new Date(d);

    date.setHours(0, 0, 0, 0);

    // jeudi de la semaine courante
    date.setDate(
        date.getDate() + 3 - ((date.getDay() + 6) % 7)
    );

    const week1 = new Date(date.getFullYear(), 0, 4);

    const weekNumber =
        1 +
        Math.round(
            (
                (
                    date -
                    week1
                ) / 86400000 -
                3 +
                ((week1.getDay() + 6) % 7)
            ) / 7
        );

    return `${date.getFullYear()}-W${weekNumber}`;
}

let data=JSON.parse(localStorage.getItem('budgetData')||'{"weeks":{}}');
const current=weekKey();
if(!data.weeks[current]) data.weeks[current]=[];

function save(){
 localStorage.setItem('budgetData',JSON.stringify(data));
}

function refreshWeeks(){

 const s = document.getElementById('weekSelect');

 const selected = s.value;

 s.innerHTML = '';

 Object.keys(data.weeks)
   .sort()
   .reverse()
   .forEach(w => {

     const o = document.createElement('option');

     o.value = w;
     o.textContent = w;

     s.appendChild(o);
 });

 if(selected && data.weeks[selected]){
    s.value = selected;
 } else {
    s.value = weekKey();
 }
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
let categoryChart;
let dailyChart;
function refreshLabels(){

    const list = document.getElementById("labelsList");

    list.innerHTML = "";

    let labels = [];

    Object.values(data.weeks).forEach(week => {
        week.forEach(expense => {

            if(expense.label &&
               !labels.includes(expense.label)){

                labels.push(expense.label);
            }

        });
    });

    labels.sort();

    labels.forEach(label => {

        const option = document.createElement("option");

        option.value = label;

        list.appendChild(option);

    });

}
function renderDashboard(){

    const now = new Date();

    const month =
        `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

    const expenses =
        Object.values(data.weeks)
        .flat()
        .filter(e => e.date && e.date.slice(0,7) === month);

    const total =
        expenses.reduce((sum,e) => sum + Number(e.amount || 0), 0);

    const count = expenses.length;

    const average =
        count > 0 ? total / count : 0;

    document.getElementById("monthSpent").textContent =
        total.toFixed(2) + " €";

    document.getElementById("monthCount").textContent =
        count;

    document.getElementById("monthAverage").textContent =
        average.toFixed(2) + " €";
		
	const byCategory = {};

expenses.forEach(e => {

    const category = e.cat || "Autres";
    const amount = Number(e.amount || 0);

    byCategory[category] =
        (byCategory[category] || 0) + amount;
});

const categoryStats =
    document.getElementById("categoryStats");

categoryStats.innerHTML = "";

const categories =
    Object.entries(byCategory)
    .sort((a,b) => b[1] - a[1]);

categories.forEach(([category, total]) => {

    const row = document.createElement("div");

    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.padding = "8px 0";

    const name = document.createElement("span");
    name.textContent = category;

    const value = document.createElement("strong");
    value.textContent = total.toFixed(2) + " €";

    row.appendChild(name);
    row.appendChild(value);

    categoryStats.appendChild(row);
});	

const categoryLabels = categories.map(item => item[0]);
const categoryValues = categories.map(item => item[1]);

if(categoryChart) {
    categoryChart.destroy();
}

categoryChart = new Chart(
    document.getElementById("categoryChart"),
    {
        type: "doughnut",

        data: {
            labels: categoryLabels,

            datasets: [{
                data: categoryValues
            }]
        },

        options: {
            responsive: true
        }
    }
);

const byLabel = {};

expenses.forEach(e => {

    const label = e.label || "Sans libellé";
    const amount = Number(e.amount || 0);

    byLabel[label] =
        (byLabel[label] || 0) + amount;
});

const labelStats =
    document.getElementById("labelStats");

labelStats.innerHTML = "";

const labels = Object.entries(byLabel)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5);

labels.forEach(([label, total]) => {

    const row = document.createElement("div");

    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.padding = "8px 0";

    const name = document.createElement("span");
    name.textContent = label;

    const value = document.createElement("strong");
    value.textContent = total.toFixed(2) + " €";

    row.appendChild(name);
    row.appendChild(value);

    labelStats.appendChild(row);
});
const byDay = {};

expenses.forEach(e => {

    const day = e.date;

    byDay[day] =
        (byDay[day] || 0) + Number(e.amount || 0);
});

const dailyLabels = Object.keys(byDay).sort();

const dailyValues =
    dailyLabels.map(day => byDay[day]);

if(dailyChart) {
    dailyChart.destroy();
}

dailyChart = new Chart(
    document.getElementById("dailyChart"),
    {
        type: "line",

        data: {
            labels: dailyLabels.map(day => {
                const parts = day.split("-");
                return parts[2] + "/" + parts[1];
            }),

            datasets: [{
                label: "Dépenses",
                data: dailyValues,
                tension: 0.3
            }]
        },

        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }
);

}

function render(){
	
	renderDashboard();
 refreshWeeks();
 refreshLabels();
 const week=weekSelect.value||current;
 const arr=data.weeks[week]||[];
 rows.innerHTML='';
 let spent=0;
 arr.forEach((e,i)=>{
  spent+=e.amount;
  rows.innerHTML+=`<tr><td>${e.date}</td><td>${e.cat}</td><td>${e.label}</td><td>${e.amount.toFixed(2)}€</td><td><button class="delete-btn" onclick="delExpense(${i})">X</button></td></tr>`;
 });

 const budget =
    getBudgetForWeek(week);
	
	
	
 const remain=budget-spent;

 const day=new Date().getDay();
 const left=Math.max(1,7-(day||7)+1);

 budgetVal.textContent=budget.toFixed(2)+'€';
 spentVal.textContent=spent.toFixed(2)+'€';
 remainVal.textContent=remain.toFixed(2)+'€';
 dayVal.textContent=(remain/left).toFixed(2)+'€';
 const baseBudget = 160;
 
 const report = budget - baseBudget;
 baseBudgetVal.textContent =baseBudget.toFixed(2) + '€';

reportVal.textContent =(report >= 0 ? '+' : '') +
    report.toFixed(2) + '€';
 

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
   data:{labels:days,datasets:[{label:'Dépenses de la semaine',data:totals}]}
 });
}
function getBudgetForWeek(week){

    const baseBudget = 160;

    const weeks = Object.keys(data.weeks).sort();

    const index = weeks.indexOf(week);

    if(index <= 0){
        return baseBudget;
    }

    const prevWeek = weeks[index - 1];

    const prevExpenses =
        data.weeks[prevWeek]
            .reduce((s,e)=>s+e.amount,0);

    const prevRemain =
        getBudgetForWeek(prevWeek) - prevExpenses;

    return baseBudget + prevRemain;
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
console.log("Date :", new Date().toLocaleDateString());
console.log("Semaine calculée :", weekKey());
