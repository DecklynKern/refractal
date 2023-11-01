uniform float fractal_param;

uniform float initial_value;
uniform float c;

uniform vec3 stable_colour;
uniform vec3 chaotic_colour;
uniform vec3 infinity_colour;

void doIteration(in float r, inout float x, inout float lambda) {

    #if FRACTAL_TYPE == 0 // logistic map
        x = r * x * (1.0 - x);
        lambda += log(abs(r * (2.0 * x - 1.0)));

    #elif FRACTAL_TYPE == 1 // gauss map
        x = exp(fractal_param * x * x) + r;
        float xa = x * fractal_param;
        lambda += log(abs(2.0 * xa * exp(x * xa)));

    #elif FRACTAL_TYPE == 2 // circle map
        x += fractal_param + 0.000001 - r / TAU * sin(TAU * x);
        lambda += log(abs(r * cos(TAU * x) - 1.0));

    #elif FRACTAL_TYPE == 3 // quadratic
        x = r - fractal_param * x * x;
        lambda += log(abs(2.0 * fractal_param * x));

    #elif FRACTAL_TYPE == 4 // square logistic
        x = r * x * (1.0 - x * x);
        lambda += log(abs(3.0 * x * x - 1.0));

    #elif FRACTAL_TYPE == 5 // squared sine logistic
        float s = sin(TAU * x);
        x = r * x * (1.0 - x) + fractal_param * s * s;
        lambda += log(abs(r * (1.0 - 2.0 * x) + fractal_param * TAU * sin(2.0 * TAU * x)));

    #elif FRACTAL_TYPE == 6
        x = r * sin(x + fractal_param);
        lambda += log(abs(r * cos(x)));

    #elif FRACTAL_TYPE == 7
        x = r * cos(x + fractal_param);
        lambda += log(abs(r * sin(x)));

    #elif FRACTAL_TYPE == 8
        x = r * (fractal_param - cosh(x));
        lambda += log(abs(r * sinh(x)));
    #endif

}

vec3 getColour(float a, float b) {

    float x = initial_value;
    float lambda = 0.0;
    float r;

    for (int group = 0; group < ITERATIONS / SEQUENCE_LENGTH; group++) {
        //+
    }

    lambda /= float(ITERATIONS) * 3.0;

    if (lambda < 0.0) {
        return mix(stable_colour, infinity_colour, min(sqrt(-lambda), 1.0));
    }
    else {
        float amount = sqrt(lambda);
        return chaotic_colour * (1.0 - amount) + infinity_colour * amount;

        // return mix(chaotic_colour, infinity_colour, sqrt(lambda));
        // fsr this doesn't work right
    }
}