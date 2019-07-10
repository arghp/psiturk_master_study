/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
// they are not used in the stroop code but may be useful to you

// All pages to be loaded
var pages = [
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-ready.html",
	"stage.html",
	"stage2.html",
	"stage3.html",
	"stage4.html",
	"collage.html",
	"humrob.html",
	"q1.html",
	"q2.html",
	"q3.html",
	"postquestionnaire.html"
];

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-ready.html"
];


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
*
********************/

// conditions for the survey
var cond1 = ['personal', 'non_pers', 'mix'];
var cond2 = ['human_man', 'human_woman', 'robot', 'text'];

// object dictionary for video paths
var videoPathsDict = {personal_human_man: '/static/videos/personal_human_man',
					  personal_human_woman: '/static/videos/personal_human_woman',
					  personal_robot: '/static/videos/personal_robot',
					  personal_text: '/static/videos/personal_text',
					  non_pers_human_man: '/static/videos/non_pers_human_man',
					  non_pers_human_woman: '/static/videos/non_pers_human_woman',
					  non_pers_robot: '/static/videos/non_pers_robot',
					  non_pers_text: '/static/videos/non_pers_text',
					  mix_human_man: '/static/videos/mix_human_man',
					  mix_human_woman: '/static/videos/mix_human_woman',
					  mix_robot: '/static/videos/mix_robot',
					  mix_text: '/static/videos/mix_text'};

// obtain random indices for condition 1 and 2
var rnd1 = Math.floor(Math.random() * 3);
var rnd2 = Math.floor(Math.random() * 4);

// find survey condition
var surveyCondition = {condition1: cond1[rnd1],
					   condition2: cond2[rnd2]
					  };

// testing
console.log(surveyCondition);


/********************
* STROOP TEST       *
********************/
var StroopExperiment = function() {

	// path where videos for the given conditions are located
	var videoPath = videoPathsDict[surveyCondition.condition1 + '_' + surveyCondition.condition2];

	var patientArray = [{name: 'James',
						image: '/static/images/James.jpeg',
						qClinical: 'James has difficulty hearing.',
						qPersonal: 'James used to be a pharmacist.'},
						{name: 'Barbara',
						image: '/static/images/Barbara.jpeg',
						qClinical: 'Barbara has a broken toe.',
						qPersonal: 'Barbara enjoys gardening.'},
						{name: 'Robert',
						image: '/static/images/Robert.jpeg',
						qClinical: 'Robert has difficulty walking.',
						qPersonal: 'Robert is from San Francisco.'},
						{name: 'Mary',
						image: '/static/images/Mary.jpg',
						qClinical: 'Mary has difficulty making herself heard.',
						qPersonal: 'Mary has a granddaughter named Sophia.'},
						{name: 'John',
						image: '/static/images/John.jpg',
						qClinical: 'John has a trembling chin.',
						qPersonal: 'John used to be a janitor.'},
						{name: 'Patricia',
						image: '/static/images/Patricia.jpeg',
						qClinical: 'Patricia has difficulty finding her words.',
						qPersonal: 'Patricia has a sister named Nancy.'}];

	// create stages object with pages and corresponding answers in order
	var stages = ["stage.html", "stage2.html", "stage3.html", "stage4.html"];
	var questionnaires = ["collage.html", "humrob.html", "q1.html", "q2.html", "q3.html"];

	// function for setting personal flags on patients
	var setPersonal = function() {
		if (surveyCondition.condition1 == "mix") {
			// create an array of indices
			var indices = [0, 1, 2, 3, 4 ,5];

			// shuffle indices using Durstenfeld shuffle algorithm
			for (var i = indices.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = indices[i];
				indices[i] = indices [j];
				indices[j] = temp;
			}

			// set the patients with first 3 indices of the shuffled indices array to personal
			patientArray[indices[0]].personal = true;
			patientArray[indices[1]].personal = true;
			patientArray[indices[2]].personal = true; 

		} else {
			for (var i = 0; i < 6; i++) {
				if (surveyCondition.condition1 == "personal") {
					patientArray[i].personal = true;
				} else {
					patientArray[i].personal = false;
				}
			}
		}
	};

	// counter for current page
	var counter = 0;

	var currentPage = stages[counter];

	var next = function() {
		// stage type: vignette, questions, long-questions
		if (counter < 24) {
			stageType = counter % 4;
		} else {
			stageType = counter;
		}

		currentPatient = Math.floor(counter/4);

		console.log(stageType);

		// setting up variable elements on the page depending on stageType
		if (stageType == 0){
			document.getElementById('name').innerHTML = patientArray[currentPatient].name;
			document.getElementById('vignette').innerHTML = '<img src=' + patientArray[currentPatient].image + '>';
			document.getElementById('videoPath').innerHTML = '<p>' + videoPath + '/' + patientArray[currentPatient].name + '.mp4 </p>';

		} else if (stageType == 1) {
			document.getElementById('qClinical').innerHTML = patientArray[currentPatient].qClinical;
			document.getElementById('qPersonal').innerHTML = patientArray[currentPatient].qPersonal;

			// display personal questions
			if (patientArray[currentPatient].personal == true) {
		    	var chosenDiv = document.getElementById("personal");
		    	chosenDiv.style.display = '';
			}

		} else if (stageType == 2) {
			document.getElementById('q1').innerHTML = '<p> When watching the video about ' + patientArray[currentPatient].name + ', to what extend did you feel:</p>';
		} else if (stageType == 3) {
			document.getElementById('q2').innerHTML = '<p> On a typical day, to what extent do you think ' + patientArray[currentPatient].name + ' feels:</p>';
		} else if (stageType == 25) {
			var spans = document.getElementsByClassName('humrob');
			for (var i = 0; i < spans.length; i++) {
			    if ((surveyCondition.condition2 == 'human_man') || (surveyCondition.condition2 == 'human_woman')) {
			    	spans[i].innerHTML = 'human';
			    } else {
			    	spans[i].innerHTML = 'robot';
			    }
			}
		}

		var b = document.getElementById('button');
		b.addEventListener("click", function() {
			if (stageType == 0) {
				change_page();
			} else if (stageType == 1) {
				survey_one();
			} else if ((stageType > 1) && (stageType < 28)) {
				survey_two();
			} else {
				survey_info();
			}
		});
	};

	var survey_one = function() {
		if (patientArray[currentPatient].personal){
			if (!($("input:radio[name='firstQ']").is(":checked") && $("input:radio[name='secondQ']").is(":checked"))){
				alert("Missing field(s)");
				return;
			}
			var firstQ =  document.querySelector('input[name=firstQ]:checked').value;
			var secondQ = document.querySelector('input[name =secondQ]:checked').value;
			var response = [firstQ, secondQ];
		} else{
			if (!($("input:radio[name='firstQ']").is(":checked"))){
				alert("Missing field(s)");
				return;
			}
			var firstQ =  document.querySelector('input[name=firstQ]:checked').value;
			var response = [firstQ]
		}				 

		console.log(response);
		psiTurk.recordTrialData({'phase':"TEST",
								 'patient': patientArray[currentPatient].name,
								 'stage': stageType,
								 'response': response
							   });
		change_page();
	}

	var survey_two = function() {
		var inputs = document.getElementsByTagName('input');
		var response = []
		var pushed = false;
		var radio_checked = 0;
		var radio_total = 0;

		// go through radio inputs
		for(var i = 0; i < inputs.length - 1; i+=5) {
			// go through each row
			for (var j = i; j < i + 5; j++) {
				if(inputs[j].checked) {
			        response.push(inputs[j].value);
			        radio_checked += 1;
			        pushed = true;
			    }
			    // nothing checked on the row
			    if(j == i + 4 && (!(pushed))) {
			    	response.push(-1);
			    }
			}
			pushed = false;
			radio_total += 1;	
		}

		if (radio_checked < radio_total) {
			if (!(confirm('Some questions have been left unanswered. Are you sure you would like to continue?'))) {
			    return;
			}
		}

		if (stageType == 2 || stageType == 3) {
			psiTurk.recordTrialData({'phase':"TEST",
									 'patient': patientArray[currentPatient].name,
									 'stage': stageType,
									 'response': response
								   });
		} else {
			psiTurk.recordTrialData({'phase':"TEST",
									 'stage': stageType,
									 'response': response
								   });
		}
		change_page();
	}

	
	var survey_info = function() {
		
		var age = document.getElementById("age").value;

		var gender = $('input:radio[name="gender"]:checked').map(function() {
    		return this.value;
		}).get();

		var race = $('input[name="race"]:checkbox:checked').map(function() {
    		return this.value;
		}).get();

		var region = $('input[name="region"]:checkbox:checked').map(function() {
    		return this.value;
		}).get();

		if((gender.length == 0) || (race.length == 0) || (region.length == 0) || (age == '')) {
			alert("Missing field(s)");
			return;
		}

		psiTurk.recordTrialData({'phase':"TEST",
								 'stage': stageType,
								 'age': age,
								 'gender': gender,
								 'race': race,
								 'region': region
							   });

		change_page();
	}
	

	var change_page = function() {
		if (counter < 23) {
			counter = counter + 1;
			// Load the stage.html snippet into the body of the page
			currentPage = stages[counter%stages.length];
			psiTurk.showPage(currentPage);

			next();
		}  else if ((counter >= 23) && (counter < 28)) {
			// skip the human-robot questionnaire page if text videos
			if ((counter == 24) && (surveyCondition.condition2 == 'text')) {
				counter = counter + 2;
			} else {
				counter = counter + 1;
			}

			currentPage = questionnaires[counter%24];
			psiTurk.showPage(currentPage);
			next();
		} else if (counter===28) {
				finish();
		}
	};

	var finish = function() {
		var time2 = performance.now();
		var total_time = time2 - time1;

		psiTurk.recordTrialData({'phase':"TESTEND",
								 'total_time': total_time
							   });
	    currentview = new Questionnaire();
	}


	psiTurk.recordTrialData({'phase':"INITIAL",
						 'condition': surveyCondition
					   });

	setPersonal();
	// Load the stage.html snippet into the body of the page
	psiTurk.showPage(currentPage);
	var time1 = performance.now();

	next();
	
};



/****************
* Questionnaire *
****************/

var Questionnaire = function() {

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);		
		});

	};

	prompt_resubmit = function() {
		document.body.innerHTML = error_message;
		$("#resubmit").click(resubmit);
	};

	resubmit = function() {
		document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
		reprompt = setTimeout(prompt_resubmit, 10000);
		
		psiTurk.saveData({
			success: function() {
			    clearInterval(reprompt); 
                psiTurk.computeBonus('compute_bonus', function(){
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 


			}, 
			error: prompt_resubmit
		});
	};

	// Load the questionnaire snippet 
	psiTurk.showPage('postquestionnaire.html');
	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});
	
	$("#next").click(function () {
	    record_responses();
	    psiTurk.saveData({
            success: function(){
                //psiTurk.computeBonus('compute_bonus', function() { 
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                //}); 
            }, 
            error: prompt_resubmit});
	});
    
	
};


// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
$(window).load( function(){
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence
    	function() { currentview = new StroopExperiment(); } // what you want to do when you are done with instructions
    );
});
