uniform sampler2D textureSampler;

uniform bool blur;

varying mediump vec3 v_normal;
varying mediump vec3 light;
varying mediump vec3 view;
varying mediump vec3 tex_out;

void main(){
    mediump vec3 N = normalize(v_normal);
    mediump vec3 L = normalize(light);
    mediump vec3 V = normalize(view);   

    mediump vec3 R = normalize(reflect(-L, N));

    mediump float diff = max(dot(-N, L), 0.0);  
    mediump float spec = pow(max(dot(R, V), 0.0), float(10));

    mediump vec4 tex;
    if(blur){
        mediump float delta = 0.3;
        tex = texture2D(textureSampler, tex_out.xy + vec2(delta, delta));
        tex += texture2D(textureSampler, tex_out.xy + vec2(delta, -delta));
        tex += texture2D(textureSampler, tex_out.xy + vec2(-delta, delta));
        tex += texture2D(textureSampler, tex_out.xy + vec2(-delta, -delta));
        tex *= 0.25;
    }else{
        tex = texture2D(textureSampler, tex_out.xy); 
    }

    //mediump vec4 tex = vec4(0.8, 0.6, 0.2, 1);
    gl_FragColor = tex * (0.5 + diff) + vec4(1) * spec; 
}