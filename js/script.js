/* Function to initialize the gruclient*/
function init(){
	//instruction div will be hidden
	$("#instructions-div").hide();
}

/* If verify button is clicked */
$("#verify-token").on("click", function() {

	//remove the verification div
	$("#verification-div").remove();

	//show the instructions div
	$("#instructions-div").show();
});

init();