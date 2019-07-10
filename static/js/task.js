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
	"p1.html",
	"p2.html",
	"p3.html",
	"p4.html",
	"p5.html",
	"p6.html",
	"p7.html",
	"postquestionnaire.html"
];

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
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

// possible conditions for the survey
var conditions = ['negative', 'neutral'];

// use condition variable to find survey condition
var surveyCondition = conditions[mycondition];

// number of radio inputs on each page
var radioCounter = [2, 28, 0, 0, 1, 8, 2]
/********************
* STROOP TEST       *
********************/
var StroopExperiment = function() {

	psiTurk.finishInstructions();

	// stages are the interactive pages 
	var stages = ["p1.html", "p2.html", "p3.html", "p4.html", "p5.html", "p6.html", "p7.html", "p8.html", "p9.html"];

	// counter for current page
	var counter = 0;

	// set the current page
	var currentPage = stages[counter];

	// record survey condition
	psiTurk.recordTrialData({'phase':"INITIAL",
						 'condition': surveyCondition
					   });


	// start a timer
	var time1 = performance.now();

	var next = function() {
		// the video will be on page 4, so we check for counter == 3 to set up 
		// javascript for the video
		if (counter == 3) {
			// set the video source based on the condition
			var videoSrc = "/static/videos/" + surveyCondition + ".m4v";

			var b = document.querySelector("source");
			b.setAttribute("src", videoSrc);

			// enable button after video finishes
			document.getElementById('video').addEventListener('ended',myHandler,false);
		    function myHandler(e) {
	    		document.getElementById('hidden-button').style.visibility = 'visible';
		    }


			var vid= document.getElementById("video");
			var button= document.getElementById("playButton");

			// play video and hide button
			function play() {
				vid.play();
				button.style.visibility = "hidden";
			}

			button.addEventListener("click", play, false);

		}

		// get the next button
		var b = document.getElementById('button');

		// determine actions depending on the current counter
		b.addEventListener("click", function() {
			if ((counter == 0) || (counter == 1) || (counter == 4) || (counter == 5) || (counter == 6)) {
				p1();
			} else if ((counter == 2) || (counter == 3)) {
				change_page();
			}
		});
	};

	
	var p1 = function() {
		
		var textCounter = 0;
	    var textFilled = 0;
	    var radioFilled = 0;
	    
	    var r1 = []

	    // get all radio responses
	    for (var i = 1; i <= radioCounter[counter]; i++) {
	    	if ($("input:radio[name='Q" + i.toString() + "']").is(":checked")) {
	    		radioFilled += 1;
	    		r1.push($("input:radio[name='Q" + i.toString() + "']:checked").val());
	    	} else {
	    		r1.push("-1");
	    	}
	    }

	    // get all text resonses
	    var r2 = $("input[type='text']").map(function() {
    		textCounter += 1;
    		if (this.value != "") {
        		textFilled += 1;
        	} 
        	return this.value;
		}).get();

		var response = r2.concat(r1);

		// special condition for required fields on page 1 and 5
		if (counter == 0) {
			if ((response[0] == "" ) || (response[1] == "-1") || (response[2] == "-1")) {
				alert("Missing field(s)");
				return;
			}
		} else if (counter == 4) {
			if (response[0] == "-1" ) {
				alert("Missing field(s)");
				return;
			}
		}
	    
	    // check if any questions have been left unanswered
	    if ((textFilled < textCounter) || (radioFilled < radioCounter[counter])) {
	    	if (!(confirm('Some questions have been left unanswered. Are you sure you would like to continue?'))) {
			    return;
			}
	    }

		psiTurk.recordTrialData({'phase':"TEST",
								 'stage': counter,
								 'response': response
							   });

		change_page();
	}

	var change_page = function() {
		// last page
		if (counter == 6) {
			finish();
		} else {
			counter = counter + 1;
			currentPage = stages[counter];
			psiTurk.showPage(currentPage);
			window.scroll(0, 0);
			next();
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

	
	// Load the stage.html snippet into the body of the page
	psiTurk.showPage(currentPage);

	next();
	
};



/****************
* Questionnaire *
****************/

var Questionnaire = function() {

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	/*
	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);		
		});

	};
	*/

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
                //psiTurk.computeBonus('compute_bonus', function(){
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                //}); 


			}, 
			error: prompt_resubmit
		});
	};

	// Load the questionnaire snippet 
	psiTurk.showPage('postquestionnaire.html');
	//psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});
	
	$("#next").click(function () {
	    //record_responses();
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
