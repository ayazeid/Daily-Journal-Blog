exports.getDate=function (){
let today = new Date();
let currentDay = today.getDay();
let optians = {
  weekday: "long",
  day: "numeric",
  month: "long"
}
return today.toLocaleDateString("en-US", optians);
}

exports.getDay= function(){
let today = new Date();
let currentDay = today.getDay();
let optians = {
  weekday: "long",
}
return today.toLocaleDateString("en-US", optians);
}

exports.getYear= function(){
let today = new Date();
let currentDay = today.getDay();
let optians = {
  year: "numeric",
}
return today.toLocaleDateString("en-US", optians);
}
