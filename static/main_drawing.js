   function scrollToBottom() {
     var chatContainer = document.getElementById("messages");
     chatContainer.scrollTop = chatContainer.scrollHeight;
   }
   scrollToBottom();
   console.log(user);

   const websocketProtocol = window.location.protocol === "https:" ? "wss" : "ws";
   // const wsEndpoint = '${websocketProtocol}://${window.location.host}/ws/notification/'+room_name+'/'+user+'/';
   const wsEndpoint = `${websocketProtocol}://${window.location.host}/ws/notification/${room_name}/${user}/`;
   const socket = new WebSocket(wsEndpoint);


   //Worker code here to execute timer
   // Worker Script (worker.js)
   const workerCode = `
        setInterval(function() {
            postMessage('');
        }, 1000); // Sending a message every second
        `;

   // Creating a Blob from the worker code
   const workerBlob = new Blob([workerCode], {
     type: 'application/javascript'
   });
   const workerURL = URL.createObjectURL(workerBlob);

   var worker = new Worker(workerURL);

   var update_timer_flag = false;
   var second_timer_flag = false;
   var show_ovarlay_flag = false;


   function execute_every_sec() {
     if (update_timer_flag) {
       updateTimer();
     }
     if (second_timer_flag) {
       second_timer();
     }
     if (show_ovarlay_flag) {
       showOverlay();
     }
   }
   // worker are end here


   // var game_over_id = document.getElementById("game-over");
   // game_over_id.style.display = "none";


   // Global variables
   var timerElement = document.getElementById("Time");
   var current_time = 3600;
   var timerInterval;
   var sec_timer;
   var overlay_fn;
   var current_word = "@#$%!";
   var is_guessed = false;
   var pointer_color = "rgb(0, 0, 1)";
   var pointer_size = 3;
   var draw_pattern = [];
   var users_data;
   var word_hints = [];
   var word_name = "";
   var word_hint = "";
   var clock_sound = document.getElementById("clock_click_sound");
   var click_sound = document.getElementById("click_sound");

   function updateTimer() {
     // temp();


     timerElement.innerHTML = '⌛' + current_time + 's';
     //timerElement.textContent = current_time + 's';
     //console.log(timerElement.textContent);
     current_time--;
     //console.log(current_time);
     //  console.log("timeelemt  ", current_time);
     if (current_time == -1) {
       current_word = "@#$%!";
       //clearInterval(timerInterval);
       update_timer_flag = false;
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       socket.send(
         JSON.stringify({
           'type': "timesup",
           'sender': user
         })
       )
     } else {
       socket.send(
         JSON.stringify({
           'type': "timer",
           'time': current_time,
           'sender': user
         })
       )
     }
   }

   function second_timer() {
     timerElement.textContent = '⌛' + current_time + 's';
     current_time--;
     //  console.log("timeelemt2  ", current_time);
     if (current_time == 15) show_hint();
     if (current_time == 25 && !is_guessed){
      printDottedWord(word_name, 2);
     }
     if (current_time <= 10) {
       clock_sound.play();
     }
     if (current_time == -1) {
       console.log(("second timer"));
       current_word = "@#$%!";
       //clearInterval(sec_timer);
       second_timer_flag = false;
       //ctx.clearRect(0, 0, canvas.width, canvas.height);
     }
   }

   //var timerInterval = setInterval(updateTimer, 1000);

   //canvas code is here 
   // Get the canvas element and its context
   var canvas = document.getElementById('myCanvas');
   var ctx = canvas.getContext('2d', {
     willReadFrequently: true
   });
   var isDrawing = false;
   var coordinates = [];
   var cor = "";
   var who_can_draw = "";

   var container = document.getElementById("myCanvas");
   var canvas_containerWidth = container.offsetWidth;
   var canvas_containerheight = container.offsetHeight;

   // Function to start drawing
   function startDrawing(event) {
     if (who_can_draw != user) return;
     isDrawing = true;
     var rect = canvas.getBoundingClientRect(); // Get the position of the canvas
     var x, y;
     if (event.type === 'touchstart') {
       //  x = event.touches[0].clientX - rect.left; // Adjust touch x-coordinate relative to canvas position
       //  y = event.touches[0].clientY - rect.top; // Adjust touch y-coordinate relative to canvas position

       x = (event.touches[0].clientX - rect.left) / (rect.right - rect.left) * canvas.width; // Adjust mouse x-coordinate relative to canvas position
       y = (event.touches[0].clientY - rect.top) / (rect.bottom - rect.top) * canvas.height; // Adjust mouse y-coordinate relative to canvas position

     } else {
       x = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width; // Adjust mouse x-coordinate relative to canvas position
       y = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height; // Adjust mouse y-coordinate relative to canvas position

     }
     console.log(event.clientX, event.clientY, rect.left, rect.top);
     var x = Math.floor(x);
     var y = Math.floor(y);
     x = Math.floor(x);
     y = Math.floor(y);
     console.log(x, y);
     if (isColorFilled == true) {
       //  flood_fill(x, y, rgbStringToObject(pointer_color));
       wait_fn(x, y, pointer_color);
       isDrawing = false;
       console.log(x, y);
       return;
     }
     ctx.beginPath();
     ctx.moveTo(x, y);

     ctx.lineWidth = pointer_size;
     ctx.lineCap = "round";
     ctx.strokeStyle = pointer_color;

     ctx.lineTo(x, y);
     ctx.stroke();
     // console.log(x, y);
     coordinates.push([x, y]);
   }


   // Function to stop drawing
   function stopDrawing() {
     if (who_can_draw != user) return;
     isDrawing = false;
     console.log(coordinates);
     cor = JSON.stringify(coordinates);
     if (coordinates.length > 0) {
       json_val = {
         'type': "coordinate_values",
         'pointer_color': pointer_color,
         'pointer_size': pointer_size,
         'cor': cor,
         'sender': user
       };
       draw_pattern.push(json_val);
       socket.send(
         JSON.stringify(json_val)
       )
     }
     coordinates = [];
     cor = "";
     //  ctx.beginPath();
     ctx.closePath();
   }


   // Function to draw lines
   function draw(event) {

     if (who_can_draw != user) return;
     if (isDrawing) {

       ctx.lineWidth = pointer_size;
       ctx.lineJoin = "round";
       ctx.lineCap = "round";
       ctx.strokeStyle = pointer_color;
       var rect = canvas.getBoundingClientRect(); // Get the position of the canvas
       var x, y;
       if (event.type === 'touchmove' || event.type === 'touchstart') {
         x = (event.touches[0].clientX - rect.left) / (rect.right - rect.left) * canvas.width; // Adjust mouse x-coordinate relative to canvas position
         y = (event.touches[0].clientY - rect.top) / (rect.bottom - rect.top) * canvas.height; // Adjust mouse y-coordinate relative to canvas position

       } else {
         x = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width; // Adjust mouse x-coordinate relative to canvas position
         y = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height; // Adjust mouse y-coordinate relative to canvas position

       }
       ctx.lineTo(x, y);
       ctx.stroke();
       coordinates.push([x, y]);
     }
   }


   // Event listeners
   canvas.addEventListener('mousedown', startDrawing);
   canvas.addEventListener('mouseup', stopDrawing);
   canvas.addEventListener('mousemove', draw);
   canvas.addEventListener('mouseleave', stopDrawing);

   canvas.addEventListener('touchstart', startDrawing);
   canvas.addEventListener('touchend', stopDrawing);
   canvas.addEventListener('touchmove', draw);
   canvas.addEventListener('touchcancel', stopDrawing);

   function drawCoordinates(coordList, sender) {
     //  if (sender == user) {
     //    return;
     //  }
     if (typeof coordList === 'string') {
       coordList = JSON.parse(coordList);
     }
     ctx.lineWidth = pointer_size;
     ctx.lineCap = "round";
     ctx.lineJoin = "round";
     ctx.strokeStyle = pointer_color;
     ctx.beginPath();
     ctx.moveTo(coordList[0][0], coordList[0][1]);

     for (var i = 0; i < coordList.length; i++) {
       var currentX = coordList[i][0];
       var currentY = coordList[i][1];
       ctx.lineTo(currentX, currentY);
       ctx.stroke();
       ctx.beginPath();
       ctx.moveTo(currentX, currentY);
     }
   }


   function flood_fill(x, y, color) {
     var pixel_color = ctx.getImageData(x, y, 1, 1).data;
     rgb_color = {
       r: pixel_color[0],
       g: pixel_color[1],
       b: pixel_color[2],
       a: 255
     };
     if (JSON.stringify(rgb_color) === JSON.stringify(color)) {
       console.log("color hi same hai");
       console.log(rgb_color, color);
       return;
     }
     console.log(rgb_color, color);
     // var rgb_val = 
     pixel_stack = [{
       x: x,
       y: y
     }];
     pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
     var linear_cords = (y * canvas.width + x) * 4;
     original_color = {
       r: pixels.data[linear_cords],
       g: pixels.data[linear_cords + 1],
       b: pixels.data[linear_cords + 2],
       a: pixels.data[linear_cords + 3]
     };

     while (pixel_stack.length > 0) {
       new_pixel = pixel_stack.shift();
       x = new_pixel.x;
       y = new_pixel.y;

       //console.log( x + ", " + y ) ;

       linear_cords = (y * canvas.width + x) * 4;
       while (y-- >= 0 &&
         (pixels.data[linear_cords] == original_color.r &&
           pixels.data[linear_cords + 1] == original_color.g &&
           pixels.data[linear_cords + 2] == original_color.b &&
           pixels.data[linear_cords + 3] == original_color.a)) {
         linear_cords -= canvas.width * 4;
       }
       linear_cords += canvas.width * 4;
       y++;

       var reached_left = false;
       var reached_right = false;
       while (y++ < canvas.height &&
         (pixels.data[linear_cords] == original_color.r &&
           pixels.data[linear_cords + 1] == original_color.g &&
           pixels.data[linear_cords + 2] == original_color.b &&
           pixels.data[linear_cords + 3] == original_color.a)) {
         pixels.data[linear_cords] = color.r;
         pixels.data[linear_cords + 1] = color.g;
         pixels.data[linear_cords + 2] = color.b;
         pixels.data[linear_cords + 3] = color.a;

         if (x > 0) {
           if (pixels.data[linear_cords - 4] == original_color.r &&
             pixels.data[linear_cords - 4 + 1] == original_color.g &&
             pixels.data[linear_cords - 4 + 2] == original_color.b &&
             pixels.data[linear_cords - 4 + 3] == original_color.a) {
             if (!reached_left) {
               pixel_stack.push({
                 x: x - 1,
                 y: y
               });
               reached_left = true;
             }
           } else if (reached_left) {
             reached_left = false;
           }
         }

         if (x < canvas.width - 1) {
           if (pixels.data[linear_cords + 4] == original_color.r &&
             pixels.data[linear_cords + 4 + 1] == original_color.g &&
             pixels.data[linear_cords + 4 + 2] == original_color.b &&
             pixels.data[linear_cords + 4 + 3] == original_color.a) {
             if (!reached_right) {
               pixel_stack.push({
                 x: x + 1,
                 y: y
               });
               reached_right = true;
             }
           } else if (reached_right) {
             reached_right = false;
           }
         }

         linear_cords += canvas.width * 4;
       }
     }
     ctx.putImageData(pixels, 0, 0);
   }

   function is_in_pixel_stack(x, y, pixel_stack) {
     for (var i = 0; i < pixel_stack.length; i++) {
       if (pixel_stack[i].x == x && pixel_stack[i].y == y) {
         return true;
       }
     }
     return false;
   }



   var isColorFilled = false;


   document.getElementById('fill_color').addEventListener('click', function () {
     var container = document.getElementById("fill_color");
     if (!isColorFilled) {
       //  flood_fill(100, 100, { r: 255, g: 0, b: 0, a: 255 });
       isColorFilled = true;
       container.style.backgroundColor = 'black';
     } else {
       // Remove background color here
       container.style.backgroundColor = 'transparent';
       isColorFilled = false;
     }
   });

   var clear_btn = document.getElementById('clear_all')
   clear_btn.addEventListener('click', function () {
     //  ctx.clearRect(0, 0, canvas.width, canvas.height);
     socket.send(
       JSON.stringify({
         'type': 'clear_all',
       })
     )
   })


   document.getElementById('undo').addEventListener('click', function () {
     //  ctx.clearRect(0, 0, canvas.width, canvas.height);
     socket.send(
       JSON.stringify({
         'type': 'undo_op',
       })
     )

   })

   // overlay 
   // const overlayBtn = document.getElementById('overlayBtn');
   const overlay = document.querySelector('.choose-word-container');
   let overlayTimeout;
   var overlay_time = 10;

   function showOverlay() {
     overlay.style.display = 'block';
     overlay_time--;
     //  console.log("overlay_time  ", overlay_time);
     if (overlay_time == -1) {
       show_ovarlay_flag = false;
       overlay.style.display = 'none';
       chooseRandomWord();
     }
   }

   function chooseRandomWord() {
     const words = document.querySelectorAll('.choose-word-word');
     const randomIndex = Math.floor(Math.random() * words.length);
     const randomWord = words[randomIndex].textContent.trim();
     console.log("Automatically chosen word:", randomWord);
     // Replace the following line with your desired functionality
     sendWord(randomWord);
   }


   document.addEventListener("DOMContentLoaded", function () {
     document.querySelector('.choose-word-all-words').addEventListener("click", function (event) {
       const target = event.target.closest('.choose-word-word');
       if (target) {
         const value = target.textContent.trim();
         console.log("Selected word:", value);
         // Replace the following lines with your desired functionality
         overlay.style.display = 'none';
         show_overlay_flag = false;
         sendWord(value);
       }
     });
   });


   //     pointer size selection 
   const dropdownToggles = document.querySelectorAll('[data-thq="thq-dropdown-toggle"]');
   dropdownToggles.forEach(toggle => {
     // Add a click event listener
     toggle.addEventListener('click', function () {
       // Get the value of the clicked dropdown toggle
       const value = this.querySelector('.draw-text04').textContent;
       console.log(value); // Print the value to the console
       pointer_size = 3 * value;

     });
   });

   //  set pointer color 
   const labels = document.querySelectorAll('.draw-colorscontainer label');
   labels.forEach(label => {
     label.addEventListener('click', function () {
       const name = this.getAttribute('name');
       //  rgb_value = rgbStringToObject(name);
       pointer_color = name;
       console.log(pointer_color);
     });
   });

   function sendWord(word) {
     // Perform actions to send the word to the server (socket)
     // This function is just a placeholder for the actual implementation
     // Replace it with your socket sending logic
     canvas_container = document.getElementById('myCanvas');
     hint = "";
     for (let i = 0; i < word_hints.length; i++) {
       text = word_hints[i][0];
       console.log(word_hints[i][0], word_hints[i][1], word_name);
       if (text === word) {
         hint = word_hints[i][1];
         break;
       }
     }
     //  canvas.width = canvas_container.clientWidth;
     //  canvas.height = canvas_container.clientHeight;
     //  console.log("canvas_container_width", canvas_container_width, canvas_container_height);
     socket.send(
       JSON.stringify({
         'type': "word_choosed",
         'word_name': word,
         'sender': user,
         'word_hint': hint
         // //  'canvas_width': canvas.width,
         //  'canvas_height': canvas.height
       })
     );
   }



   // Define the function to handle keydown events
   function handleKeyDown(event) {
     if (event.key === 'Enter') {
       event.preventDefault(); // Prevent the default form submission behavior
       chat_message = document.getElementById('input_message').value || inputField.value; // Get the value from the input field
       console.log("I am handling the message");
       console.log(chat_message, current_word);
       if (chat_message.toLowerCase() === current_word.toLowerCase() && is_guessed === false) {
         is_guessed = true;
         chat_message = user + " guess the word";
         socket.send(JSON.stringify({
           'type': 'word_guessed',
           'sender': user,
         }));
         socket.send(JSON.stringify({
           'type': 'chat_message',
           'ini_type': 'guess',
           'message': chat_message,
           'room_name': room_name,
           'sender': user,
         }));
       } else {
         socket.send(JSON.stringify({
           'type': 'chat_message',
           //  'ini_type': 'guess',
           'message': chat_message,
           'room_name': room_name,
           'sender': user,
         }));

         // Clear the input field after sending the message
         this.value = '';
         game_name_id.innerText = "✏️ Draw Dash ✏️";
         inputField.value = '';
       }
     }
   }

   // Add the event listener with the function
   document.getElementById('input_message').addEventListener('keydown', handleKeyDown);


   document.getElementById('tap_to_guess_btn').addEventListener('click', function () {
     // Show the hidden input field
     // document.getElementById('keyboardInput').style.display = 'block';
     console.log("button clicked");
     // Focus on the input field to trigger the keyboard
     document.getElementById('keyboardInput').focus();
   });

   // chat working
   socket.addEventListener("message", (event) => {
     const messageData = JSON.parse(event.data)['message'];
     if (messageData == null) return;

     var sender = messageData['sender'];
     var message = messageData['message'];
     // empty message input field after message has been sent
     if (sender == user) {
       document.getElementById('input_message').value = '';
     }

     // Here's where we append the message to the chatbox.
     var messageDiv = document.querySelector('.draw-messages');
     console.log(messageData);
     if ('ini_type' in messageData) {
       console.log("i m indisde ini)type");
       messageDiv.innerHTML += `<span class="draw-receivermessage" style="background-color: #C5FAC4;">
                                  <span style="color: red; font-weight: bold">${sender}  </span>
                                  <span > guess the word</span>
                                <br />
                              </span>`;

       scrollToBottom();
       return;
     }

     if ('method' in messageData) {
      method = messageData['method'];
      messageDiv.innerHTML += `<span class="draw-receivermessage" style="background-color: #99ccff;">
                                  <span style="color: Green; font-weight: bold">${sender}  </span>
                                  <span > ${method}d drawing</span>
                                <br />
                              </span>`;

       scrollToBottom();
       return
     }
     if (sender != user) {

       messageDiv.innerHTML += `<span class="draw-receivermessage">
                                  <span style="color: blue; font-weight: bold">${sender}: </span>
                                  <span >${message}d &nbsp;</span>
                                <br />
                              </span>`;
     } else {
       messageDiv.innerHTML += `<span class="draw-sendermessage">
                                <span >${message} &nbsp;</span>
                                <br />
                              </span>`;
     }
     scrollToBottom();

   });



   var color_cont = document.getElementById('draw-color-container');

   function choose_a_word(data) {
     current_round = data['cur_round']
     word_hints = data['words'];
     pointer_size = 3;
     //  console.log(words);
     console.log("curent", current_round);
     round_el = document.getElementById("rounds");
     active_user = data['user'];
    //  console.log(user, active_user);
     round_el.textContent = String(current_round) +  `/${String(total_round)}🔃`;
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     who_can_draw = active_user;
    //  is_drawing = true;
     is_guessed = false;
     current_time = data['time'];
     //clearInterval(timerInterval);
     //clearInterval(sec_timer);
     update_timer_flag = false;
     second_timer_flag = false;
     console.log("user type", active_user, user);
     html_element = document.querySelector('.choose-word-all-words');
     //  var html_element;
     if (active_user == user) {
       color_cont.style.display = 'flex';
       is_guessed = true;
       //timerInterval = setInterval(updateTimer, 1000);
       update_timer_flag = true;
       html_element.style.display = 'block';
       new_el = `<div class="choose-word-all-words">`;
       for (let i = 0; i < word_hints.length; i++) {
         new_el += `<span class="choose-word-word">
          <span>${word_hints[i][0]}</span>
          <br />
        </span>`;
       }
       html_element.innerHTML = new_el + `</div>`;
     } else {
       //sec_timer = setInterval(second_timer, 1000);
       color_cont.style.display = 'none';
       second_timer_flag = true;
       html_element.style.display = 'none';
       html_element = document.querySelector('.choose-word-whoischoosing');
       html_element.innerHTML = `<span>By ${active_user}</span>
       <br />`
     }
     //overlay_fn = showOverlay();
     overlay_time = 10;
     show_ovarlay_flag = true;
     console.log(data['words']);
   }


   function dottedWord(word, n) {
     let wordArray = word.split('');
     let indices = [];
     for (let i = 0; i < n; i++) {
       let randomIndex = Math.floor(Math.random() * wordArray.length);
       indices.push(randomIndex);
     }
     for (let index of indices) {
       wordArray[index] = '_';
     }
     let dotted = wordArray.join(' ');
     guess_word_id = document.getElementById("guess_word");
     guess_word_id.innerHTML = dotted;
     return dotted;
   }

   function printDottedWord(word, revealCount) {
     if (revealCount > word.length) {
       console.error("Number of characters to reveal cannot exceed word length.");
       return;
     }

     // Create an array to store the indices of characters to reveal
     let revealIndices = [];

     // Generate unique random indices for revealing characters
     while (revealIndices.length < revealCount) {
       let randomIndex = Math.floor(Math.random() * word.length);
       if (!revealIndices.includes(randomIndex)) {
         revealIndices.push(randomIndex);
       }
     }

     // Build the dotted word
     let dottedWord = '';
     for (let i = 0; i < word.length; i++) {
       if (revealIndices.includes(i)) {
         dottedWord += word[i];
       } else {
         dottedWord += '_ ';
       }
     }
     guess_word_id = document.getElementById("guess_word");
     guess_word_id.innerHTML = dottedWord + `<sup>${word.length}</sup>`;
     return dottedWord;
   }


   function score_board(data) {
    click_sound.play();
     console.log('score board updated', data);
     users_data = data['users_score']; // value in the dictionary
     console.log(users_data);
     who_guessed = data['who_guessed'];
     // who_guessed = who_guessed.replace(/[{}']/g, "").split(", ");
     // who_guessed = new Set(who_guessed);
     var sortedArray = Object.entries(users_data);

     // Sort the array based on scores in descending order
     sortedArray.sort(function (a, b) {
       return b[1] - a[1];
     });

     html_create = "";
     waiting_user_create = "";
     console.log(who_guessed);
     for (var i = 0; i < sortedArray.length; i++) {

       name1 = sortedArray[i][0];
       bg = "";
       if (name1 in who_guessed) {
         bg = 'style="background-color: #c6f7b7;"';
       }
       console.log(bg);
       html_create += `<div class="draw-usersscore"  ${bg}>
                    <span class="draw-username">${sortedArray[i][0]}</span>
                    <span class="draw-userscore">${sortedArray[i][1] }</span>
                  </div>`

       waiting_user_create += `<span class="waiting-area-username">${sortedArray[i][0]}</span>`;
     }
     game_over_score_update(data);
     var tag_name = document.querySelector('.draw-users');
     tag_name.innerHTML = html_create;
     waiting_user_class = document.querySelector('.waiting-area-container4');
     waiting_user_class.innerHTML = waiting_user_create;
   }


   function word_choosed(data) {
    like_dislike_cont = document.getElementById("like_dislike_cont");
    like_dislike_cont.style.display = "block";
     word_name = data['word_name'];
     current_word = word_name;
     sender = data['sender'];
     word_hint = data['word_hint'];
     //  canvas.width = data['canvas_width'];
     //  canvas.height = data['canvas_height'];
     console.log(word_name);
     var guessWordElement = document.getElementById("guess_word");
     if (sender == user) {
       guessWordElement.textContent = word_name;
     } else {
       printDottedWord(word_name, 0);
     }
     //clearInterval(overlay_fn);
     show_ovarlay_flag = false;
     overlay.style.display = 'none';
   }

   socket.onmessage = (event) => {
     const data = JSON.parse(event.data);
     if ('type' in data) {

       if (data['type'] == 'choose_a_word') {
         choose_a_word(data);
       } else if (data['type'] == 'word_choosed') {
         word_choosed(data);
       } else if (data['type'] == 'coordinate_values') {
         coordinate_values(data);
       } else if (data['type'] == 'new_user_coming') {
         new_user_coming(data);
       } else if (data['type'] == 'score_board') {
         score_board(data);
       } else if (data['type'] == 'game_over') {
         game_over(data);
       } else if (data['type'] == 'color_fill') {
         to_fill_color(data);
       } else if (data['type'] == 'undo_op') {
         undo_op(data);
       } else if (data['type'] == 'clear_all') {
         clear_all(data);
       } else if (data['type'] == 'to_start_game') {
         to_start_game(data);
       }
     }

   }
   socket.onopen = (event) => {
     console.log("WebSocket connection opened!");
   };

   socket.onclose = (event) => {
     console.log("WebSocket connection closed!");
   };

   worker.onmessage = execute_every_sec;