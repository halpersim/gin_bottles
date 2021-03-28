
uniform sampler2D tex;
uniform mediump vec4 diffuse;
uniform mediump vec4 specular;
uniform mediump int spec_exp;

varying mediump vec2 tc;
varying mediump vec3 n;
varying mediump vec3 v;
varying mediump vec3 l;

void main(){
    mediump vec3 N = normalize(n);
    mediump vec3 L = normalize(l);
    mediump vec3 V = normalize(v);

    mediump vec3 R = normalize(reflect(-L, N));

    mediump float diff = max(0.0, dot(L, N));
    //mediump float spec = pow(max(0.0, dot(V, R)), float(100));
    mediump float spec = pow(
        max(0.0, dot(normalize(vec2(V.x, V.z)), normalize(vec2(R.x, R.z))))*0.99 + 0.01*max(0.0, dot(V, R)), 
        float(400));
    
    mediump vec4 tx = texture2D(tex, tc);

    if(abs(tx.r - tx.g) > 0.1){
        gl_FragColor = vec4(vec3(0.98, 0.667, 0.3)/2.0*(1.0+diff) + vec3(1) * spec, 1);
        //gl_FragColor = tx/2.0*(1.5 + diff) + vec4(vec3(spec), 0.0);
        //gl_FragColor = vec4(vec3(spec), 1);
    }else{
        gl_FragColor = vec4(vec3(0.05) + diff*vec3(0.15), 1);
    }

   // gl_FragColor = tx;

}
