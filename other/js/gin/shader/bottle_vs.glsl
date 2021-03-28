attribute vec3 pos;
attribute vec3 normal;

uniform mat4 mw;
uniform mat4 vp;
uniform vec3 light;
uniform vec3 eye;

varying mediump vec3 n;
varying mediump vec3 l;
varying mediump vec3 v;
varying mediump vec3 w;

void main(){
    
    n = mat3(mw) * normal;
    
    mediump vec3 world = (mw * vec4(pos, 1)).xyz;
    l = light - world;
    v = eye - world;
    w = world;

    gl_Position = vp * mw * vec4(pos, 1);
}
