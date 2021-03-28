attribute vec3 pos;
attribute vec2 texture;
attribute vec3 normal;

uniform mat4 mw;
uniform mat4 vp;
uniform vec3 light;
uniform vec3 eye;

varying mediump vec2 tc;
varying mediump vec3 n;
varying mediump vec3 v;
varying mediump vec3 l;

void main(){
    tc = vec2(texture.x, 1.0-texture.y);

    n = mat3(mw) * normal;
    vec3 world = (mw * vec4(pos, 1)).xyz;
    v = eye - world;
    l = light - world;

    gl_Position = vp * vec4(world, 1);
}