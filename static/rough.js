function variables_declare(){
    timerElement = document.getElementById("Time");
    canvas = document.getElementById('myCanvas');
   ctx = canvas.getContext('2d', {
     willReadFrequently: true
   });
   container = document.getElementById("myCanvas");
   canvas_containerWidth = container.offsetWidth;
   canvas_containerheight = container.offsetHeight;
}