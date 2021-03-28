varying mediump vec3 dir;
varying mediump vec3 w_normal;
varying mediump vec3 view;
varying mediump vec3 light;

uniform samplerCube cubeTex;
uniform sampler2D innerTex;
uniform mediump mat4 mw_inverse;
uniform mediump vec3 texture_size;

mediump float fresnel (mediump float VdotN, mediump float eta){
    mediump float sqr_eta = eta * eta; // squared refractive index 
    mediump float etaCos = eta * VdotN; // η · cos (Θ) 
    mediump float sqr_etaCos = etaCos * etaCos; // squared 
    mediump float one_minSqrEta = 1.0 - sqr_eta; // 1 - η 2
    mediump float value = etaCos - sqrt (one_minSqrEta + sqr_etaCos);
    value *= value / one_minSqrEta; // square and divide by 1 - η 2
    return min (1.0, value * value); // final squaring
} 


void main(){
    mediump vec3 V = normalize(view);
    mediump vec3 N = normalize(w_normal);
    mediump vec3 L = normalize(light);

    mediump vec3 R = normalize(reflect(-L, N));
    
    mediump float spec = pow(max(dot(R, V), 0.0), float(800));

    mediump vec3 Rl = (mw_inverse * vec4(reflect(-V, N), 1)).xyz;
    mediump vec3 Rr = (mw_inverse * vec4(refract(-V, N, 0.7), 1)).xyz;

    mediump float fres = fresnel(dot(-V.xyz, N.xyz), 0.7);

    mediump vec3 reflection = mix(textureCube(cubeTex, Rr), textureCube(cubeTex, Rl), fres).xyz;
    mediump vec3 glass_color = mix(reflection, vec3(0.8, 0.9, 1), 0.2);
    mediump vec3 liquid_color = vec3(0.45, 0.60, 0.78);

    if(length(texture2D(innerTex, gl_FragCoord.xy/texture_size.xy).xyz) > 0.1){
        mediump vec3 n = normalize(texture2D(innerTex, gl_FragCoord.xy/texture_size.xy).xyz - vec3(0.5));
        
        gl_FragColor = vec4(mix(glass_color, liquid_color, min(max(pow(dot(n, N), 50.0), 0.35), 0.75)), 1);
      //  gl_FragColor = vec4(mix(vec3(0), vec3(1), dot(N, n)*0.5 + 0.5), 1);
       // gl_FragColor = texture2D(innerTex, gl_FragCoord.xy/texture_size.xy);

    }else{
        gl_FragColor = vec4(mix(mix(glass_color, vec3(0.2), 0.6), glass_color, pow(-dot(V, N), 0.5)), 1);
      //  gl_FragColor = vec4(w_normal*0.5 + 0.5, 1);
    }

    gl_FragColor = mix(gl_FragColor, vec4(1), spec * 0.8);
    
}