const vertexShader = `
attribute float size;
attribute vec3 color;
attribute float fade;

varying vec3 vColor;

void main() {
   vColor = color;
   vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
   gl_PointSize = size;
   gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform sampler2D pointTexture;
varying vec3 vColor;
void main() {
   gl_FragColor = vec4(vColor, 1.0);
   gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
}
`;

export { vertexShader, fragmentShader}