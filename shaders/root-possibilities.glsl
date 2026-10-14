uniform int fractal_type;
uniform int iterations;

vec3 getColour(float x, float y) {

    x = abs(x);

    float minDist = 1.0;
    Complex pos = Complex(x, y);

    Complex exponentials[DEGREE];
    Complex exponential = ONE;

    for (int i = 0; i < DEGREE; i++) {
        exponentials[i] = exponential;
        exponential = prod(exponential, pos);
    }

    for (int i = 0; i < int(pow(2.0, float(DEGREE - 2))); i++) {

        int bits = i;

        Complex func = Complex(0.0, 0.0);

        int oddBitSum = 0;

        for (int b = 0; b < DEGREE - 2; b++) {

            if (b % 2 == 0) {
                oddBitSum += bits % 2;
            }

            func += (bits % 2 == 0) ? -exponentials[b] : exponentials[b];
            bits = bits >> 1;
        }

        func += (oddBitSum % 2 == 1) ? -exponentials[DEGREE - 2] : exponentials[DEGREE - 2];
        func += exponentials[DEGREE - 1];

        minDist = min(minDist, length(func) * 25.0);

    }

    return vec3(1.0 - minDist, 1.0 - minDist, 1.0 - minDist * minDist);

}