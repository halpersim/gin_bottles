 attribute vec3 pos;
attribute vec3 tex_in;
attribute vec3 normal;

uniform mat4 mw;
uniform mat4 vp;

varying mediump vec3 v_normal;
varying mediump vec3 light;
varying mediump vec3 view;
varying mediump vec3 tex_out;

void main(){
    vec3 world = (mw * vec4(pos, 1)).xyz;
    
    v_normal = (mw * vec4(normal, 1)).xyz;
    view = vec3(0, 0, -300) - world;
    light = world - vec3(-10, 15, -150);

    tex_out = tex_in;

    gl_Position = vp * vec4(world, 1);
}