varying vec2 vCoordinates;
varying vec3 vPos;

uniform sampler2D penguin;
uniform sampler2D mask;
uniform sampler2D crewmate;
uniform float move;

void main(){
    vec4 maskTexture=texture2D(mask,gl_PointCoord);
    vec2 myUV=vec2(vCoordinates.x/512.,vCoordinates.y/512.);

    vec4 image1 = texture2D(penguin, myUV);
    vec4 image2=texture2D(crewmate, myUV);
    vec4 finalImage = mix(image1, image2, smoothstep(0., 1., fract(move)));

    float alpha = 1. - clamp(0., 1., abs(vPos.z/1100.));
    gl_FragColor = finalImage;
    gl_FragColor.a *= maskTexture.r *alpha ;
    
}