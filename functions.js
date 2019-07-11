
// shorter way for obtaining dom elements
function tag(tag_id_class_name){ // tag('#id'), tag('.class'), tag('tagname')
	var tag = tag_id_class_name.substring(1);
	if (tag_id_class_name.charAt(0) == '#'){
		if (document.getElementById(tag) != null){
			return document.getElementById(tag);
		}
	}
	else if (tag_id_class_name.charAt(0) == '.'){
		if (document.getElementsByClassName(tag) != null){
			return document.getElementsByClassName(tag);
		}
	}
	else if (document.getElementsByTagName(tag) != null){
		return document.getElementsByTagName(tag);
	}
	return null;
}

// This function takes care of displaying success message to the form status elem
function statusMessage(successStatus, statusMessage){

	var statusIcon = "far fa-check fa-fw";
	if (successStatus == "successful"){
		statusIcon = "far fa-check fa-fw";
	}
	else if (successStatus == "failed"){
		statusIcon = "far fa-times fa-fw";
	}
	else if (successStatus == "processing"){
		statusIcon = "far fa-spinner fa-spin fa-fw";
	}
	else if (successStatus == "info"){
		statusIcon = "far fa-info-circle fa-fw";
	}
	else if (successStatus == "alert"){
		statusIcon = "far fa-exclamation-circle fa-fw";
	}
	else{
		successStatus = "status";
		statusMessage = "Data status"
	}

	document.getElementById("status-message-wrapper").getElementsByTagName("span")[0].innerHTML = statusMessage;
	document.getElementById("status-message-wrapper").setAttribute("class", successStatus);
}

// This is the forms validation function
function formsValidation(inputFieldsAttributes){ // Parameter is a JSON object containing information about the form that needs to get validated
	/*
	Each json object inside the json obect is a input field
	{
		'element_id' : {
			"validationFunction" : "nameOfValidationFunction", // function can only have 2 parameters, first: input value, second: true or false for required
			"required" : use true or false to specified whether field is required or not,
			"type" : specified type of input (e.g. "text"),
		}
		you can add more fields to this JSON object
	}
	*/

	var errorIsPresent = false; // resets error message flag everytime function is run

	var elementsWithError = tag('.txt-error');
	for(var i = elementsWithError.length - 1; i >= 0; i--){
        elementsWithError[i].classList.remove('txt-error');
    }


	statusMessage('processing', 'Validating data...'); // Lets the user know form is processing
	var inputsData = inputFieldsAttributes;
	for(obj in inputsData){ // loops json object - paramenter

		var validation = window[inputsData[obj].validationFunction]; // Stores actual field validation function into variable

		if (typeof validation === 'function'){ // checks whether the validation function is an actual function or not

			var elemId = JSON.stringify(obj).replace(/"/g, ''); // Grabs element id from json obj
			
			//checks whether element exist or not, if not a console message is printed letting the user know about the missing field or error
			var tagElem = tag('#' + elemId);
			if (tagElem == null){
				console.log('We could not find the element with ID "' + elemId + '"');
				continue;
			}
			
			var value = null;

			if (tagElem.getAttribute('data-type') == "radio"){    // if input field is a radio, this loops takes care of getting radio selected value
				var radios = document.getElementsByName(elemId);
				for (var i = 0, length = radios.length; i < length; i++){
					if (radios[i].checked){
						value = radios[i].value;
						break;
					}
				}
			}
			else if (tagElem.getAttribute('data-type') == "checkbox"){    // if input field is a check box, this loops takes care of getting checkbox selected values
				var checkboxes = document.getElementsByName(elemId);
				value = []; // values are store as array
				for (var i = 0; checkboxes.length > i; i++){
					if (checkboxes[i].checked){
						value.push(checkboxes[i].value);
					}
				}
			}
			else{
				// stores regular text input and textare values into the variable value
				value = tagElem.value;
			}
			
			// runs field specified function with 2 parameters, first parameter is the value, second parameter is whether it is required or not
			var results = validation(value, inputsData[obj].required); // Returns a json object letting the formvalidation know what happen

			if (results.is_required || !results.is_empty){   // result cannot be empty when field input is required
				if (results.is_empty || results.is_invalid){   // result cannot be empty when field value is required, result cannot be invalid when a value is provided, if error found flag
					txtError(tagElem);
					errorIsPresent = true;
				}
			}
		}
	}
	
	if (errorIsPresent){
		// displays error message if error is found
		statusMessage('failed', 'Empty or invalid input found.');
		return false;
	}
	statusMessage('successful', 'Data validated successfully.');
	return true;
}

// adds error class to elem
function txtError(txtElement){
	txtElement.classList.add("txt-error");
}

// validates checkboxes values
var validateCheckBoxes = function(array, is_required){
	var is_empty = false;
	var is_invalid = false;
	if (Object.prototype.toString.call(array) === '[object Array]'){
		for(var i = 0; array.length > i; i++){
			if (array[i] == null || array[i].replace(/\s/g,'').length == 0){
				is_empty = true;
				is_invalid = true;
				break;
			}
		}
	}
	return {"is_required" : is_required, "is_empty" : is_empty, "is_invalid" : is_invalid, "value" : array};
}

// validates string
var validateString = function(data, is_required){
	var is_empty = true;
	var is_invalid = true;
	if (data != null && data.replace(/\s/g,'').length > 0){
		is_empty = false;
		is_invalid = false;
	}
	
	return {"is_required" : is_required, "is_empty" : is_empty, "is_invalid" : is_invalid, "value" : data};
}

// validates street address
var validateStreet = function(data, is_required){
	var is_empty = true;
	var is_invalid = true;
	if (data != null && data.replace(/\s/g, '').length > 0){
		is_empty = false;
		var reg = /^\s*\S+(?:\s+\S+){2}/;
		if (reg.test(data)){
			is_invalid = false;
		}
	}
	
	return {"is_required" : is_required, "is_empty" : is_empty, "is_invalid" : is_invalid, "value" : data};
};

// validates zipcode
var validateZipcode = function(data, is_required){
	var is_empty = true;
	var is_invalid = true;
	if (data != null && data.replace(/\s/g, '').length > 0){
		is_empty = false;
		var reg = /^\d{5}/;
		if (reg.test(data)){
			is_invalid = false;
		}
	}

	return {"is_required" : is_required, "is_empty" : is_empty, "is_invalid" : is_invalid, "value" : data};
};

//validates telephone
var validateTelephone = function(data, is_required){
	var is_empty = true;
	var is_invalid = true;
	if (data != null && data.replace(/\s/g, '').length > 0){
		is_empty = false;
		data = data.replace("-", "");
		data = data.replace(".", "");
		data = data.replace("(", "");
		data = data.replace(")", "");
		data = data.replace("/", "");
		data = data.replace(/\s/g, "");
		if (data.length > 9 && data.length < 25){
			is_invalid = false;
		}
	}
	
	return {"is_required" : is_required, "is_empty" : is_empty, "is_invalid" : is_invalid, "telephone" : data, "value" : data};
};

//validates email
var validateEmail = function(data, is_required){
    var email = data.toLowerCase();
	var is_empty = true;
	var is_invalid = true;
	
	if (email != null && email.length > 0){
		is_empty = false;
		var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (reg.test(email)){
			is_invalid = false;
		}
	}
	
	return {"is_required" : is_required, "is_empty" : is_empty, "is_invalid" : is_invalid, "value" : data};
};

// validates integer
var isInt = function(data, is_required){
	var is_empty = true;
	var is_invalid = true;
	if (data != null && data.replace(/\s/g, '').length > 0){
		is_empty = false;
		if((parseFloat(data) == parseInt(data)) && !isNaN(data)){
			is_invalid = false;
		}
	}
	return {"is_required" : is_required, "is_empty" : is_empty, "is_invalid" : is_invalid, "value" : data};
};

// checks if a string is a number
var isNumber = function(data, is_required){
	var is_empty = true;
	var is_invalid = true;
	if (data != null && data.replace(/\s/g, '').length > 0){
		is_empty = false;
		if (!isNaN(data)){
			is_invalid = false;
		}
	}
	return {"is_required" : is_required, "is_empty" : is_empty, "is_invalid" : is_invalid, "value" : data};
};

// validates datetime
var validateDateTime = function(date_time, is_required){
	date_time = stringDateCorrection(date_time, 'mm/dd/yyyy');
	var is_empty = true;
	var is_invalid = true;
	if (date_time != null && date_time.replace(/\s/g, '').length > 0){
		is_empty = false;
		var date_time_regex = /^([0]?[1-9]|1[0-2])([/]|[-])([0]?[1-9]|[1-2][0-9]|[3][0-1])([/]|[-])([1-9][0-9][0-9][0-9])$/;
		if (date_time_regex.test(date_time)){
			is_invalid = false;
		}
	}
	return {"is_required" : is_required, "is_empty" : is_empty, "is_invalid" : is_invalid, "value" : date_time};
};

// validates provided time. Time can be typed in different formats, this function detects whether time was input in military time or not, and validates the time, (e.g. will detect 19:00, and will also detect 7:00pm, 7pm and 7p and fix entry)
var validateTime = function(time, is_required){
	var is_empty = true;
	var is_invalid = true;
	
	if (time != null && time.replace(/\s/g, '').length > 0){
		is_empty = false;
		time = time.toLowerCase();
		time = time.replace('-', '');
		time = time.replace(/\s/g,'');
		if (time.indexOf('am') > -1 || time.indexOf('pm') > -1){
			when = 'pm';
			if (time.indexOf('am') > -1){
				when = 'am';
			}
			time = time.replace('am', '');
			time = time.replace('pm', '');
			var time_parts = time.split(':');
			
			if ((time_parts.length == 1 && !isNaN(time_parts[0])) || (time_parts.length > 1 && !isNaN(time_parts[0]) && !isNaN(time_parts[1]))){
				if (when == 'am'){
					time_parts[0] = time_parts[0].toString() == '12' ? 00 : time_parts[0];
					if (parseInt(time_parts[0]) >= 12){
						when = 'pm';
					}
				}
			
				if (when == 'pm'){
					time_parts[0] = parseInt(time_parts[0]) > 12 && parseInt(time_parts[0]) < 24 ? time_parts[0] : parseInt(time_parts[0]) == 12 ? parseInt(time_parts[0]) : parseInt(time_parts[0]) < 12 ? parseInt(time_parts[0]) + 12 : null;
				}
				
				if (time_parts[0] != null){
					if (time_parts.length == 1){
						time = time_parts[0] + ":00:00";
						is_invalid = false;
					}
					else if (time_parts.length > 1){
						if (parseInt(time_parts[1]) >= 0 && parseInt(time_parts[1]) < 60){
							time = time_parts[0] + ":" + time_parts[1] + ":00";
							is_invalid = false;
						}
					}
				}
			}
		}
		else{
			var time_parts = time.split(':');
			if (time_parts.length == 1 && !isNaN(time_parts[0])){
				time = parseInt(time_parts[0]) < 24 ? time_parts[0] + ":00:00" : null;
				if (time != null){
					is_invalid = false;
				}
			}
			else if (time_parts.length > 1 && !isNaN(time_parts[0]) && !isNaN(time_parts[1])){
				time = parseInt(time_parts[0]) < 24 ? time_parts[0] + ":" + time_parts[1] + ":00" : null;
				if (time != null){
					is_invalid = false;
				}
			}
		}
	}
	if (!is_invalid){
		tag('#time-txt').value = time;
	}
	return {"is_required" : is_required, "is_empty" : is_empty, "is_invalid" : is_invalid, "value" : time};
};

//form fields properties
var entryFormAttributes = {
		'fname-txt' : {
			'validationFunction' : 'validateString',
			'required' : true,
			'type' : 'text',
			'name' : 'title',
		},
		'lname-txt' : {
			'validationFunction' : 'validateString',
			'required' : true,
			'type'	: 'text',
			'name' : 'date',
		},
		'email-txt' : {
			'validationFunction' : 'validateEmail',
			'required' : true,
			'type'	: 'text',
			'name' : 'start-time',
		},
		'time-txt' : {
			'validationFunction' : 'validateTime',
			'required' : false,
			'type'	: 'text',
			'name' : 'start-time',
		}
	};

// specific form validation
function validateEntryForm(){
	var successfullyValidated = formsValidation(entryFormAttributes);
	if (successfullyValidated){
		// run ajax to send data to server
	}
}






