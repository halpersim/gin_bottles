uniform sampler2D tex;
uniform mediump float fov;
uniform mediump float aspect;

varying mediump vec3 n;
varying mediump vec3 v;
varying mediump vec3 e;
varying mediump vec2 p;
varying mediump vec3 w;

mediump float cot(mediump float f){
    return cos(f)/sin(f);
}

mediump float inverse_distance(mediump vec2 p, mediump float rad){
  return 1.0 - max(0.0, min(1.0, rad * length(p-0.5)));
}

void main(){    
    mediump vec3 N = normalize(n);
    mediump vec3 V = normalize(v);
    mediump vec3 E = normalize(e);

    mediump float t = tan(fov/2.0);

    mediump float theta = sign(V.x*E.z - V.z*E.x) * asin(normalize(vec2(V.x, V.z)).y);
    mediump float tc_u = (t - cot(theta))/ (2.0 * t);   

    mediump float phi = acos(dot(normalize(vec2(V.y, V.z)), normalize(vec2(N.y, N.z))));
    mediump float beta = 1.570796 - acos(dot(normalize(vec2(V.y, V.z)), normalize(vec2(E.y, E.z))));
    mediump float tc_v = (t + cot(2.0*phi + beta))/(2.0*t);
        
    tc_u = 0.5 - (0.72/aspect) * (0.5 - tc_u);
    tc_v = tc_v;
    mediump vec2 tc = vec2(tc_u, tc_v);
   
  //------------final lightning
  
    mediump vec4 tex_color = texture2D(tex, tc);
    //mediump vec4 tex_color = texture2D(tex, vec2(, tc_v));
    mediump vec3 color = vec3(0.09);
    mediump float noise_factor;
    
    noise_factor = pow(inverse_distance(p, 6.0)+0.1, 2.5);  //sovü rauschen kum eini 

    if(noise_factor < 0.01001 && tex_color.w < 0.001)
      discard;

    color = vec3(0.095 + noise_factor);
    if(tex_color.w > 0.001){
      color = mix(color, tex_color.xyz, 2.0 * pow(inverse_distance(p, 4.0), 4.0)); //so stoark siarch ma die reflektion
    }
    gl_FragColor = vec4(color, 1);
  
    

    /*
    mediump float strich = 0.5;
    if(tc_u > strich - 0.003 && tc_u < strich + 0.003)
      gl_FragColor = vec4(1, 0, 0, 1);*/
}