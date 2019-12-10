const age = Math.floor(Math.abs(luxon.DateTime.fromFormat('20.03.1993', 'dd.MM.yyyy').diffNow('years').years));
const year = luxon.DateTime.local().year;

document.getElementById('luxonAge').innerHTML = age;
document.getElementById('luxonYear').innerHTML = year;
