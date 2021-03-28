attribute vec4 pos;

uniform mat4 mw;
uniform mat4 vp;
uniform vec3 eye;
uniform vec3 cn;

varying mediump vec3 n;
varying mediump vec3 v;
varying mediump vec3 e;
varying mediump vec2 p;
varying mediump vec3 w;

void main(){
    n = mat3(mw) * vec3(0, 1, 0);
    vec3 world = (mw * pos).xyz;
    v = eye - world;
    e = cn;

    w = world;

    p = vec2(pos.x, pos.z) * 0.5 + 0.5;

    gl_Position = vp * mw * pos;
}