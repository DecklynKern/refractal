uniform int fractal_type;
uniform int iterations;

vec3 getColour(float x, float y) {

    float minDist = 1.0;
    Complex pos = Complex(x, y);

    Complex exponentials[DEGREE];
    Complex exponential = ONE;

    for (int i = 0; i < DEGREE; i++) {
        exponentials[i] = exponential;
        exponential = prod(exponential, pos);
    }

    for (int i = 0; i < int(pow(2.0, float(DEGREE))); i++) {

        int bits = i;

        Complex func = Complex(0.0, 0.0);

        for (int b = 0; b < DEGREE; b++) {
            func += (bits % 2 == 0) ? -exponentials[b] : exponentials[b];
            bits = bits >> 1;
        }

        minDist = min(minDist, length(func) * 25.0);

    }

    return vec3(1.0 - minDist, 1.0 - minDist, 1.0 - minDist * minDist);

}