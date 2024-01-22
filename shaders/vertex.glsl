#version 300 es
precision highp float;

in vec2 position;
out vec2 frag_position;

void main() {
    gl_Position = vec4(position.x, -position.y, 0, 1);
    frag_position = position;
}