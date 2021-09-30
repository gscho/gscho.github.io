var darkMode = window.localStorage.getItem('darkMode');
if(!darkMode){
  darkMode = matched = window.matchMedia('(prefers-color-scheme: dark)').matches;
}
else if(darkMode === "true"){
  darkMode = true;
}
else{
  darkMode = false;
}
saveMode();


function darkToggle(){
  toggle();
  saveMode();
}

function saveMode(){
  var button = document.getElementById("dark-button");
  if(darkMode || darkMode){
    document.body.classList.add("dark");
    button.innerText = "light";
  }
  else{
    document.body.classList.remove("dark");
    button.innerText = "dark";
  }
}

function toggle(){
  darkMode = !darkMode;
  window.localStorage.setItem('darkMode',darkMode); 
}