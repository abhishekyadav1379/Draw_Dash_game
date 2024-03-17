var round_list_id = document.getElementById("rounds_list");
var time_list_id = document.getElementById("time_list");
var word_list_id = document.getElementById("words_list");
var game_start_btn_id = document.getElementById("game_start_btn");
var main_game_id = document.getElementById("main_game_content");
var start_game_id = document.getElementById("start_game_content");
var game_over_id = document.getElementById("game_over_content");
var total_round = 0;

function rgbStringToObject(rgbString) {
    // Extracting values from the RGB string
    const regex = /rgb\((\d+), (\d+), (\d+)\)/;
    const matches = rgbString.match(regex);

    // If the RGB string format is correct
    if (matches && matches.length === 4) {
        const r = parseInt(matches[1]);
        const g = parseInt(matches[2]);
        const b = parseInt(matches[3]);

        // Returning the object with values in the specified format
        return {
            r: r,
            g: g,
            b: b,
            a: 255
        };
    } else {
        // If the RGB string format is incorrect, return null
        return null;
    }
}

let lastCalledTime = 0;

function wait_fn(x, y, pointer_color) {
    const currentTime = Date.now();
    if (currentTime - lastCalledTime > 100) {
        console.log("Function can only be called after 1 second!");
        const startTime = performance.now();
        flood_fill(x, y, rgbStringToObject(pointer_color));
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        console.log(`Execution time: ${executionTime} milliseconds`);
        lastCalledTime = currentTime;
        json_val = {
            'type': "color_fill",
            'pointer_color': pointer_color,
            'pointer_size': pointer_size,
            'cor': [x, y],
            'sender': user
        };
        draw_pattern.push(json_val);
        socket.send(
            JSON.stringify(json_val)
        )
        return;
    }

    console.log("Function called!");

}


function to_fill_color(data) {
    sender = data['sender']
    // if (sender != '@#$&$') {
    //     draw_pattern.push(data['cord']);
    // }
    if (user != sender) {
        pointer_color = data['pointer_color'];
        pointer_size = data['pointer_size'];
        cor = data['cord'];
        console.log(cor);

        flood_fill(cor[0], cor[1], rgbStringToObject(pointer_color));

    }
}

function coordinate_values(data) {
    sender = data['sender']
    // if (sender != '@#$&$') {
    //     draw_pattern.push(data['cor']);
    // }
    if (user != sender) {
        // console.log("i m udner coordienates");
        pointer_color = data['pointer_color'];
        pointer_size = data['pointer_size'];
        new_cor = data['cor'];
        drawCoordinates(new_cor, sender);
    }
}


function new_user_coming(data) {
    sender = data['sender'];
    if (sender == user) {
        time = data['time'];
        current_word = data['word'];
        current_round = data['cur_round']
        update_coordinates = data['coordinates']
        // canvas.width = data['canvas_width'];
        // canvas.height = data['canvas_height'];
        draw_pattern = data['draw_pattern']
        game_start = data['game_start']
        game_start_fn(data)
        to_draw_pattern(draw_pattern, false);
        dottedWord(current_word, 3);
        console.log("i m insidde new user coming", sender, user);

        current_time = time;
        //sec_timer = setInterval(second_timer, 1000);
        second_timer_flag = true;
    }
}


function to_draw_pattern(data, undo_opn) {
    for (let i = 0; i < data.length; i++) {
        dp = data[i];
        if (undo_opn == true) {
            dp['sender'] = '@#$&$';
        }
        if (dp['type'] == "color_fill") {
            to_fill_color(dp);
        } else if (dp['type'] == "coordinate_values") {
            coordinate_values(dp);
        }
    }
}


function undo_op(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_pattern = data['draw_pattern'];
    // draw_pattern.pop();
    to_draw_pattern(draw_pattern, true);
}


function clear_all(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function game_start_fn(data) {
    game_start = data['game_start'];
    if (game_start == true) {
        start_game_id.style.display = "none";
    main_game_id.style.display = "block";
    game_over_id.style.display = "none";
    }
    if (data['game_owner'] != user) {
        round_list_id.disabled = true;
        time_list_id.disabled = true;
        word_list_id.disabled = true;
        game_start_btn_id.disabled = true;
    }
}


function to_start_game(data) {
    current_time = data['selected_time'];
    total_round = data['selected_round'];
    console.log("i m here to start game", data);
    // console.log("hi i  to start game");
    start_game_id.style.display = "none";
    main_game_id.style.display = "block";
    game_over_id.style.display = "none";
}

game_start_btn_id.addEventListener('click', function () {
    users_len = Object.keys(users_data).length;
    if (users_len >= 2) {
        console.log("btn pressed");
        socket.send(
            JSON.stringify({
                'type': "to_start_game",
                'sender': user,
                'selected_round': selected_round,
                'selected_time': selected_time,
                'selected_words': selected_words
            })
        )
    } else {
        console.log("minimum 2 users requuied");
    }
});


function game_over(data) {
    console.log("game over");
    users_score = data['users_score'];
    //clearInterval(timerInterval);
    //clearInterval(sec_timer);
    current_time = 3600;
    update_timer_flag = false;
    second_timer_flag = false;
    console.log(users_score);
    game_over_score_update(data);
    

    game_over_id.style.display = "block";
    start_game_id.style.display = "none";
    main_game_id.style.display = "none";
}

function game_over_score_update(data){
    users_score = data['users_score'];
    ele = document.querySelector('.game-over-container4');
    var html_store = "";
    let cnt = 1;
    for (var name in users_score) {
        score = users_score[name];
        html_store += `<div class="game-over-user-score">
                    <span class="game-over-username">${cnt++}. ${name}</span>
                    <span class="game-over-username1">${score}</span>
                    </div>`;
    }
    ele.innerHTML = html_store;
}
function show_hint() {
    ctx.font = '30px Gloria Hallelujah';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    
    var text = word_hint;
    var x = canvas.width / 2;
    y = 22;
    ctx.fillText(text, x, y);
}