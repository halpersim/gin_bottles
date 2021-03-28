import * as vec4 from "./glMatrix/src/vec4.js";

class Material{
    constructor(mtl_data, idx){
        this.name = mtl_data[idx].replace("newmtl", "").trim();

        while(++idx < mtl_data.length && !(mtl_data[idx].startsWith("newmtl"))){
            var line = mtl_data[idx].trim();
            var first_blank = line.indexOf(" ");
            
            if(first_blank != -1){
                var op = line.substring(0, first_blank);
                var arg = line.replace(op, "").trim();

                if(op == "Ns"){
                    this.spec_exponent = parseInt(arg);
                }else if(op == "Tr"){
                    this.alpha = parseFloat(arg);
                }else if(op == "d"){
                    this.alpha = parseFloat(arg);
                    console.log("found mtl property d -> this.alpha = " + this.alpha);
                }else if(op == "Kd"){
                    this.diffuse = parseArrayToFloat(arg.split(" "));
                }else if(op == "Ka"){
                    this.ambient = parseArrayToFloat(arg.split(" "));
                }else if(op == "Ks"){
                    this.specular = parseArrayToFloat(arg.split(" "));
                }else if(op == "map_Kd"){
                    var request = new XMLHttpRequest();
                    arg = base_url + "/models/" + arg + ".raw";
                    request.open("GET", arg, false);
                    request.overrideMimeType('text/plain; charset=x-user-defined');  
                    request.send(null);

                    //https://stackoverflow.com/questions/8778863/downloading-an-image-using-xmlhttprequest-in-a-userscript

                    var metadata = request.responseText.split("\n")[0];
                    this.texture_x = parseInt(metadata.split(" ")[0]);
                    this.texture_y = parseInt(metadata.split(" ")[1]);

                    console.log("texture x = " + this.texture_x + " ---- texture y = " + this.texture_y);
                    var data = request.responseText.replace(metadata + "\n", "").split(" ");

                    this.texture_raw_data = [];
                    for(var i=0; i<data.length; i++){
                        this.texture_raw_data[i] = parseInt(data[i]);
                    }                    
                    this.texture_raw_data = new Uint8Array(this.texture_raw_data);
                
                }

            }
        }
        if(!this.hasOwnProperty('alpha'))
            this.alpha = 1;
        this.idx = idx;
    }

    initializeGl(gl){        
        this.gl = gl;
        
        if(this.hasOwnProperty('texture_raw_data')){
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        /*  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);*/
            // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture_raw_data);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.texture_x, this.texture_y, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.texture_raw_data);
        }
    }

    bind(uniform_loc){
        

        if(this.hasOwnProperty('texture')){
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        }

        var amb;
        if(this.hasOwnProperty('ambient'))
            amb = vec4.fromValues(this.ambient[0], this.ambient[1], this.ambient[2], this.alpha);
        else   
            amb = vec4.fromValues(0, 0, 0, 0);

        this.gl.uniform4fv(uniform_loc.ambient, amb);

        var diff;
        if(this.hasOwnProperty('diffuse'))
            diff = vec4.fromValues(this.diffuse[0], this.diffuse[1], this.diffuse[2], this.alpha);
        else
            diff = vec4.fromValues(0, 0, 0, 0);
        this.gl.uniform4fv(uniform_loc.diffuse, diff);
        

        var spec;
        if(this.hasOwnProperty('specular')){
            spec = vec4.fromValues(this.specular[0], this.specular[1], this.specular[2], this.alpha);
        }else
            spec = vec4.fromValues(0, 0, 0, 0);
        
        this.gl.uniform4fv(uniform_loc.specular, spec);
        
        if(this.hasOwnProperty('spec_exponent'))
            this.gl.uniform1i(uniform_loc.specular_exponent, this.spec_exponent);
        else
            this.gl.uniform1i(uniform_loc.specular_exponent, 1);
    }
}

function parseArrayToFloat(arr){
    var ret = [];

    for(var i=0; i<arr.length; i++)
        ret[i] = parseFloat(arr[i]);
    return ret;
}

function parseArrayToInt(arr){
    var ret = [];
    for(var i=0; i<arr.length; i++)
        ret[i] = parseInt(arr[i]);
    return ret;
}


class Group{
    constructor(file_data, idx, name, pos_array, texture_array, normal_array){
        this.name = name;
        this.pos_array = [];
        this.normal_array = [];
        this.texture_array = [];

        while(++idx < file_data.length && !file_data[idx].startsWith("v") && (!(this.hasOwnProperty('mtl_name')) || !file_data[idx].startsWith("usemtl"))){
            var line = file_data[idx].trim();
            var first_blank = line.indexOf(" ");
    
            if(first_blank != -1){
                var op = line.substring(0, first_blank);
                var arg = line.replace(op, "").trim();

                switch(op){
                    case "usemtl": 
                        this.mtl_name = arg;
                        break;
                    
                    case "f":
                        var face = arg.split(" ");
                        var v = [];

                        for(var i=0; i<face.length; i++)
                            v[i] = parseArrayToInt(face[i].split("/"));

                        var nr = [];
                        if(face.length == 4)
                            nr = [0, 1, 2, 0, 2, 3];
                        else if(face.length == 3)
                            nr = [0, 1, 2];

                        for(var i=0; i<nr.length; i++){
                            for(var k=0; k<3; k++)
                                this.pos_array.push(pos_array[(v[nr[i]][0]-1)*3 + k]);
                          
                            for(var k=0; k<3; k++)
                                this.texture_array.push(texture_array[(v[nr[i]][1]-1)*3 + k]);
                            
                            for(var k=0; k<3; k++)
                                this.normal_array.push(normal_array[(v[nr[i]][2]-1)*3 + k]);
                        }
                    break;
                }
            }
        }
        this.idx = idx;
    }

    initializeGl(gl){
        this.gl = gl;
        this.pos_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pos_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.pos_array), gl.STATIC_DRAW);

        this.normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normal_array), gl.STATIC_DRAW);

        this.texture_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texture_array), gl.STATIC_DRAW);
    }

    render(pos_idx, texture_idx, normal_idx){

        if(typeof pos_idx !== 'undefined'){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pos_buffer);
            this.gl.vertexAttribPointer(pos_idx, 3, this.gl.FLOAT, false, 0, 0);
        }

        if(typeof texture_idx !== 'undefined'){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texture_buffer);
            this.gl.vertexAttribPointer(texture_idx, 3, this.gl.FLOAT, false, 0, 0);
        }

        if(typeof normal_idx !== 'undefined'){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normal_buffer);
            this.gl.vertexAttribPointer(normal_idx, 3, this.gl.FLOAT, false, 0, 0);
        }

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.pos_array.length/3);
    }
}


async function loadModel(model, url){
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onreadystatechange = function(){
        if(request.readyState == 4){
            if(request.status == 200 || request.status == 0){
                model.initializeModel(request.responseText);
                model.modelRdy = true;
                model.callback_func();
            }
        }
    }
    request.send(null);
}

class Model{
    constructor(callback_func) {
        this.groups = [];
        this.materials = {};
        this.modelRdy = false;  
        this.callback_func = callback_func;
    }
    
    initializeGl(gl_context){
        if(this.modelRdy){
            for(var i=0; i<this.groups.length; i++){
                this.groups[i].initializeGl(gl_context);
            }
            Object.keys(this.materials).forEach(mtl =>{
                this.materials[mtl].initializeGl(gl_context);
            });
        }
    }

    render_all(attribute_idx, uniform_loc){
        if(this.modelRdy){
            for(var i=0; i<this.groups.length; i++){
                this.materials[this.groups[i].mtl_name].bind(uniform_loc);
                this.groups[i].render(attribute_idx.pos, attribute_idx.texture, attribute_idx.normal);
            }
        }
    }

    render_group(name, attribute_idx, uniform_loc, with_material = true){
        var found = false;
        
        if(this.modelRdy){
            for(var i=0; i<this.groups.length; i++)
                if(this.groups[i].name == name){
                    if(with_material)
                        this.materials[this.groups[i].mtl_name].bind(uniform_loc);
                    this.groups[i].render(attribute_idx.pos, attribute_idx.texture, attribute_idx.normal);
                    found = true;
                }
        }

        if(found == false){
            console.log("group [" + name + "] not found!");
            console.log("available groups: ");
            for(var i=0; i<this.groups.length; i++)
                console.log(this.groups[i].name);
        }
    }


    initializeModel(file_data){
        var data = file_data.split("\n");

        var pos_data = [];
        var normal_data = [];
        var texture_data = []; 

        var object_name = "";

        for(var i=0, len = data.length; i<len; i++){
            var line = data[i].trim();
            var first_blank = line.indexOf(" ");

            if(first_blank != -1){
                var op = line.substring(0, first_blank);
                var arg = line.replace(op, "").trim();
                
                switch(op){
                    case "mtllib":
                        var request = new XMLHttpRequest();
                        arg = base_url + "/models/" + arg.trim();
                        
                        request.open("GET", arg, false);
                        request.send(null);
                        var mtl_data = request.responseText.split("\n");

                        for(var k = 0, mtl_len = mtl_data.length; k < mtl_len; k++){
                            if(!mtl_data[k].startsWith("#")){
                                if(mtl_data[k].startsWith("newmtl")){
                                    var newmatl_name = mtl_data[k].replace("newmtl", "").trim();
                                    this.materials[newmatl_name] = new Material(mtl_data, k);
                                    k = this.materials[newmatl_name].idx - 1;
                                }
                            }
                        }            
                    break;

                    case "v":
                        parseArrayToFloat(arg.split(" ")).forEach(d => pos_data.push(d));
                    break;
                    
                    case "vn":
                        parseArrayToFloat(arg.split(" ")).forEach(d => normal_data.push(d));
                    break;
                    
                    case "vt":
                        parseArrayToFloat(arg.split(" ")).forEach(d => texture_data.push(d));
                    break;

                    case "usemtl":
                    case "o":
                    case "g": 
                        var group_name = "";
                        switch(op){
                            case "o": group_name = object_name = arg; break;
                            case "g": group_name = arg; break;
                            case "usemtl": group_name = object_name + "_" +  arg; i--; break;
                        }
                        var gr = new Group(data, i, group_name, pos_data, texture_data, normal_data);
                        this.groups.push(gr);
                        i = gr.idx -1;
                    break;    
                }
            }
        }
    }
}

export {Model, loadModel};