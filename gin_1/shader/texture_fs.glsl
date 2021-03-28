uniform sampler2D textureSampler;
        
uniform mediump vec4 ambient;
uniform mediump vec4 diffuse;
uniform mediump vec4 specular;
uniform int specular_exponent;

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
    mediump float spec = pow(max(dot(R, V), 0.0), float(specular_exponent));

    gl_FragColor = vec4(vec3(texture2D(textureSampler, tex_out.xy) * diffuse) * 1.4, 1);
}