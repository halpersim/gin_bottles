
uniform mediump vec4 diffuse;
uniform mediump vec4 specular;
uniform mediump int spec_exp;

varying mediump vec3 n;
varying mediump vec3 l;
varying mediump vec3 v;
varying mediump vec3 w;


void main(){
    mediump vec3 N = normalize(n);
    mediump vec3 L = normalize(l);
    mediump vec3 V = normalize(v);

    mediump vec3 R = normalize(reflect(-L, N));

    mediump float diff = max(0.0, dot(L, N));
    mediump float spec = pow(
        //max(0.0, dot(normalize(vec2(V.x, V.z)), normalize(vec2(R.x, R.z))))*0.6 + 0.4*max(0.0, dot(V, R)), 
        max(0.0, dot(V,R)),
        float(spec_exp));
    
    gl_FragColor = vec4(0.03 + diff * diffuse.xyz + spec * specular.xyz, 1);
}