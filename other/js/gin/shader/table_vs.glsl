uniform mat4 mw;
uniform mat4 vp;

attribute vec4 pos;

varying mediump vec3 v_normal;
varying mediump vec3 light;
varying mediump vec3 view;
varying mediump vec3 tex_out;

void main(){
    vec3 normal = vec3(0, 1, 0);

    vec3 world = (mw * pos).xyz;
    
    v_normal = vec3(0, 1, 0);
    view = vec3(0, 15, -18) - world;
    light = world - vec3(30, 15, 0);

    tex_out = vec3(pos.x, pos.z, 0) * 0.5 + 0.5;

    gl_Position = vp * vec4(world, 1);
}