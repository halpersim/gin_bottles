import * as mat4 from "./glMatrix/src/mat4.js";
import * as vec3 from "./glMatrix/src/vec3.js";
import * as loader from "./obj_loader.js";


window.InitializeWebGL = InitializeWebGL;
window.render = render;

var gl;
var texture_program;
var table_renderer;
var bottle_renderer;
var model = new loader.Model(InitializeWebGL);
var cubemap_resolution = 500;
var shadowmap_resolution = 300;
var eye = vec3.fromValues(0, 13, -17);
var light = vec3.fromValues(10, 50, 10);
var shadow;

loader.loadModel(model, base_url + "/models/ginfloschn.obj");

function render (rad){
   // var rad = 0;
    var fov = 90;
    if(gl){
        gl.clearColor(0.1, 0.1, 0.1, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
        
        // Clear the canvas before we start drawing on it.
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        var pers = mat4.create();
        var look = mat4.create();
        var vp = mat4.create();
        var rot = mat4.create();
        var scale = mat4.create();
        var mw = mat4.create();
    
        mat4.fromRotation(mw, -rad, vec3.fromValues(0, 1,0));
        
        
    //------------------create Shadowmap----------------------
       /* gl.bindFramebuffer(gl.FRAMEBUFFER, shadow.map);
        gl.viewport(0, 0, shadowmap_resolution, shadowmap_resolution);
        clearViewport();    
        
        render_scene(shadow.mat, mw);*/

  //-------------------fill Cubemap--------------------------
        gl.bindFramebuffer(gl.FRAMEBUFFER, bottle_renderer.cubemap_fbo);
        gl.viewport(0, 0, cubemap_resolution, cubemap_resolution);

        mat4.perspective(pers, 90, 1, 0.1, 1000);
        mat4.fromRotation(rot, -rad, vec3.fromValues(0, 1, 0));
        
        var forward = [1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1];
        var up = [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0];
        var inside = vec3.fromValues(0, 0, 0);
        var f = vec3.create();

        for(var face = 0; face < 6; face++){
            
            f = vec3.fromValues(forward[face*3], forward[face*3+1], forward[face*3+2])
            if(face < 2 || face > 3)
                vec3.transformMat4(f, f, rot);
            
            mat4.lookAt(look, inside, f, vec3.fromValues(up[face*3], up[face*3+1], up[face*3+2]));          
            
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, bottle_renderer.cubemap, 0);
            
           // mat4.multiply(look, look, rad);
            mat4.multiply(vp, pers, look);
            //clearViewport([0.8, 0.9, 1]);
            clearViewport();
            render_scene_without_bottle(vp, mw, true);
        }

   //-------------------fill bottle interior---------------------
        mat4.perspective(pers, fov, gl.viewportWidth/gl.viewportHeight, 0.1, 1000);
        mat4.lookAt(look, eye, vec3.fromValues(0,5,0), vec3.fromValues(0,1,0));

        var trans = mat4.create();

        mat4.fromTranslation(trans, vec3.fromValues(0, 3, 0));
        mat4.fromScaling(scale, vec3.fromValues(0.85, 0.85, 0.85));
        mat4.multiply(trans, trans, mw);
        mat4.multiply(scale, scale, trans);

        mat4.multiply(vp, pers, look);
   
        gl.bindFramebuffer(gl.FRAMEBUFFER, bottle_renderer.inner_fbo);
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        clearViewport([0, 0, 0]);

        gl.useProgram(bottle_renderer.pass_through_program);

        gl.enableVertexAttribArray(bottle_renderer.pass_through_program.attribute_idx.pos);
        gl.enableVertexAttribArray(bottle_renderer.pass_through_program.attribute_idx.normal);
        gl.uniformMatrix4fv(bottle_renderer.pass_through_program.vp_loc, false, vp);
        gl.uniformMatrix4fv(bottle_renderer.pass_through_program.mw_loc, false, scale);

        model.render_group("ois_glos", bottle_renderer.pass_through_program.attribute_idx, null, false);    
        
        
        gl.enable(gl.BLEND);
//------------------------render bottle------------------------------------------------------------------         
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  
        clearViewport();

        gl.useProgram(bottle_renderer);
        
        var mw_inverse = mat4.create();
        mat4.invert(mw_inverse, mw);
        gl.uniformMatrix4fv(bottle_renderer.vp_loc, false, vp);
        gl.uniformMatrix4fv(bottle_renderer.mw_loc, false, mw);
        gl.uniform3fv(bottle_renderer.inside_loc, inside);
        gl.uniform3fv(bottle_renderer.eye_loc, eye);
        gl.uniformMatrix4fv(bottle_renderer.mw_inverse_loc, false, mw_inverse);
        gl.uniform3fv(bottle_renderer.texture_size_loc, vec3.fromValues(gl.viewportWidth, gl.viewportHeight, 0));
        
        gl.uniform1i(bottle_renderer.cubemap_loc, 0);
        gl.uniform1i(bottle_renderer.innermap_loc, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, bottle_renderer.cubemap);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, bottle_renderer.interior_map);

        gl.enableVertexAttribArray(bottle_renderer.attribute_idx.pos);
        gl.enableVertexAttribArray(bottle_renderer.attribute_idx.normal);
     //   gl.enableVertexAttribArray(bottle_renderer.attribute_idx.texture);
        
        model.render_group("ois_glos", bottle_renderer.attribute_idx, null, false);

//------------------------render rest-------------------------------        
        render_scene_without_bottle(vp, mw);
    }
}

function clearViewport(color = [0.1, 0.1, 0.1]){
    gl.clearColor(color[0], color[1], color[2], 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    
    // Clear the canvas before we start drawing on it.
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}


function render_scene(vp, mw){
    render_scene_without_bottle(vp, mw, false);
    
 //  gl.enable(gl.BLEND);
 //   gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(bottle_renderer);    

    gl.uniformMatrix4fv(bottle_renderer.vp_loc, false, vp);
    gl.uniformMatrix4fv(bottle_renderer.mw_loc, false, mw); 
    
    gl.enableVertexAttribArray(bottle_renderer.attribute_idx.pos);
    gl.enableVertexAttribArray(bottle_renderer.attribute_idx.normal);
  //  gl.enableVertexAttribArray(bottle_renderer.attribute_idx.texture);

    model.render_group("ois_glos", bottle_renderer.attribute_idx, bottle_renderer.uniform_loc);
}

function render_scene_without_bottle(vp, mw, blur){   
//-----------------------------------------------------------       
    
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(texture_program);

    gl.uniformMatrix4fv(texture_program.vp_loc, false, vp);
    gl.uniformMatrix4fv(texture_program.mw_loc, false, mw); 
    
    gl.enableVertexAttribArray(texture_program.attribute_idx.pos);
    gl.enableVertexAttribArray(texture_program.attribute_idx.normal);
    gl.enableVertexAttribArray(texture_program.attribute_idx.texture);

    model.render_group("ois_verschluss", texture_program.attribute_idx, texture_program.uniform_loc);
    model.render_group("ois_korkn", texture_program.attribute_idx, texture_program.uniform_loc);
    model.render_group("ois", texture_program.attribute_idx, texture_program.uniform_loc);
    model.render_group("ois_etikett_hint", texture_program.attribute_idx, texture_program.uniform_loc);
    
    gl.disableVertexAttribArray(texture_program.attribute_idx.pos);
    gl.disableVertexAttribArray(texture_program.attribute_idx.normal);
    gl.disableVertexAttribArray(texture_program.attribute_idx.texture);

//-----------------------------------------------------------
    gl.useProgram(table_renderer);

    var table_mw = mat4.create();
    var rot = mat4.create();
    mat4.fromScaling(table_mw, vec3.fromValues(100, 1, 50));
    mat4.fromTranslation(rot, vec3.fromValues(0, -20, 0));
    mat4.multiply(table_mw, table_mw, rot);

    gl.uniformMatrix4fv(table_renderer.vp_loc, false, vp);
    gl.uniformMatrix4fv(table_renderer.mw_loc, false, table_mw); 
    gl.uniform1i(table_renderer.blur_loc, blur);

    gl.bindTexture(gl.TEXTURE_2D, table_renderer.texture);
    gl.activeTexture(gl.TEXTURE0);

    gl.bindBuffer(gl.ARRAY_BUFFER, table_renderer.vertex_buffer);
    gl.vertexAttribPointer(table_renderer.pos_idx, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(table_renderer.pos_idx);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}



function InitializeWebGL(){
    var canvas = document.getElementById("gl"); // Handle to canvas tag
    gl = GetWebGLContext(canvas);
    // ! used twice in a row to cast object state to a Boolean value
    if(gl)
    {
        // Ensure WebGL viewport is resized to match canvas dimensions
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        var vertexShader = loadShader(gl, "texture_vs.glsl", gl.VERTEX_SHADER);
        var fragmentShader = loadShader(gl, "texture_fs.glsl", gl.FRAGMENT_SHADER);

        texture_program = createProgram(gl, vertexShader, fragmentShader);
        gl.useProgram(texture_program);

        texture_program.vp_loc = gl.getUniformLocation(texture_program, "vp");
        texture_program.mw_loc = gl.getUniformLocation(texture_program, "mw");

        texture_program.uniform_loc = {};
        texture_program.uniform_loc.ambient = gl.getUniformLocation(texture_program, "ambient");
        texture_program.uniform_loc.diffuse = gl.getUniformLocation(texture_program, "diffuse");
        texture_program.uniform_loc.specular = gl.getUniformLocation(texture_program, "specular");
        texture_program.uniform_loc.specular_exponent = gl.getUniformLocation(texture_program, "specular_exponent");

        texture_program.attribute_idx = {};
        texture_program.attribute_idx.pos = gl.getAttribLocation(texture_program, "pos");
        texture_program.attribute_idx.normal = gl.getAttribLocation(texture_program, "normal");
        texture_program.attribute_idx.texture = gl.getAttribLocation(texture_program, "tex_in");
   
        

//----------------------------bottle renderer------------------------------------
        bottle_renderer = {};
        vertexShader = loadShader(gl, "bottle_vs.glsl", gl.VERTEX_SHADER);
        fragmentShader = loadShader(gl, "bottle_fs.glsl", gl.FRAGMENT_SHADER);

        bottle_renderer = createProgram(gl, vertexShader, fragmentShader);
   /*     
        bottle_renderer.uniform_loc = {};
        bottle_renderer.uniform_loc.ambient = gl.getUniformLocation(bottle_renderer, "ambient");
        bottle_renderer.uniform_loc.diffuse = gl.getUniformLocation(bottle_renderer, "diffuse");
        bottle_renderer.uniform_loc.specular = gl.getUniformLocation(bottle_renderer, "specular");
        bottle_renderer.uniform_loc.specular_exponent = gl.getUniformLocation(bottle_renderer, "specular_exponent");
*/
        bottle_renderer.attribute_idx = {};
        bottle_renderer.attribute_idx.pos = gl.getAttribLocation(bottle_renderer, "pos");
        bottle_renderer.attribute_idx.normal = gl.getAttribLocation(bottle_renderer, "normal");
    //    bottle_renderer.attribute_idx.texture = gl.getAttribLocation(bottle_renderer, "tex_in");

        bottle_renderer.vp_loc = gl.getUniformLocation(bottle_renderer, "vp");
        bottle_renderer.mw_loc = gl.getUniformLocation(bottle_renderer, "mw");
        bottle_renderer.inside_loc = gl.getUniformLocation(bottle_renderer, "inside_loc");
        bottle_renderer.eye_loc = gl.getUniformLocation(bottle_renderer, "eye");
        bottle_renderer.mw_inverse_loc = gl.getUniformLocation(bottle_renderer, "mw_inverse");
        bottle_renderer.texture_size_loc = gl.getUniformLocation(bottle_renderer, "texture_size");
        bottle_renderer.cubemap_loc = gl.getUniformLocation(bottle_renderer, "cubeTex");
        bottle_renderer.innermap_loc = gl.getUniformLocation(bottle_renderer, "innerTex");

        bottle_renderer.cubemap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, bottle_renderer.cubemap);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        for(var face = 0; face < 6; face++){
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, 0, gl.RGBA, cubemap_resolution, cubemap_resolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        bottle_renderer.cubemap_fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, bottle_renderer.cubemap_fbo);
        
        bottle_renderer.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, bottle_renderer.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, cubemap_resolution, cubemap_resolution);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, bottle_renderer.depthBuffer);

        
        bottle_renderer.interior_map = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, bottle_renderer.interior_map);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.viewportWidth, gl.viewportHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        bottle_renderer.inner_fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, bottle_renderer.inner_fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bottle_renderer.interior_map, 0);
        
        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.viewportWidth, gl.viewportHeight);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

        var vs_src = `
            uniform mat4 vp;
            uniform mat4 mw;

            attribute vec4 pos;
            attribute vec3 normal;

            varying mediump vec3 normal_fs;

            void main(){
                normal_fs = mat3(mw) * normal;
                gl_Position = vp * mw * pos;
            }
        `;
        var fs_src = `
            varying mediump vec3 normal_fs;
            void main(){
                gl_FragColor = vec4(normalize(normal_fs)*0.5+vec3(0.5), 1);
            }
        `;

        vertexShader = createShader(gl, gl.VERTEX_SHADER, vs_src);
        fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs_src);
        bottle_renderer.pass_through_program = createProgram(gl, vertexShader, fragmentShader);
        bottle_renderer.pass_through_program.vp_loc = gl.getUniformLocation(bottle_renderer.pass_through_program, "vp");
        bottle_renderer.pass_through_program.mw_loc = gl.getUniformLocation(bottle_renderer.pass_through_program, "mw");
        bottle_renderer.pass_through_program.attribute_idx = {};
        bottle_renderer.pass_through_program.attribute_idx.pos = gl.getAttribLocation(bottle_renderer.pass_through_program, "pos");
        bottle_renderer.pass_through_program.attribute_idx.normal = gl.getAttribLocation(bottle_renderer.pass_through_program, "normal");

        //ultradev.ru
        //http://translate.google.com/translate?hl=en&ie=UTF8&langpair=auto%7Cen&rurl=translate.google.com&tbb=1&u=http://www.uraldev.ru/articles/id/39/page/2
        //gamedev.ru
        //http://translate.google.com/translate?hl=en&sl=ru&tl=en&u=http%3A%2F%2Fwww.gamedev.ru%2Fcode%2Farticles%2Fcaustic&sandbox=1

//---------------------------table renderer-------------------------------------------
        table_renderer = {};
        vertexShader = loadShader(gl, "table_vs.glsl", gl.VERTEX_SHADER);
        fragmentShader = loadShader(gl, "table_fs.glsl", gl.FRAGMENT_SHADER);

        table_renderer = createProgram(gl, vertexShader, fragmentShader);

        table_renderer.vp_loc = gl.getUniformLocation(table_renderer, "vp");
        table_renderer.mw_loc = gl.getUniformLocation(table_renderer, "mw");
        table_renderer.blur_loc = gl.getUniformLocation(table_renderer, "blur");
        table_renderer.pos_idx = gl.getAttribLocation(table_renderer, "pos");


        table_renderer.vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, table_renderer.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 1, 1,   1, 0, -1, 1,    -1, 0, 1, 1,    -1, 0, -1, 1]), gl.STATIC_DRAW);
    
        var request = new XMLHttpRequest();
        var arg = base_url + "/models/" + "tisch.png" + ".raw";
        request.open("GET", arg, false);
        request.overrideMimeType('text/plain; charset=x-user-defined');  
        request.send(null);

        //https://stackoverflow.com/questions/8778863/downloading-an-image-using-xmlhttprequest-in-a-userscript

        var metadata = request.responseText.split("\n")[0];
        var texture_x = parseInt(metadata.split(" ")[0]);
        var texture_y = parseInt(metadata.split(" ")[1]);

        var data = request.responseText.replace(metadata + "\n", "").split(" ");

        var texture_raw_data = [];
        for(var i=0; i<data.length; i++){
            texture_raw_data[i] = parseInt(data[i]);
        }                    
        texture_raw_data = new Uint8Array(texture_raw_data);

        table_renderer.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, table_renderer.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texture_x, texture_y, 0, gl.RGBA, gl.UNSIGNED_BYTE, texture_raw_data);

   /*     shadow = {};
        shadow.map = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, shadow.map);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, shadowmap_resolution, shadowmap_resolution, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, null);
        
        shadow.fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, shadow.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadow.map, 0);

        shadow.mat = mat4.create();

        var pers = mat4.create();
        var look = mat4.create();
        mat4.perspective(pers, 90, 1, 0.1, 1000);   
        mat4.lookAt(look, light, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
        mat4.multiply(shadow.mat, pers, look);*/    

        model.initializeGl(gl);


    } else
        console.log("WebGL is supported, but disabled :-(");
}

function loadShader(gl, name, type){
    var request = new XMLHttpRequest();
    var target = base_url + "/shader/" + name;
    console.log("trying to get file: " + target);
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
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}