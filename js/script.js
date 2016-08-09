var //api base url
	apiBaseUrl = 'http://127.0.0.1:8000',
	//auth_token
	authToken = '',
	//sid
	sid = '',
	timer,
	/*Score of test, initially 0*/
	score = 0;

/* function to make ajax request
arguments url, method, data and a callback function*/
function ajaxRequest(url, method, authToken, data, callback) {
	$.ajax({
		url: url,
		headers: {"Authorization": authToken },
		type: method,
		crossDomain: true,
		data: data,
		success: function(response) {
			callback(response);
		}
	});
}

/* function to update scoring instructions*/
function update_scoring_instructions(positive_score, negative_score){
	var scoring_instructions_div = $('#scoring-instructions'),
		scoring_instructions_html = '';

	scoring_instructions_html = '<ul><li>For right answer => +' + positive_score;
	scoring_instructions_html += '</li><li>For wrong answer => -' + negative_score;
	scoring_instructions_html += '</li><li>Skip answer => 0.0</li><ul>';

	//appending html to div
	scoring_instructions_div.html(scoring_instructions_html);
}


/*function to genrate auth-token and requesting the sid for it
auth-token is genrated randomly with the prefix 'test-' as
we need auth token for demo.*/
function genrateAuthToken(){
	return new Promise(function(resolve, reject) {
	  	var randomNo,
			//variables for ajax request
			url = apiBaseUrl + "/authenticate",
			data = {},
			method = "GET",
			demoduration = '',
			totalMinutes,
			totalSeconds;

		//random number generated between 1 to 10000 for auth-token
		randomNo = Math.floor((Math.random() * 10000) + 1);
		authToken = 'test-'+ randomNo;

		//calling ajax request function
		ajaxRequest(url, method, authToken, data,function (response) {
			if(response != 'Invalid Token.'){
				resolve(response);
			}
			else{
				reject(alert("Error Occured"));
			}
		});
	});
}



/*Function to display a question and options
 in question-div and answers div respectively.
 argument : index of element of  QuizQuestions array.*/
function displayQuestion() {
	var //data for ajax request
		url = apiBaseUrl + "/nextquestion?sid=" + sid,
		method = "GET",
		data = {},
		//for displaing questions and answers
		index,
		questionHtml= $("<h3>"),
		answerHtml= "",
		questionDiv= $('#question-div'),
		answerDiv= $('#answer-div'),
		answerOption,
		lastScore;

	//calling ajax request function
	ajaxRequest(url, method, authToken, data,function (data) {
		//question index;
		index = data.id;

		//if there are questions
		if(index !== "DEMOEND" ){
			score = data.score;
			lastScore = score - $("#total-score").html();

			//removing the html from divs
			questionDiv.html('');
			answerDiv.html('');

			//appending data attribute to question div
			questionDiv.data('question-id', index);

			//appending question to questions-div
			questionHtml.html('<span class="glyphicon glyphicon-hand-right" aria-hidden="true"></span> ' + data.str);
			if(data.isMultiple){
				questionHtml.append('<br><small>This is multiple choice question.</small>');
			}
			questionHtml.append('<br>');

			//for answers
			for(i in data.options){
				answerOption = data.options[i];
				//bootstrap grid system
				answerHtml += '<div class="row">';
				if(data.isMultiple){
					answerHtml += '<div class="col-sm-12"><input type="checkbox" name="option" value="'+answerOption.id+'">'
				}
				else{
					answerHtml += '<div class="col-sm-12"><input type="radio" name="option" value="'+answerOption.id+'">'
				}
				answerHtml += '<label>' + answerOption.str + '</label><br></div>';
				answerHtml += '</div>';
			}

			questionDiv.append(questionHtml);
			answerDiv.html(answerHtml);

			//update scoring instructions
			update_scoring_instructions(data.positive, data.negative);

			//update score for question
			update_score(score, lastScore);
		}
		else{
			//if the quiz ends hide quiz and timer div
			$('#quiz-div').hide();
			$("#timer-div").hide();

			//update the result div 
			$('#result').html("Hi! Your verification token for the test was <strong>" + authToken + "</strong>.Your score is <strong>" + score +"</strong>. You will be contacted soon.");
			$('#result-div').show();
		}
	});
}


/*function to manage timer*/
function show_timer(){
	var timeLeftDiv = $("#time-left"),
		minutes,
		seconds;

	setInterval(function () {
		minutes = parseInt(timer / 60, 10);
		seconds = parseInt(timer % 60, 10);

		minutes = minutes < 10 ? "0" + minutes : minutes;
		seconds = seconds < 10 ? "0" + seconds : seconds;

		timeLeftDiv.html(minutes + ":" + seconds);

		if (--timer < 0) {
		    window.location = 'report.html';
		}
	}, 1000);
}


/*function to update the score*/
function update_score(totalScore, lastScore){
	var last_score_div = $("#last-question-score"),
		total_score_div = $("#total-score");

	last_score_div.html(lastScore);
	total_score_div.html(totalScore);
}


/* Function to initialize the gruclient*/
function init(){
	//initially instruction div and quiz div will be hidden
	$("nav").hide();
	$(".instruction-banner").hide();
	$("#instructions-div").hide();
	$("#quiz-div").hide();
	$("#timer-div").hide();
	$('#result-div').hide();
}


/* If start-demo button is clicked */
$("#verify-token").on("click", function() {
	genrateAuthToken().then(function (response) {
		sid = response.id;
		demoduration = response.demoduration;
		//choosing the demodurationg string for total minutes and seconds
		totalMinutes = (demoduration).substring(0,(demoduration).indexOf('m'));
		totalSeconds = (demoduration).substring(demoduration.indexOf('m')+ 1,demoduration.indexOf('s'));

		//convert the string into integer
		totalMinutes = parseInt(totalMinutes);
		totalSeconds = parseInt(totalSeconds);
		timer = (totalMinutes*60) + totalSeconds;

		//remove the verification div
		$("#demo-div").remove();

		//show the instructions div
		$("#instructions-div").show();
		$("nav").show();
		$(".instruction-banner").show();
		});
});


/*if start test is clicked*/
$("#start-test").on("click", function() {
	$("#instructions-div").hide();
	$(".instruction-banner").hide();
	$(".instruction-li").hide();
	$("#quiz-div").show();
	$("#timer-div").show();

	//make score divs zero
	$("#total-score").html(0);
	$("#last-question-score").html(0);

	//call the displayQuestion function and passing the index of first QuizQuestions array
	displayQuestion();

	//show user auth token
	$('#auth-token').html(authToken);
	//start timer
	show_timer();
});


/* If skip question is clicked */
$("#skip-question").on("click", function() {
	var //variable for ajax request
		url = apiBaseUrl + '/status',
		method = "POST",
		data={},
		questionIndex,

	//getting the current question id
	questionIndex = $('#question-div').data().questionId;

	data['qid'] = questionIndex;
	data['sid'] = sid;

	//ajax request
	ajaxRequest(url, method, authToken, data,function (response) {
		//call the function to display question
		displayQuestion();
	});
});

/* If skip question is clicked */
$("#submit-answer").on("click", function() {
	var //variable for ajax request
		url = apiBaseUrl + '/status',
		method = "POST",
		data={},
		questionIndex,
		answerValue = [];

	//getting the current question id
	questionIndex = $('#question-div').data().questionId;

	//getting the answer from question
	$('input[name="option"]:checked').each(function() {
		answerValue.push(this.value);
    });

	//check if atleast an option is checked
	if(answerValue.length !== 0){
		data['qid'] = questionIndex;
		data['sid'] = sid;

		for (var i = 0; i < answerValue.length; i++) {
			data['aid'] = answerValue[i];
			ajaxRequest(url, method, authToken, data,function (response) {
			});
		}
		//call the function to display question
		displayQuestion();
	}
	else{
		alert("Please select an answer first.");
	}
});

//if option text is clicked then also radio button should get selected
$('#answer-div').on('click', 'label', function() {
	$(this).parent().parent().find('input[name="option"]').prop('checked',true);
})


init();