
var employeesUrl = "http://services.odata.org/V3/Northwind/Northwind.svc/Employees?$format=json";

sessionStorage.setItem("isActiveSession", false);

function login(){

	var username = $("#username").val();
	var password = $("#password").val();
	
	var flag = false;
	
	if(username=="Marko" && password=="Lukovic"){
		sessionStorage.setItem("isActiveSession", true);
		sessionStorage.setItem("user", "Marko Luković");
		sessionStorage.setItem("userTitle", "team leader");
		sessionStorage.setItem("userImage", "images/profile.jpg");
		sessionStorage.setItem("userType", "client");
		location.href = "main.html";
	}else{
		
		$.ajax({
			url: employeesUrl,
			dataType: "json",			
			success: function(employeesResult){
				var employees = employeesResult.value;
				for(var i in employees){
					if(employees[i].FirstName == username && employees[i].LastName == password){
						sessionStorage.setItem("user", employees[i].FirstName + " " + employees[i].LastName);
						sessionStorage.setItem("userTitle", employees[i].Title);
						sessionStorage.setItem("userImage", "data:image/jpeg;base64," + employees[i].Photo.substr(104));
						flag = true;
						break;
					}
				}
				if(flag){
					sessionStorage.setItem("isActiveSession", true);
					sessionStorage.setItem("userType", "admin");
					location.href = "main.html";
				}else{
					document.getElementById("welcome").innerHTML = "Uneli ste pogrešan userame ili password";
				}
			},
			error: function(error){
				alert(error.mesage);
			}
		});
	}
	

	

	
	
}



