function bindFilterButton(id) {
    let button = document.getElementById("filter-button");
    button.addEventListener("click", function(event) {
        let filter = $('#searchIncidents').serialize();
        let req = new XMLHttpRequest();
        req.open("GET", "/viewUserReports?" + filter, true);

        req.addEventListener('load', function() {
            if (req.status < 400) {
                let response = JSON.parse(req.responseText);
                let row, data;
                let table = document.getElementById("table-data");
                let numEntries = table.children.length;

                for (let i = 0; i < numEntries; i++) {
                    table.removeChild(table.children[0]);
                }

                for (let p in response) {
                    row = document.createElement("tr");
                    table.appendChild(row);

                    data = document.createElement("button");
                    data.setAttribute('class', 'btn btn-primary');
                    data.setAttribute('onclick', "location.href='/viewUserReports/" + id + "';");
                    row.appendChild(data);
                    data.textContent = "View";
                    data = document.createElement("td");
                    row.appendChild(data);
                    data.textContent = response[p].title;
                    data = document.createElement("td");
                    row.appendChild(data);
                    data.textContent = response[p].incidentDate;
                    data = document.createElement("td");
                    row.appendChild(data);
                    data.textContent = response[p].incidentType;
                }
            }
        });
        req.send(null);
        event.preventDefault();
    });
}
