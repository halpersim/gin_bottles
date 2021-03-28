import * as mat4 from "../lib/glMatrix/src/mat4.js";

import * as vec3 from "../lib/glMatrix/src/vec3.js";

import * as loader from "../lib/obj_loader.js";





window.render = render;

window.on_resize = function(){

    load_framebuffer_components(reflection_program, texture_scale);

    load_framebuffer_components(scaled_canvas, canvas_scale);

};



var gl;

var bottle_program;

var reflection_program;

var texture_program;

var scaled_canvas;

var model = new loader.Model(InitializeWebGL);



var canvas;



var eye = vec3.fromValues(0, 13, -14);

var poi = vec3.fromValues(0, 7.6, 0);

var light = vec3.fromValues(-20, 18, -27);

var texture_scale = 2;

var canvas_scale = 2;





//loader.loadModel(model, base_url + "./models/ginfloschn_mit_java_iwaorweit_ep_005.obj");

//loader.loadModel(model, base_url + "./models/ginfloschn.obj");

loader.loadModel(model, base_url + "./models/ginfloschn_mit_java_iwaorweit_ep_0.005_ohne_unnetigs.zip");

//loader.loadModel(model, base_url + "./models/ginfloschn_mit_java_iwaorweit_ep_0.005_ohne_unnetigs.obj");

//loader.loadModel(model, base_url + "./models/ginfloschn_mit_java_iwaorweit_ep_008_ohne_noppn.obj");

//loader.loadModel(model, base_url + "./models/ginfloschn_mit_java_iwaorweit_ep_01.obj");



function InitializeWebGL(){

    canvas = document.getElementById("gl");

    gl = GetWebGLContext(canvas);

    // ! used twice in a row to cast object state to a Boolean value

    if(gl)

    {

        gl.enable(gl.DEPTH_TEST);           // Enable depth testing

        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things 



        //---------------------bottle_program----------------------------------

        var vertexShader = loadShader(gl, "bottle_vs.glsl", gl.VERTEX_SHADER);

        var fragmentShader = loadShader(gl, "bottle_fs.glsl", gl.FRAGMENT_SHADER);



        bottle_program = createProgram(gl, vertexShader, fragmentShader);



        bottle_program.attribute_idx = {};

        bottle_program.attribute_idx.pos = gl.getAttribLocation(bottle_program, "pos");

        bottle_program.attribute_idx.normal = gl.getAttribLocation(bottle_program, "normal");



        bottle_program.uniform_loc = {};

        bottle_program.uniform_loc.vp = gl.getUniformLocation(bottle_program, "vp");

        bottle_program.uniform_loc.mw = gl.getUniformLocation(bottle_program, "mw");

        bottle_program.uniform_loc.light = gl.getUniformLocation(bottle_program, "light");

        bottle_program.uniform_loc.eye = gl.getUniformLocation(bottle_program, "eye");

        bottle_program.uniform_loc.diffuse = gl.getUniformLocation(bottle_program, "diffuse");

        bottle_program.uniform_loc.specular = gl.getUniformLocation(bottle_program, "specular");

        bottle_program.uniform_loc.specular_exponent = gl.getUniformLocation(bottle_program, "spec_exp");





        //---------------------reflection program----------------------------------

        vertexShader = loadShader(gl, "reflection_vs.glsl", gl.VERTEX_SHADER);

        fragmentShader = loadShader(gl, "reflection_fs.glsl", gl.FRAGMENT_SHADER);



        reflection_program = createProgram(gl, vertexShader, fragmentShader);

        

        reflection_program.uniform_loc = {};

        reflection_program.uniform_loc.vp = gl.getUniformLocation(reflection_program, "vp");

        reflection_program.uniform_loc.mw = gl.getUniformLocation(reflection_program, "mw");

        reflection_program.uniform_loc.eye = gl.getUniformLocation(reflection_program, "eye");

        reflection_program.uniform_loc.cn = gl.getUniformLocation(reflection_program, "cn");

        reflection_program.uniform_loc.fov = gl.getUniformLocation(reflection_program, "fov");

        reflection_program.uniform_loc.aspect = gl.getUniformLocation(reflection_program, "aspect");



        reflection_program.framebuffer = gl.createFramebuffer();

        load_framebuffer_components(reflection_program, texture_scale);



        

        reflection_program.vertex_buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, reflection_program.vertex_buffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 1, 1,   1, 0, -1, 1,    -1, 0, 1, 1,    -1, 0, -1, 1]), gl.STATIC_DRAW);



        //-----------------------scaled canvas-----------------------------------------

        scaled_canvas = {}

        scaled_canvas.framebuffer = gl.createFramebuffer();

        load_framebuffer_components(scaled_canvas, canvas_scale);



        var vs_source = `

            attribute vec2 pos;



            varying mediump vec2 tc;



            void main(){

                gl_Position = vec4(pos, 0, 1);

                tc = pos * 0.5 + 0.5;

            }

        `;



        var fs_source = `

            uniform sampler2D tex;

            varying mediump vec2 tc;    

            void main(){

                gl_FragColor = texture2D(tex, tc);

            }

        `;



        vertexShader = createShader(gl, gl.VERTEX_SHADER, vs_source);

        fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs_source);

        scaled_canvas.program = createProgram(gl, vertexShader, fragmentShader);



        scaled_canvas.attribute_idx = {};

        scaled_canvas.attribute_idx.pos = gl.getAttribLocation(scaled_canvas.program, "pos");

        

        scaled_canvas.vertex_buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, scaled_canvas.vertex_buffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1,  1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);





        //-----------------------texture program-----------------------------------------

        vertexShader = loadShader(gl, "texture_vs.glsl", gl.VERTEX_SHADER);

        fragmentShader = loadShader(gl, "texture_fs.glsl", gl.FRAGMENT_SHADER);



        texture_program = createProgram(gl, vertexShader, fragmentShader);        



        texture_program.uniform_loc = {};

        texture_program.uniform_loc.mw = gl.getUniformLocation(texture_program, "mw");

        texture_program.uniform_loc.vp = gl.getUniformLocation(texture_program, "vp");

        texture_program.uniform_loc.light = gl.getUniformLocation(texture_program, "light");

        texture_program.uniform_loc.eye = gl.getUniformLocation(texture_program, "eye");

        texture_program.uniform_loc.diffuse = gl.getUniformLocation(texture_program, "diffuse");

        texture_program.uniform_loc.specular = gl.getUniformLocation(texture_program, "specular");

        texture_program.uniform_loc.specular_exponent = gl.getUniformLocation(texture_program, "spec_exp");

        

        texture_program.attribute_idx = {};

        texture_program.attribute_idx.pos = gl.getAttribLocation(texture_program, "pos");

        texture_program.attribute_idx.normal = gl.getAttribLocation(texture_program, "normal");

        texture_program.attribute_idx.texture = gl.getAttribLocation(texture_program, "texture");





        //--------------------clear defaults----------------------------------------

        

        console.timeEnd('initialize model');

        model.initializeGl(gl);

        document.getElementById("gl").style.background = 'none';

        

        window_on_scroll();  

    } else

        console.log("WebGL is supported, but disabled :-(");

}





function load_framebuffer_components(obj, scale){

    if(gl){

        obj.depthBuffer = gl.createRenderbuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, obj.depthBuffer);

        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width* scale, canvas.height * scale);



        obj.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, obj.texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width * scale, canvas.height * scale, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);



        gl.bindFramebuffer(gl.FRAMEBUFFER, obj.framebuffer);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, obj.texture, 0);

        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, obj.depthBuffer);

    }

}



function render (rad, fov, poi_y){

   // var rad = 0;

   // fov = 1.5707;

   if(gl){

        var pers = mat4.create();

        var look = mat4.create();

        var vp = mat4.create();

        var rot = mat4.create();

        var mw_bottle = mat4.create();

        var mw_label = mat4.create();

        var rot_pi = mat4.create();

        var trans = mat4.create();



        poi = vec3.fromValues(0, poi_y, 0);



        mat4.perspective(pers, fov, canvas.width/canvas.height, 0.1, 1000);

        mat4.lookAt(look, eye, poi, vec3.fromValues(0, 1, 0));

        //mat4.lookAt(look, vec3.fromValues(eye[0], -eye[1], eye[2]), poi, vec3.fromValues(0, 1, 0));

        mat4.multiply(vp, pers, look);



        mat4.fromTranslation(trans, vec3.fromValues(0, 7, 0)); // de 7 sen weng an model

        mat4.fromRotation(rot_pi, 3.1415, vec3.fromValues(0, 1, 0));

        mat4.fromRotation(rot, rad, vec3.fromValues(0, 1, 0)); 



        mat4.multiply(mw_bottle, trans, rot_pi);

        mat4.multiply(mw_label, mw_bottle, rot);



        gl.bindFramebuffer(gl.FRAMEBUFFER, scaled_canvas.framebuffer);

        gl.viewport(0, 0, canvas.width * canvas_scale, canvas.height * canvas_scale); 

        clearViewport();

        render_bottle(vp, mw_bottle, mw_label);

        

        

        //--------------------------------reflection----------------------------------------

        //-------bottle

        gl.bindFramebuffer(gl.FRAMEBUFFER, reflection_program.framebuffer);

        gl.clearColor(0.1, 0.1, 0.1, 0.0);

        gl.clearDepth(1.0);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        

        gl.useProgram(bottle_program);

        gl.viewport(0, 0, canvas.width * texture_scale, canvas.height * texture_scale);

        var ref_vp = mat4.create();

        var ref_eye = vec3.fromValues(eye[0], -eye[1], eye[2]);

        mat4.lookAt(look, ref_eye, poi, vec3.fromValues(0, 1, 0));

        mat4.multiply(ref_vp, pers, look);



        render_bottle(ref_vp, mw_bottle, mw_label);

        //--------table

        gl.bindFramebuffer(gl.FRAMEBUFFER, scaled_canvas.framebuffer);

       // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, canvas.width * canvas_scale, canvas.height * canvas_scale); 

        gl.useProgram(reflection_program);



        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, reflection_program.texture);



        gl.bindBuffer(gl.ARRAY_BUFFER, reflection_program.vertex_buffer);

        gl.vertexAttribPointer(reflection_program.pos_idx, 4, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(reflection_program.pos_idx);



        var ref_mw = mat4.create();

        var mat = mat4.create();

        //mat4.fromTranslation(ref_mw, reflection_eye);

        mat4.fromScaling(mat, vec3.fromValues(25, 1, 25));

        mat4.multiply(ref_mw, ref_mw, mat);

        gl.uniformMatrix4fv(reflection_program.uniform_loc.vp, false, vp);

        gl.uniformMatrix4fv(reflection_program.uniform_loc.mw, false, ref_mw);

        gl.uniform3fv(reflection_program.uniform_loc.eye, eye);

        gl.uniform3fv(reflection_program.uniform_loc.cn, vec3.fromValues(poi[0] - ref_eye[0], poi[1] - ref_eye[1], poi[2] - ref_eye[2]));

        gl.uniform1f(reflection_program.uniform_loc.fov, fov);

        gl.uniform1f(reflection_program.uniform_loc.aspect, canvas.width/canvas.height);



        gl.disableVertexAttribArray(1);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);





        //-------------------draw on actual canvas-------------------

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(scaled_canvas.program);



        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, scaled_canvas.texture);



        gl.bindBuffer(gl.ARRAY_BUFFER, scaled_canvas.vertex_buffer);

        gl.vertexAttribPointer(scaled_canvas.attribute_idx.pos, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(scaled_canvas.attribute_idx.pos);

        gl.disableVertexAttribArray(1);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    }

}



function render_bottle(vp, mw_bottle, mw_label){

    gl.useProgram(bottle_program);

    gl.enableVertexAttribArray(bottle_program.attribute_idx.pos);

    gl.enableVertexAttribArray(bottle_program.attribute_idx.normal);

    

    gl.uniformMatrix4fv(bottle_program.uniform_loc.vp, false, vp);

    gl.uniformMatrix4fv(bottle_program.uniform_loc.mw, false, mw_bottle);

    gl.uniform3fv(bottle_program.uniform_loc.eye, eye);

    gl.uniform3fv(bottle_program.uniform_loc.light, light);

    

    model.render_group("OIS", bottle_program.attribute_idx, bottle_program.uniform_loc);

    model.render_group("OIS_floschn", bottle_program.attribute_idx, bottle_program.uniform_loc);

    model.render_group("OIS_holspickal", bottle_program.attribute_idx, bottle_program.uniform_loc);

    

    gl.useProgram(texture_program);

    gl.enableVertexAttribArray(texture_program.attribute_idx.pos);

    gl.enableVertexAttribArray(texture_program.attribute_idx.normal);

    gl.enableVertexAttribArray(texture_program.attribute_idx.texture);

    

    gl.uniformMatrix4fv(texture_program.uniform_loc.vp, false, vp);

    gl.uniformMatrix4fv(texture_program.uniform_loc.mw, false, mw_label);

    gl.uniform3fv(texture_program.uniform_loc.eye, eye);

    gl.uniform3fv(texture_program.uniform_loc.light, light);

    

    gl.enable(gl.BLEND);

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    model.render_group("OIS_Mat", texture_program.attribute_idx, texture_program.uniform_loc);

    gl.disable(gl.BLEND);

}









//------------------ Utils --------------------------------------------



function clearViewport(color = [0.1, 0.1, 0.1]){

    gl.clearColor(color[0], color[1], color[2], 1.0);  // Clear to black, fully opaque

    gl.clearDepth(1.0);                 // Clear everything



    // Clear the canvas before we start drawing on it.

    

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

}



function loadShader(gl, name, type){

    var request = new XMLHttpRequest();

    var target = base_url + "/shader/" + name;

 //   console.log("trying to get file: " + target);

    request.open("GET", target, false);

    request.overrideMimeType('text/plain; charset=x-user-defined');  

    request.send(null);



    return createShader(gl, type, request.responseText);

}





function GetWebGLContext( canvas )

{

    return canvas.getContext("webgl") ||            // Standard

    canvas.getContext("experimental-webgl") ||  // Alternative; Safari, others

    canvas.getContext("moz-webgl") ||           // Firefox; mozilla

    canvas.getContext("webkit-3d");             // Last resort; Safari, and maybe others

    // Note that "webgl" is not available as of Safari version <= 7.0.3

    // So we have to fall back to ambiguous alternatives for it,

    // and some other browser implementations.

}



function createShader(gl, type, source) {

    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);  

    gl.compileShader(shader);

    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) {

        return shader;

    }



    console.log("" + type + gl.getShaderInfoLog(shader));

    gl.deleteShader(shader);

}



function createProgram(gl, vertexShader, fragmentShader) {

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);

    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) {

        gl.deleteShader(vertexShader);

        gl.deleteShader(fragmentShader);

        return program;

    }



    console.log(gl.getProgramInfoLog(program));

    gl.deleteProgram(program);

}