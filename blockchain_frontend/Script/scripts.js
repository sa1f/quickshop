function updateTableNames() {
  // Declare variables 
  // Declare variables 
  var input, filter, table, tr, td, i, k;
  input = document.getElementById("searchNames");
  filter = input.value.toLowerCase();
  table = document.getElementById("blockchain_table");
  tr = table.getElementsByTagName("tr");

  for(i = 0; i < tr[2].getElementsByTagName('td').length; i++){
    if(tr[2].getElementsByTagName("td")[i].innerHTML.toLowerCase().indexOf(filter) > -1){
        tr[0].getElementsByTagName('th')[i+1].style.display = '';
        for(k = 1; k < 7; k++){
            tr[k].getElementsByTagName("td")[i].style.display = '';
        }
    }
    else{
        tr[0].getElementsByTagName('th')[i+1].style.display = 'none';
        for(k = 1; k < 7; k++){
            tr[k].getElementsByTagName("td")[i].style.display = 'none';
        }
    }
  }
}

function updateTableDates() {
  // Declare variables 
  // Declare variables 
  var input, filter, table, tr, td, i, k;
  input = document.getElementById("searchDates");
  filter = input.value.toLowerCase();
  table = document.getElementById("blockchain_table");
  tr = table.getElementsByTagName("tr");

  for(i = 0; i < tr[3].getElementsByTagName('td').length; i++){
    if(tr[3].getElementsByTagName("td")[i].innerHTML.toLowerCase().indexOf(filter) > -1){
        tr[0].getElementsByTagName('th')[i+1].style.display = '';
        for(k = 1; k < 7; k++){
            tr[k].getElementsByTagName("td")[i].style.display = '';
        }
    }
    else{
        tr[0].getElementsByTagName('th')[i+1].style.display = 'none';
        for(k = 1; k < 7; k++){
            tr[k].getElementsByTagName("td")[i].style.display = 'none';
        }
    }
  }
}

function updateTable() {
  // Declare variables 
  // Declare variables 
  var input, filterby, row, filter, table, tr, td, i, k;
  filterby = document.getElementById('filterButton').innerHTML
  if(filterby == 'Filtering by Names'){
    row = 2;
  }
  else if(filterby == 'Filtering by Dates'){
    row = 3;
  }
  else if(filterby == 'Filtering by Products'){
    row = 4;
  }
  else if(filterby == 'Filtering by Hash'){
    row = 6
  }

  input = document.getElementById("search");
  filter = input.value.toLowerCase();
  table = document.getElementById("blockchain_table");
  tr = table.getElementsByTagName("tr");

  for(i = 0; i < tr[row].getElementsByTagName('td').length; i++){
    if(tr[row].getElementsByTagName("td")[i].innerHTML.toLowerCase().indexOf(filter) > -1){
        tr[0].getElementsByTagName('th')[i+1].style.display = '';
        for(k = 1; k < 7; k++){
            tr[k].getElementsByTagName("td")[i].style.display = '';
        }
    }
    else{
        tr[0].getElementsByTagName('th')[i+1].style.display = 'none';
        for(k = 1; k < 7; k++){
            tr[k].getElementsByTagName("td")[i].style.display = 'none';
        }
    }
  }
}

function FilterNames(){
  var btn = document.getElementById('filterButton');
  btn.innerHTML = 'Filtering by Names';
}

function FilterDates(){
  var btn = document.getElementById('filterButton');
  btn.innerHTML = 'Filtering by Dates';
}

function FilterProducts(){
  var btn = document.getElementById('filterButton');
  btn.innerHTML = 'Filtering by Products';
}

function FilterHash(){
  var btn = document.getElementById('filterButton');
  btn.innerHTML = 'Filtering by Hash';
}