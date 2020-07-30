// Should be run in a worker
var curDate;
var curHours;
var amOrPm;
var dayName;
setInterval(()=>{
    curDate = new Date;
    curHours = curDate.getHours();
    amOrPm = "AM";
    if(curHours > 12) {
        curHours -= 12;
        amOrPm = "PM";
    }
    dayName = new Intl.DateTimeFormat('en-US', {weekday: "short"}).format(curDate);
    postMessage("T"+dayName+" "+curHours+":"+curDate.getMinutes().toString().padStart(2, "0")+" "+amOrPm);
}, 1000);
setInterval(()=>{ // every 15 seconds, check to se if user has wifi
    postMessage(["O", navigator.onLine]);
}, 15000);