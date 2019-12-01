function subIncident() {
	event.preventDefault();	
	
	//Verify the information is valid
	if (document.getElementById('date').value == "" || 
			document.getElementById('location').value == "" ||
			document.getElementById('type').value == "" ||
			document.getElementById('involvement').value == "" ||
			document.getElementById('mode').value == "") {
		alert("Error: Date, location, type, involvement, and mode must be specified");
		return;
	}
	
	//Create the post request
	var req = new XMLHttpRequest();
	req.open("POST", '/save-incident', true);
	req.setRequestHeader('Content-Type', 'application/json');
	
	//Gather the data
	var reqData = {
		date:document.getElementById('date').value,
		title:document.getElementById('title').value,
		description:document.getElementById('description').value,
		location:document.getElementById('location').value,
		type:document.getElementById('type').value,
		involvement:document.getElementById('involvement').value,
		mode:document.getElementById('mode').value,
		isAnonymous:document.getElementById('isAnonymousValue').value,
		receivesUpdates:getElementById('updates').value,
	}
	
	//Encode and send the data
	req.send(JSON.stringify(reqData));
	
	//Once the data is updated, navigate back to the main page
	req.addEventListener("load", function(){
		var urlPath = window.location.href.substring(0, 39); //Using substring in case we change flip/port numbers
		window.location.href = urlPath;
	});
}

function subIncidentAJAX() {
    $.ajax({
        url: '/save-incident',
        type: 'POST',
        data: $('#post-incident').serialize(),
        complete: function result() {
            window.location.replace("/landing");
        }
    })
}
