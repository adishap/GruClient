var //api base url
	apiBaseUrl = 'http://127.0.0.1:8000',
	//auth_token
	authToken = '',
	//sid
	sid = '',
	//Collection of all questions
	quizQuestions = [{" What does HTML stand for?":
							['Hyper Text Markup Language',
							'Home Tool Markup Language',
							'Hyperlinks and Text Markup Language']
					},
					{"Who is making the Web standards?" :
							['The World Wide Web Consortium',
							'Mozilla',
							'Google',
							'Microsoft']
					},
					{"Choose the correct HTML element for the largest heading" :
							['<h5>',
							'<heading>',
							'<h1>',
							'<h3>']
					},
					{"What is the correct HTML element for inserting a line break?":
							['<break>',
							'<br>',
							'<lb>']
					},
					{"What is the correct HTML for adding a background color?" :
							['<body style="background-color:yellow;">',
							'<background>yellow</background>',
							'<body bg="yellow">']
					},
					{"Choose the correct HTML element to define important text" :
							['<strong>',
							'<b>',
							'<important>',
							'<i>']
					},
					{"Choose the correct HTML element to define emphasized text" :
							['<i>',
							'<em>',
							'<italic>']
					},
					{"What is the correct HTML for creating a hyperlink?" :
							['<a name="http://www.w3schools.com">W3Schools.com</a>',
							'<a url="http://www.w3schools.com">W3Schools.com</a>',
							'<a href="http://www.w3schools.com">W3Schools</a>',
							'<a>http://www.w3schools.com</a>']
					},
					{" How can you open a link in a new tab/browser window?" :
							['<a href="url" new>',
							'<a href="url" target="_blank">',
							'<a href="url" target="new">']
					},
					{"Which of these elements are all <table> elements?" :
							['<table><head><tfoot>',
							'<table><tr><td>',
							'<thead><body><tr>',
							'<table><tr><tt>']
					}],
	/* correct answers are stored in the form of index of 
	answer on the index of question in the questionsCollection array */
	correctAnswers = [0, 0, 2, 1, 0, 0, 1, 2, 1, 1],
	/*Score of test, initially 0*/
	score = 0;

/* function to make ajax request
arguments url, method, data and a callback function*/
function ajaxRequest(url, method, authToken, data, callback) {
	console.log(url, method, authToken);
	$.ajax({
		url: url,
		headers: { 'Access-Control-Allow-Origin' : '*',
		"Authorization": authToken },
		type: method,
		crossDomain: true,
		data: data,
		success: function(response) {
			console.log(response);
			callback(JSON.parse(response));
		}
    });
}


/*function to genrate auth-token and requesting the sid for it
auth-token is genrated randomly with the prefix 'test-' as
we need auth token for demo.*/
function genrateAuthToken(){
	var randomNo,
		//variables for ajax request
		url = apiBaseUrl + "/authenticate",
		data = {},
		headers = {},
		method = "GET";

	//random number generated between 1 to 10000 for auth-token
	randomNo = Math.floor((Math.random() * 10000) + 1);
	authToken = 'test-'+ randomNo;
	console.log(authToken);

	//calling ajax request function
	ajaxRequest(url, method, authToken, data,function (data) {
		console.log(response);
	});
}


/*Function to display a question and options
 in question-div and answers div respectively.
 argument : index of element of  QuizQuestions array.*/
function displayQuestion(index) {
	var questionHtml= $("<h3>"),
		answerHtml= "",
		questionDiv= $('#question-div'),
		answerDiv= $('#answer-div'),
		answerOptions;

	//removing the html from divs
	questionDiv.html('');
	answerDiv.html('');

	//appending data attribute to question div
	questionDiv.data('question-id', index);

	//appending question to questions-div
	for(question in quizQuestions[index]){
		questionHtml.html('<span class="glyphicon glyphicon-hand-right" aria-hidden="true"></span>' + question);
		answerOptions = quizQuestions[index][question];

		//for answers
		for(i in answerOptions){
			//bootstrap grid system
			answerHtml += '<div class="row">';
			answerHtml += '<div class="col-sm-1"><input type="radio" name="option" value="'+i+'"></div>'
			answerHtml += '<div class="col-sm-11"><pre><xmp style="padding:0px;margin:0px;white-space:nowrap">' + answerOptions[i] + '</xmp></pre><br></div>';
			answerHtml += '</div>';
		}
	}
	questionDiv.append(questionHtml);
	answerDiv.html(answerHtml);
}


/*function to manage timer*/
function show_timer(){
	var timeLeftDiv = $("#time-left"),
		minutes= 60,
		seconds= 60,
    	timer = minutes*seconds;

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
function update_score(questionIndex, answerValue){
	var last_score_div = $("#last-question-score"),
		total_score_div = $("#total-score");

	if(correctAnswers[questionIndex] == answerValue){
		score += 2.5;
		$("#last-question-score").html(2.5);
	}
	else{
		score += -3;
		$("#last-question-score").html(-3);
	}

	total_score_div.html(score);
}


/* Function to initialize the gruclient*/
function init(){
	//instruction div will be hidden
	$("#instructions-div").hide();

	//make score divs zero
	$("#total-score").html(0);
	$("#last-question-score").html(0);

	//it will check id quiz questions div is visible
	if($('#quiz-questions').is(":visible")){
		//call the displayQuestion function and passing the index of first QuizQuestions array
		displayQuestion(0);

		//start timer
		show_timer();
	}
}


//restrict back button of browser 
(function ($, global) {

    var _hash = "!",
    noBackPlease = function () {
        global.location.href += "#";

        setTimeout(function () {
            global.location.href += "!";
        }, 50);
    };

    global.setInterval(function () {
        if (global.location.hash != _hash) {
            global.location.hash = _hash;
        }
    }, 100);

    global.onload = function () {
        noBackPlease();
    }

})(jQuery, window);


if($('#final-score').is(":visible")){
	//write final score in report
	$('#final-score').html(score);
}


/* If verify button is clicked */
$("#start-demo").on("click", function() {
	//generating the auth token
	genrateAuthToken();

	//remove the verification div
	$("#demo-div").remove();

	//show the instructions div
	$("#instructions-div").show();
});


/* If skip question is clicked */
$("#skip-question").on("click", function() {
	var questionIndex;

	//getting the current question id
	questionIndex = $('#question-div').data().questionId;

	//check if index is not of last question
	if(questionIndex != quizQuestions.length -1){
		displayQuestion(questionIndex + 1);
		$("#last-question-score").html('');
		$("#last-question-score").html(0);
	}
	else{
		alert("Thier are no more questions.");

		//redirect to new page
		window.location = 'report.html';
	}
});

/* If skip question is clicked */
$("#submit-answer").on("click", function() {
	var questionIndex,
		answerValue;

	//getting the current question id
	questionIndex = $('#question-div').data().questionId;

	//getting the answer from question
	answerValue = $('#answer-div').find('input[type="radio"]:checked').val();

	if(answerValue !== undefined){
		//update score for answer;
		update_score(questionIndex, answerValue);

		//check if index is not of last question
		if(questionIndex != quizQuestions.length -1){
			displayQuestion(questionIndex + 1);
		}
		else{
			alert("Test finished.");

			//redirect to new page
			window.location = 'report.html';
		}

	}
	else{
		alert("Please select an answer first.");
	}

});

//if option text is clicked then also radio button should get selected
$('#answer-div').on('click', 'pre', function() {
	$(this).parent().parent().find('input[type="radio"]').prop('checked',true);
})

init();
