var game_start = false;
var selected_round = 5;
var selected_time = 80;
var selected_words = 3;
var rounds_list_go_id = document.getElementById("rounds_list_go");
var time_list_id_go = document.getElementById("time_list_go");
var word_list_id_go = document.getElementById("words_list_go");
var restart_btn = document.getElementById("restart_btn");
var game_name_id = document.getElementById("game_name");
var like_id = document.getElementById("like");
var dislike_id = document.getElementById("dislike");
var like_dislike_cont = document.getElementById("draw-like_dislike_cont");

waiting_user_class = document.querySelector('.waiting-area-container4');
waiting_user_class.innerHTML = `<span class="waiting-area-username">${user}</span>`;

like_id.addEventListener('click', function () {
    like_dislike_cont.style.display = "none";
    socket.send(
        JSON.stringify({
            'type': "like_dislike",
            'sender': user,
            'method': 'like'
        })
    )
});

dislike_id.addEventListener('click', function () {
    like_dislike_cont.style.display = "none";
    socket.send(
        JSON.stringify({
            'type': "like_dislike",
            'sender': user,
            'method': 'dislike'
        })
    )
})

document.getElementById("rounds_list").addEventListener("change", function () {
    var selectedValue = this.value;
    console.log("Selected value: " + selectedValue);
});


round_list_id.addEventListener('change', function () {
    selected_round = this.value;
});

time_list_id.addEventListener('change', function () {
    selected_time = this.value;
});

word_list_id.addEventListener('change', function () {
    selected_words = this.value;
});

rounds_list_go_id.addEventListener('change', function () {
    selected_round = this.value;
});

time_list_id_go.addEventListener('change', function () {
    selected_time = this.value;
});

word_list_id_go.addEventListener('change', function () {
    selected_words = this.value;
});

restart_btn.addEventListener('click', function () {
    socket.send(
        JSON.stringify({
            'type': "to_start_game",
            'sender': user,
            'restart': true,
            'selected_round': selected_round,
            'selected_time': selected_time,
            'selected_words': selected_words
        })
    )
});


const button = document.getElementById("tap_to_guess_btn");
const inputField = document.getElementById("keyboardInput");

button.addEventListener("click", function () {
    inputField.focus();
});

inputField.addEventListener("input", function () {
    // Log the input value to the console
    val = inputField.value
    if (val === '') {
        game_name_id.innerText = "✏️ Draw Dash ✏️";
    } else {
        console.log(inputField.value);
        game_name_id.innerText = val;
    }
});

inputField.addEventListener("keydown", handleKeyDown);