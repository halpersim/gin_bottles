
var base_url = "http://muckundmischung.bplaced.net/wp/js";
document.addEventListener("scroll", window_on_scroll);
document.addEventListener("load", init_bottle);

var canvas = document.getElementById("gl");

function window_on_scroll(){
    let start = 100 + canvas.offsetTop;
    let end = start + canvas.height;
    
    var t = Math.min(Math.max((window.pageYOffset - start), 0) / (end - start), 1);
    var rad = t * Math.PI * 0.5;
    var fov = Math.PI * 0.33 * (2-t);
    window.render(rad, fov);
}
    
function init_bottle(){
    var viewportwidth;
    var viewportheight;
     
    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined')    {
         viewportwidth = window.innerWidth,
         viewportheight = window.innerHeight
    }     
   // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
        && typeof document.documentElement.clientWidth !=
        'undefined' && document.documentElement.clientWidth != 0)    {
          viewportwidth = document.documentElement.clientWidth,
          viewportheight = document.documentElement.clientHeight
    }else{ // older versions of IE
          viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
          viewportheight = document.getElementsByTagName('body')[0].clientHeight
    }

    canvas.width = Math.min(700, viewportwidth);
    canvas.height = Math.min(650, viewportheight);
}