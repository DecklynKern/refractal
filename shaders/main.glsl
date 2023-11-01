#version 300 es
precision highp float;

#define Complex vec2
#define real x
#define imag y

//%

uniform float magnitude;
uniform float centre_x;
uniform float centre_y;

uniform float transform_param1;
uniform float transform_param2;
uniform float transform_param3;
uniform float transform_param4;
uniform float transform_param5;
uniform float transform_param6;
uniform float transform_param7;
uniform float transform_param8;

in vec2 frag_position;
out vec4 colour;

const float E = 2.7182818285;
const float PI = 3.1415926535;
const float TAU = 2.0 * PI;

const float MAX = 9999999999999.9;

const Complex ZERO = Complex(0.0, 0.0);
const Complex ONE = Complex(1.0, 0.0);
const Complex TWO = Complex(2.0, 0.0);
const Complex THREE = Complex(3.0, 0.0);
const Complex SQRT_2 = Complex(1.41421356, 0.0);
const Complex I = Complex(0.0, 1.0);

Complex reciprocal(Complex z) {
    return Complex(z.real, -z.imag) * (1.0 / dot(z, z));
}

Complex square(Complex z) {
    return Complex(z.real * z.real - z.imag * z.imag, 2.0 * z.real * z.imag);
}

Complex prod(Complex x, Complex y) {
    return Complex(
        x.real * y.real - x.imag * y.imag,
        x.real * y.imag + y.real * x.imag
    );
}

Complex prod3(Complex x, Complex y, Complex z) {
    return prod(prod(x, y), z);
}

Complex div(Complex x, Complex y) {
    return prod(x, reciprocal(y));
}

Complex conj(Complex z) {
    return Complex(z.real, -z.imag);
}

float argument(Complex z) {
    return atan(z.imag, z.real);
}

Complex square_root(Complex z) {
    
    float l = length(z);
    Complex zr = Complex(z.real + l, z.imag);
    
    return zr * sqrt(l) * inversesqrt(dot(zr, zr));
    
}

Complex exponent(Complex z) {
    return exp(z.real) * Complex(
        cos(z.imag),
        sin(z.imag)
    );
}

Complex exponent(Complex z, float d) {

    float r = pow(dot(z, z), 0.5 * d);
    float theta = argument(z) * d;

    return r * Complex(
        cos(theta),
        sin(theta)
    );
}
Complex exponent(Complex z, Complex d) {

    float z_norm_sq = dot(z, z);
    float arg = argument(z);
    float r = pow(z_norm_sq, 0.5 * d.real) * exp(-d.imag * arg);    
    float angle = dot(d, Complex(arg, 0.5 * log(z_norm_sq)));

    return r * Complex(
        cos(angle),
        sin(angle)
    );
}

Complex sine(Complex z) {
    return Complex(
        sin(z.real) * cosh(z.imag),
        cos(z.real) * sinh(z.imag)
    );
}

Complex cosine(Complex z) {
    return Complex(
        cos(z.real) * cosh(z.imag),
        -sin(z.real) * sinh(z.imag)
    );
}

/*
Conversions from: https://www.shadertoy.com/view/4syfRc
*/
vec3 rgb2xyz( vec3 c ) {
    vec3 tmp;
    tmp.x = ( c.r > 0.04045 ) ? pow( ( c.r + 0.055 ) / 1.055, 2.4 ) : c.r / 12.92;
    tmp.y = ( c.g > 0.04045 ) ? pow( ( c.g + 0.055 ) / 1.055, 2.4 ) : c.g / 12.92,
    tmp.z = ( c.b > 0.04045 ) ? pow( ( c.b + 0.055 ) / 1.055, 2.4 ) : c.b / 12.92;
    return 100.0 * tmp *
        mat3( 0.4124, 0.3576, 0.1805,
              0.2126, 0.7152, 0.0722,
              0.0193, 0.1192, 0.9505 );
}

vec3 xyz2lab( vec3 c ) {
    vec3 n = c / vec3( 95.047, 100, 108.883 );
    vec3 v;
    v.x = ( n.x > 0.008856 ) ? pow( n.x, 1.0 / 3.0 ) : ( 7.787 * n.x ) + ( 16.0 / 116.0 );
    v.y = ( n.y > 0.008856 ) ? pow( n.y, 1.0 / 3.0 ) : ( 7.787 * n.y ) + ( 16.0 / 116.0 );
    v.z = ( n.z > 0.008856 ) ? pow( n.z, 1.0 / 3.0 ) : ( 7.787 * n.z ) + ( 16.0 / 116.0 );
    return vec3(( 116.0 * v.y ) - 16.0, 500.0 * ( v.x - v.y ), 200.0 * ( v.y - v.z ));
}

vec3 rgb2lab(vec3 c) {
    vec3 lab = xyz2lab( rgb2xyz( c ) );
    return vec3( lab.x / 100.0, 0.5 + 0.5 * ( lab.y / 127.0 ), 0.5 + 0.5 * ( lab.z / 127.0 ));
}

vec3 lab2xyz( vec3 c ) {
    float fy = ( c.x + 16.0 ) / 116.0;
    float fx = c.y / 500.0 + fy;
    float fz = fy - c.z / 200.0;
    return vec3(
         95.047 * (( fx > 0.206897 ) ? fx * fx * fx : ( fx - 16.0 / 116.0 ) / 7.787),
        100.000 * (( fy > 0.206897 ) ? fy * fy * fy : ( fy - 16.0 / 116.0 ) / 7.787),
        108.883 * (( fz > 0.206897 ) ? fz * fz * fz : ( fz - 16.0 / 116.0 ) / 7.787)
    );
}

vec3 xyz2rgb( vec3 c ) {
    vec3 v =  c / 100.0 * mat3( 
        3.2406, -1.5372, -0.4986,
        -0.9689, 1.8758, 0.0415,
        0.0557, -0.2040, 1.0570
    );
    vec3 r;
    r.x = ( v.r > 0.0031308 ) ? (( 1.055 * pow( v.r, ( 1.0 / 2.4 ))) - 0.055 ) : 12.92 * v.r;
    r.y = ( v.g > 0.0031308 ) ? (( 1.055 * pow( v.g, ( 1.0 / 2.4 ))) - 0.055 ) : 12.92 * v.g;
    r.z = ( v.b > 0.0031308 ) ? (( 1.055 * pow( v.b, ( 1.0 / 2.4 ))) - 0.055 ) : 12.92 * v.b;
    return r;
}

vec3 lab2rgb(vec3 c) {
    return xyz2rgb( lab2xyz( vec3(100.0 * c.x, 2.0 * 127.0 * (c.y - 0.5), 2.0 * 127.0 * (c.z - 0.5)) ) );
}

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 getColour(float x, float y);

void main() {

    float pixel_size = 2.0 * magnitude / 1000.0;

    float x = centre_x + frag_position.x * magnitude;
    
    #ifdef FLIP_Y
        float y = -(centre_y + frag_position.y * magnitude);
    #else
        float y = centre_y + frag_position.y * magnitude;
    #endif

    vec3 colour_sum;

    for (int s = 0; s < SAMPLES; s++) {
    
        float fs = float(s);
        vec2 offset = vec2(sin(fs), cos(fs)) * 0.5 + 0.5;
        
        vec2 pos = vec2(x, y) + offset * pixel_size;
        
        #if TRANSFORMATION == 1
            pos = reciprocal(pos) - vec2(transform_param1, transform_param2);
            
        #elif TRANSFORMATION == 2
            pos = div(
                prod(pos, vec2(transform_param1, transform_param2))
                + vec2(transform_param3, transform_param4),
                prod(pos, vec2(transform_param5, transform_param6))
                + vec2(transform_param7, transform_param8));
                    
        #elif TRANSFORMATION == 3
            pos = prod(
                exponent(pos),
                vec2(transform_param1, transform_param2)
                + vec2(transform_param3, transform_param4));

        #elif TRANSFORMATION == 4
            pos = pos.x * Complex(cos(pos.y), sin(pos.y));
        #endif

        vec3 pixel_sample = getColour(pos.x, pos.y);

        #if MULTISAMPLING_ALGORITHM == 1
            pixel_sample *= pixel_sample;

        #elif MULTISAMPLING_ALGORITHM == 2
            pixel_sample = rgb2xyz(pixel_sample);

        #elif MULTISAMPLING_ALGORITHM == 3
            pixel_sample = rgb2lab(pixel_sample);

        #elif MULTISAMPLING_ALGORITHM == 4
            pixel_sample = rgb2hsv(pixel_sample);
        #endif

        colour_sum += pixel_sample;

    }

    colour_sum *= 1.0 / float(SAMPLES);
    vec3 final_colour;

    #if MULTISAMPLING_ALGORITHM == 0
        final_colour = colour_sum;

    #elif MULTISAMPLING_ALGORITHM == 1
        final_colour = sqrt(colour_sum);

    #elif MULTISAMPLING_ALGORITHM == 2
        final_colour = xyz2rgb(colour_sum);

    #elif MULTISAMPLING_ALGORITHM == 3
        final_colour = lab2rgb(colour_sum);

    #elif MULTISAMPLING_ALGORITHM == 4
        final_colour = hsv2rgb(colour_sum);
    #endif

    colour = vec4(final_colour, 1.0);
    
}
