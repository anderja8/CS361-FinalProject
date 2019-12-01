// DOES NOT WORK
function subAccount() {
	event.preventDefault();	
	
	//Verify the information is valid
	if (document.getElementById('firstName').value == "" || 
			document.getElementById('lastName').value == "" ||
			document.getElementById('email').value == "" ||
			document.getElementById('username').value == "" ||
			document.getElementById('password').value == "") {
		alert("Error: First Name, Last Name, email, username and Password must be specified");
		return;
	}
	
	//Create the post request
	var req = new XMLHttpRequest();
	req.open("POST", '/save-account', true);
	req.setRequestHeader('Content-Type', 'application/json');
	
	//Gather the data
	var reqData = {
		firstName:document.getElementById('firstName').value,
		lastName:document.getElementById('lastName').value,
		email:document.getElementById('email').value,
		username:document.getElementById('username').value,
		password:document.getElementById('password').value,
	}
	
	//Encode and send the data
	req.send(JSON.stringify(reqData));
	
	//Once the data is updated, navigate back to the main page
	req.addEventListener("load", function(){
		var urlPath = window.location.href.substring(0, 39); //Using substring in case we change flip/port numbers
		window.location.href = urlPath;
	});
}

function createActAJAX() {
    $.ajax({
        url: '/save-account',
        type: 'POST',
        data: $('#post-account').serialize(),
        complete: function result() {
            window.location.replace("/landing");
        }
    })
}

