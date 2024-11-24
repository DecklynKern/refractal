#if ALGORITHM == 10 || ALGORITHM == 11 || ALGORITHM == 12 || ALGORITHM == 13 || ALGORITHM == 14 || ALGORITHM == 15 || ALGORITHM == 16 || ALGORITHM == 17 || ALGORITHM == 18 || ALGORITHM == 20 || ALGORITHM == 21
    #define CALC_NEWTON
#endif

#if ALGORITHM == 22 || ALGORITHM == 23
    #define CALC_MODIFIED_NEWTON
#endif

#if ALGORITHM == 5
    #define CALC_DER3
#endif

#if defined CALC_DER3 || ALGORITHM == 1 || ALGORITHM == 2 || ALGORITHM == 6 || ALGORITHM == 7 || ALGORITHM == 8 || ALGORITHM == 9 || ALGORITHM == 18
    #define CALC_DER2
#endif

#if defined CALC_DER2 || defined CALC_NEWTON || defined CALC_MODIFIED_NEWTON || ALGORITHM == 0 || ALGORITHM == 19
    #define CALC_DER
#endif

uniform float threshold;

uniform Complex root1;
uniform Complex root2;
uniform Complex root3;

uniform float fractal_param1;
uniform float fractal_param2;

uniform Complex a;
uniform Complex c;

uniform float colouring_param;

uniform vec3 root1_colour;
uniform vec3 root2_colour;
uniform vec3 root3_colour;
uniform vec3 base_colour;

float root_dist_sq(Complex z, Complex root) {
    Complex diff = z - root;
    return dot(diff, diff);
}

struct CalcParams {
    
    Complex z;

    #if FUNCTION == 0
        
        Complex d;
        Complex e;
        Complex f;

    #elif FUNCTION == 2

        Complex p;

        #ifdef CALC_DER
            Complex p2;
        #endif

        #ifdef CALC_DER2
            Complex pp2;
            Complex p3;
        #endif

        #ifdef CALC_DER3
            Complex pp2p3;
            Complex p4;
        #endif
    #endif
};

struct CalcResult {

    Complex func;

    #ifdef CALC_DER
        Complex der;
    #endif

    #ifdef CALC_DER2
        Complex der2;
    #endif

    #ifdef CALC_DER3
        Complex der3;
    #endif

    #if ALGORITHM == 3
        Complex func_step;
    #endif
};

CalcResult doCalc(CalcParams params) {

    CalcResult result;

    #if FUNCTION == 0
    
        Complex z2 = square(params.z);
        result.func = 
            prod(params.z + params.d, z2) +
            prod(params.e, params.z) +
            params.f;

        #ifdef CALC_DER
            Complex dd = 2.0 * params.d;
            result.der = 3.0 * z2 + prod(dd, params.z) + params.e;
        #endif

        #ifdef CALC_DER2
            result.der2 = 6.0 * params.z + dd;
        #endif

        #ifdef CALC_DER3
            result.der3 = Complex(6.0, 0.0);
        #endif

        #if ALGORITHM == 3
            Complex func_z = result.func + params.z;
            result.func_step =
                prod(func_z + params.d, square(func_z)) +
                prod(params.e, func_z) +
                params.f;
        #endif

    #elif FUNCTION == 1

        float cos_a = cos(params.z.real);
        float sin_a = sin(params.z.real);
        float cosh_b = cosh(params.z.imag);
        float sinh_b = sinh(params.z.imag);

        result.func = Complex(
            sin_a * cosh_b,
            cos_a * sinh_b
        );

        #ifdef CALC_DER

            result.der = Complex(
                cos_a * cosh_b,
                sin_a * sinh_b
            );

        #endif

        #ifdef CALC_DER2
            result.der2 = -result.func;
        #endif

        #ifdef CALC_DER3
            result.der3 = -result.der;
        #endif

        #if ALGORITHM == 3
            result.func_step = sine(result.func + params.z);
        #endif

    #elif FUNCTION == 2

        result.func = exponent(params.z, params.p) - ONE;

        #ifdef CALC_DER
            result.der = prod(params.p, exponent(params.z, params.p2));
        #endif

        #ifdef CALC_DER2
            result.der2 = prod(params.pp2, exponent(params.z, params.p3));
        #endif

        #ifdef CALC_DER3
            result.der3 = prod(params.pp2p3, exponent(params.z, params.p4));
        #endif

        #if ALGORITHM == 3
            result.func_step = exponent(result.func + params.z, params.p) - ONE;
        #endif
    #endif

    return result;

}

vec3 getColour(float real, float imag) {

    CalcParams params;

    params.z = Complex(real, imag);
    Complex z_prev;

    Complex root3_ = root3;

    #if FUNCTION == 0

        #if FRACTAL_TYPE == 3
            root3_ = params.z;
            params.z = (root1 + root2 + root3_) * (1.0 / 3.0);
        #endif

        Complex r1r2 = prod(root1, root2);
        
        params.d = -(root1 + root2 + root3_);
        params.e = r1r2 + prod(root1, root3_) + prod(root2, root3_);
        params.f = -prod(r1r2, root3_);

    #elif FUNCTION == 2

        params.p = root1;

        #ifdef CALC_DER
            params.p2 = root1 - ONE;
        #endif

        #ifdef CALC_DER2
            params.pp2 = prod(params.p, params.p2);
            params.p3 = root1 - TWO;
        #endif

        #ifdef CALC_DER3
            params.pp2p3 = prod(params.pp2, params.p3);
            params.p4 = root1 - THREE;
        #endif
    #endif

    int iters = MAX_ITERATIONS;

    #if FRACTAL_TYPE == 1

        Complex c = params.z;
        params.z = ZERO;

        z_prev = Complex(MAX, 0.0);

    #elif FRACTAL_TYPE == 2
        z_prev = Complex(MAX, 0.0);

    #endif

    Complex diff;

    #if ALGORITHM == 4

        Complex func_prev;

        #if START_POINT == 0
            z_prev = ZERO;

        #elif START_POINT == 1
            z_prev = Complex(params.z.imag, params.z.real);

        #elif START_POINT == 2
            z_prev = 2.0 * params.z;

        #elif START_POINT == 3
            z_prev = conj(params.z);

        #elif START_POINT == 4
            z_prev = square(params.z);
        #endif

        #if FUNCTION == 0

            func_prev = 
                prod(z_prev + params.d, square(z_prev)) +
                prod(params.e, z_prev) +
                params.f;

        #elif FUNCTION == 1
            z_prev = Complex(
                sin(z_prev.real) * cosh(z_prev.imag),
                cos(z_prev.real) * sinh(z_prev.imag)
            );
        #endif
    #endif

    #if COLOURING_TYPE == 3
        float max_norm_sq = 0.0;

    #elif COLOURING_TYPE == 4
        vec3 min_root_dists_sq = vec3(MAX, MAX, MAX);
    #endif

    for (int iteration = 0; iteration < MAX_ITERATIONS; iteration++) {

        CalcResult result = doCalc(params);

        #if COLOURING_TYPE == 3
            max_norm_sq = max(max_norm_sq, dot(params.z, params.z));

        #elif COLOURING_TYPE == 4
        
            Complex offset1 = params.z - root1;
            Complex offset2 = params.z - root2;
            Complex offset3 = params.z - root3_;
            
            min_root_dists_sq = min(
                min_root_dists_sq,
                vec3(
                    dot(offset1, offset1),
                    dot(offset2, offset2),
                    dot(offset3, offset3)
                )
            );

        #endif

        #if FRACTAL_TYPE == 0 || FRACTAL_TYPE == 3 // normal
        
            if (dot(result.func, result.func) <= threshold) {
                iters = iteration;
                break;
            }

        #elif FRACTAL_TYPE == 1 || FRACTAL_TYPE == 2 // nova

            Complex dz = params.z - z_prev;
            
            if (dot(dz, dz) <= threshold) {
                iters = iteration;
                break;
            }

        #endif

        #if ALGORITHM != 4
            z_prev = params.z;
        #endif

        #ifdef CALC_NEWTON

            Complex func_over_der = div(result.func, result.der);

            CalcParams newtonParams = params;
            newtonParams.z = params.z - func_over_der;

            CalcResult newton = doCalc(newtonParams);

        #elif defined CALC_MODIFIED_NEWTON

            Complex func_over_der = div(result.func, result.der);

            CalcParams newtonParams = params;
            newtonParams.z = params.z - 2.0 / 3.0 * func_over_der;

            CalcResult newton = doCalc(newtonParams);

        #endif

        #if ALGORITHM == 0 // newton
            diff = div(result.func, result.der);

        #elif ALGORITHM == 1 // halley
            diff = div(
                prod(result.func, result.der),
                square(result.der) - 0.5 * prod(result.func, result.der2));

        #elif ALGORITHM == 2 // schroeder
            diff = div(
                prod(result.func, result.der),
                square(result.der) - prod(result.func, result.der2));

        #elif ALGORITHM == 3 // steffensen
            diff = div(square(result.func), result.func_step - result.func);

        #elif ALGORITHM == 4 // secant

            Complex z_temp = params.z;

            diff = prod(
                result.func,
                div(
                    params.z - z_prev,
                    result.func - func_prev));

            func_prev = result.func;
            z_prev = z_temp;

        #elif ALGORITHM == 5

            Complex funcder = prod(result.func, result.der);
            Complex func_sq = square(result.func);
            
            diff = div(
                sub(
                    prod(funcder, result.der),
                    0.5 * prod(func_sq, result.der2)),
                add(
                    cube(result.der),
                    sub(
                        (1.0 / 6.0) * prod(func_sq, result.der3),
                        prod(funcder, result.der2))));

        #elif ALGORITHM == 6

            Complex func_der2 = prod(result.func, result.der2);

            diff =
                div(result.func, result.der) + 
                div(
                    prod(
                        result.func,
                        func_der2),
                    prod(
                        2.0 * result.der,
                        square(result.der) - func_der2));

        #elif ALGORITHM == 7

            Complex L = TWO -
                div(
                    prod(result.der2, result.func),
                    square(result.der));

            diff = prod(
                div(result.func, 2.0 * result.der),
                L);

        #elif ALGORITHM == 8

            Complex L = TWO -
                div(
                    prod(result.der2, result.func),
                    square(result.der));

            Complex TWO_MINUS_L = TWO - L;

            diff = prod(
                div(result.func, 4.0 * result.der),
                add(
                    TWO_MINUS_L,
                    div(
                        Complex(4.0, 0.0) + 2.0 * L,
                        TWO - prod(L, TWO_MINUS_L))));

        #elif ALGORITHM == 9

            Complex m = Complex(1.0, 0.0); // parameterize

            diff = add(
                prod(
                    0.5 * prod(
                        m,
                        THREE - m),
                    div(result.func, result.der)),
                prod(
                    0.5 * square(m),
                    div(
                        prod(
                            square(result.func),
                            result.der2),
                        cube(result.der))));

        #elif ALGORITHM == 10
            diff = prod(
                func_over_der,
                div(
                    result.func - newton.func,
                    result.func - 2.0 * newton.func));

        #elif ALGORITHM == 11

            Complex beta = Complex(2.0, 0.0); // parameterize

            diff = add(
                params.z - newtonParams.z,
                div(
                    prod(
                        newton.func,
                        add(
                            result.func,
                            prod(beta, newton.func))),
                    prod(
                        result.der,
                        add(
                            result.func,
                            prod(beta - TWO, newton.func)))));

        #elif ALGORITHM == 12
            diff = add(
                func_over_der,
                div(
                    2.0 * newton.func,
                    result.der + newton.der));

        #elif ALGORITHM == 13
            diff = add(
                func_over_der,
                div(
                    prod(result.func, newton.func),
                    prod(result.func - newton.func, result.der)));

        #elif ALGORITHM == 14
            diff = add(
                params.z - newtonParams.z,
                div(
                    newton.func,
                    2.0 * result.der - newton.der));

        #elif ALGORITHM == 15
            diff = div(
                prod(result.func, result.der + newton.der),
                square(result.der) + square(newton.der));

        #elif ALGORITHM == 16
            diff = div(
                prod(
                    3.0 * result.der - newton.der,
                    result.func),
                prod(
                    result.der + newton.der,
                    result.der)
            );

        #elif ALGORITHM == 17
            diff = add(
                params.z - newtonParams.z,
                prod(
                    div(newton.func, result.der),
                    square(
                        ONE - div(newton.func, result.func))));

        #elif ALGORITHM == 18
            diff = add(
                func_over_der,
                0.5 * div(
                    prod(
                        square(result.func),
                        newton.der2
                    ),
                    sub(
                        cube(result.der),
                        prod3(
                            result.func,
                            result.der,
                            result.der2))));

        #elif ALGORITHM == 19
            diff = div(
                add(
                    prod(square(result.func), result.der),
                    prod(2.0 * result.func, square(result.der))),
                2.0 * cube(result.der));

        #elif ALGORITHM == 20
            diff = div(
                prod(
                    result.func,
                    sub(
                        3.0 * square(result.der) + TWO,
                        prod(result.der, newton.der))),
                add3(
                    result.der,
                    2.0 * cube(result.der),
                    newton.der));

        #elif ALGORITHM == 21
            diff = prod(
                0.5 * sub(
                    THREE,
                    div(newton.der, result.der)),
                func_over_der);

        #elif ALGORITHM == 22

            Complex der_divs = div(result.der, newton.der); 

            diff = prod(
                add(
                    Complex(-0.5, 0.0),
                    0.375 * add(
                        3.0 * der_divs,
                        reciprocal(der_divs))),
                func_over_der);

        #elif ALGORITHM == 23
            diff = div(
                -16.0 * prod(result.func, result.der),
                add(
                    sub(
                        5.0 * square(result.der),
                        30.0 * prod(result.der, newton.der)),
                    9.0 * square(newton.der)));

        #endif

        params.z -= prod(a, diff);

        #if FRACTAL_TYPE == 1 || FRACTAL_TYPE == 2
            params.z += c;
        #endif
    }

    #if COLOURING_TYPE == 2
        return mixColour(root1_colour, base_colour, float(iters) / float(MAX_ITERATIONS));

    #elif COLOURING_TYPE == 4
        return
            mat3(root1_colour, root2_colour, root3_colour) *
            (1.0 - min(vec3(1.0, 1.0, 1.0), log(min_root_dists_sq / colouring_param + 1.0)));
            
    #elif COLOURING_TYPE == 5

        if (iters == MAX_ITERATIONS) {
            return base_colour;
        }
    
        // fix 
        float thresh = 2.0 * (threshold + 0.000000000000001);
        return vec3((thresh * round(params.z.xy / thresh)), 1.0);

    #else

        float root_dist_1 = root_dist_sq(params.z, root1);
        float root_dist_2 = root_dist_sq(params.z, root2);
        float root_dist_3 = root_dist_sq(params.z, root3_);

        float amount;

        #if COLOURING_TYPE == 0
            amount = 0.0;

        #elif COLOURING_TYPE == 1
            amount = float(iters) / float(MAX_ITERATIONS);

        #else
            amount = fract(max_norm_sq / colouring_param);
        #endif

        if (iters == MAX_ITERATIONS) {
            return base_colour;
        }

        if (root_dist_1 < root_dist_2 && root_dist_1 < root_dist_3) {
            return mixColour(root1_colour, base_colour, amount);
        }
        else if (root_dist_2 < root_dist_3) {
            return mixColour(root2_colour, base_colour, amount);
        }
        else {
            return mixColour(root3_colour, base_colour, amount);
        }

    #endif
}