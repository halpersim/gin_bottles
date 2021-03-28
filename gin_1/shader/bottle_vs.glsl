attribute vec3 pos;
attribute vec3 normal;
//attribute vec3 tex_in;

uniform mat4 mw;
uniform mat4 vp;
uniform vec3 inside;
uniform vec3 eye;

varying mediump vec3 dir;
varying mediump vec3 w_normal;
varying mediump vec3 view;
varying mediump vec3 light;


void main(){
    vec3 world = (mw * vec4(pos, 1)).xyz;    

    dir = world - inside;
    w_normal = mat3(mw) * normal;
    view = world - vec3(eye.x, eye.y, eye.z);
    light = vec3(10, world.y, 0) - world;

    gl_Position = vp * vec4(world, 1);
}