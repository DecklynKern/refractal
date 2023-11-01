#define MANDELBROT                  0
#define BURNING_SHIP                1
#define TRICORN                     2
#define HEART                       3
#define MANDELBOX                   4
#define MULTIBROT                   5
#define FEATHER                     6
#define CHIRIKOV                    7
#define SMELLY_SHOE                 8
#define DOG_SKULL                   9
#define EXPONENT2                   10
#define DUFFING                     11
#define GINGERBREAD                 12
#define HENON                       13
#define SINE                        14
#define RATIONAL_MAP                15
#define PHOENIX                     16
#define SIMONBROT                   17
#define TIPPETTS                    18
#define MAREK_DRAGON                19
#define GANGOPADHYAY                20
#define EXPONENT                    21
#define SFX                         22
#define COMPLEX_MULTIBROT           23
#define THORN                       24
#define META_MANDELBROT             25
#define OTHER_BUFFALO               26
#define MAGNET                      27
#define TRIPLE_DRAGON               28
#define SPIRAL                      29
#define MANDELBRUH                  30
#define HYPERBOLIC_SINE             31
#define ZUBIETA                     32
#define CUBIC                       33
#define LOGISTIC                    34
#define TRICORN_SINE                35
#define TWIN_MANDELBROT             36
#define FRACKTAIL                   37
#define SAURON                      38
#define PERPENDICULAR_BURNING_SHIP  39
#define MULTI_BURNING_SHIP          40
#define MANDELBROT_FOAM             41
#define COLLATZ1                    42
#define COLLATZ2                    43
#define PERPENDICULAR_MANDELBROT    44
#define CELTIC_MANDELBROT           45
#define CELTIC_MANDELBAR            46
#define PERPENDICULAR_CELTIC        47
#define HEART_MANDELBROT            48
#define BUFFALO                     49
#define CELTIC_HEART                50
#define PERPENDICULAR_BUFFALO       51
#define MULTI_MANDELBAR             52
#define COMPLEX_MULTI_BURNING_SHIP  53
#define COMPLEX_MULTI_MANDELBAR     54
#define FRAKTAL1                    55
#define FRAKTAL2                    56
#define CACTUS                      57
#define AIRSHIP                     58
#define TAIL                        59
#define QUILL                       60
#define SHARK_FIN                   61
#define POWER_DRILL                 62
#define BIG_AND_LITTLE              63
#define HALO                        64
#define GENIE_LAMP                  65
#define HOOK                        66
#define COW                         67
#define SIDEWAYS_SHIP               68
#define SOCK_PUPPET                 69
#define SPEEDY_BUFFALO              70
#define AUSTRALIA                   71
#define SMART_BUFFALO               72
#define CUSTOM                      73

#if (EXTERIOR_COLOURING_STYLE == 0 && MONOTONIC_FUNCTION == 2) || ESCAPE_ALGORITHM == 1
    #define MONITOR_DERIVATIVE
#endif

#if INTERIOR_COLOURING == 7
    #define MONITOR_PREV
    #define MONITOR_PREV_PREV
#endif

#if INTERIOR_COLOURING == 3 || (EXTERIOR_COLOURING_STYLE == 1 && CYCLE_FUNCTION == 1)
    #define MONITOR_PREV
#endif

uniform float fractal_param1;
uniform float fractal_param2;
uniform float fractal_param3;

uniform float escape_param;

uniform float julification;
uniform Complex julia_c;

uniform vec3 exterior_colour1;
uniform vec3 exterior_colour2;

uniform float exterior_colouring_param1;
uniform float exterior_colouring_param2;

uniform vec3 interior_colour1;
uniform vec3 interior_colour2;

uniform float interior_colouring_param1;
uniform float interior_colouring_param2;

float getSmoothIter(float mag_sq) {

    float exp;

    #if FRACTAL == MULTIBROT || FRACTAL == MULTI_BURNING_SHIP
        exp = max(1.0, fractal_param1);

    #elif FRACTAL == RATIONAL_MAP
        exp = max(fractal_param1, fractal_param2);

    #elif FRACTAL == SIMONBROT || FRACTAL == META_MANDELBROT
        exp = 4.0;

    #else
        exp = 2.0;
    #endif
    
    return 1.0 + log(log(escape_param) / log(mag_sq)) / log(exp);
    
}

float getSmoothDerIter(Complex der) {

    float exp;

    #if FRACTAL == MULTIBROT || FRACTAL == MULTI_BURNING_SHIP
        exp = max(1.0, fractal_param1);

    #elif FRACTAL == RATIONAL_MAP
        exp = max(fractal_param1, fractal_param2);

    #elif FRACTAL == SIMONBROT || FRACTAL == META_MANDELBROT
        exp = 4.0;

    #else
        exp = 2.0;
    #endif
    
    return 1.0 + log(log(escape_param) / log(dot(der, der))) / log(exp);
    
}

float centrePointOrbitDist(float mag_sq) {
    return sqrt(mag_sq);
}

float centrePointOrbitTaxicabDist(Complex z) {
    return abs(z.real) + abs(z.imag);
}

float circleOrbitDist(float mag_sq, float radius) {
    return abs(sqrt(mag_sq) - radius);
}

float crossOrbitDist(Complex z, float size) {
    vec2 dists = abs(abs(z) - size);
    return min(dists.real, dists.imag);
}

float gaussianIntegerOrbitDist(Complex z, float inv_scale) {
    Complex scaled = fract(z * inv_scale);
    return length(min(scaled, 1.0 - scaled)) * 3.0;
}

float gaussianIntegerOrbitTaxicabDist(Complex z, float inv_scale) {
    Complex scaled = fract(z * inv_scale);
    Complex axis_dists = min(scaled, 1.0 - scaled);
    return (axis_dists.real + axis_dists.imag) * 3.0;
}

float lineOrbitDist(vec2 z, float angle) {
    return abs(dot(z, Complex(sin(angle), cos(angle))));
}

vec3 getColour(float real, float imag) {

    Complex z = Complex(real, imag);
    Complex c;
    
    #if FRACTAL == LOGISTIC
        c = z;
        z = Complex(0.5, 0.0);
    #else
        c = mix(z, julia_c, julification);
    #endif

    #if FRACTAL == EXPONENT2
        z = Complex(1.0, 0.0);

    #elif FRACTAL == MAREK_DRAGON
        float r = TAU * fractal_param1;
        Complex zc = Complex(
            cos(r),
            sin(r)
        );

    #elif FRACTAL == SFX
        Complex c_mul = Complex(
            c.real * c.real,
            c.imag * c.imag
        );
    
    #elif FRACTAL == META_MANDELBROT
        Complex c2 = square(c);
        
    #elif FRACTAL == MANDELBROT_FOAM
        // literally have no idea how i got this
        z = square_root(-0.5 * Complex(fractal_param1, fractal_param2));
        Complex w = square_root(-square(z));

    #elif FRACTAL == COLLATZ2
        z = ONE;
    #endif

    Complex z_comp_sq = z * z;
    float mag_sq = z_comp_sq.real + z_comp_sq.imag;
    
    #ifdef MONITOR_PREV_PREV
        Complex z_prev_prev;
    #endif

    #ifdef MONITOR_PREV
        Complex z_prev = ZERO;
    #endif

    int iterations = MAX_ITERATIONS;

    #ifdef MONITOR_ORBIT_TRAPS
        float orbit_min_dist = monitorOrbitTraps(z, 99999999.9, mag_sq);
    #endif

    #ifdef MONITOR_DERIVATIVE
        Complex der = ONE;
    #endif

    #if EXTERIOR_COLOURING_STYLE == 1
        #if CYCLE_FUNCTION == 1
            Complex exp_diff;
            float exponential = 0.0;
        #endif
		
	#elif EXTERIOR_COLOURING_STYLE == 2
		#if RADIAL_ANGLE == 1
			float init_angle = argument(z);
			
		#elif RADIAL_ANGLE == 2
			Complex total_orbit = z;
		#endif
    #endif

    #if EXTERIOR_COLOURING_STYLE == 0 && MONOTONIC_FUNCTION == 3
        float exterior_stripe_total_prev = 0.0;
        float exterior_stripe_total = 0.0;
    #endif

    #if INTERIOR_COLOURING == 1
        float mag_sum = 0.0;

    #elif INTERIOR_COLOURING == 2
        float bail_dist_sq;
        float min_dist_sq = 1.0;

    #elif INTERIOR_COLOURING == 3
        Complex diff;
        float total_dist_sq = 0.0;
		
	#elif INTERIOR_COLOURING == 4
        float interior_stripe_total = 0.0;

    #elif INTERIOR_COLOURING == 6

        Complex period_check = Complex(99999.9, 999999.9);

        int max_period_length = int(interior_colouring_param1);
        int period_count = max_period_length - 1;
        int known_period = 0;

    #elif INTERIOR_COLOURING == 7
        vec3 sum = vec3(0.0, 0.0, 0.0);
    #endif

    for (int iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        
        #ifdef MONITOR_PREV_PREV
            z_prev_prev = z_prev;
        #endif

        #ifdef MONITOR_PREV
            z_prev = z;
        #endif    

        #if FRACTAL == MANDELBROT
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                2.0 * z.real * z.imag
            ) + c;

        #elif FRACTAL == BURNING_SHIP
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                2.0 * abs(z.real * z.imag)
            ) + c;

        #elif FRACTAL == TRICORN
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                -2.0 * z.real * z.imag
            ) + c;

        #elif FRACTAL == PERPENDICULAR_MANDELBROT
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                -2.0 * abs(z.real) * z.imag
            ) + c;

        #elif FRACTAL == CELTIC_MANDELBROT
            z = Complex(
                abs(z_comp_sq.real - z_comp_sq.imag),
                2.0 * z.real * z.imag
            ) + c;

        #elif FRACTAL == CELTIC_MANDELBAR
            z = Complex(
                abs(z_comp_sq.real - z_comp_sq.imag),
                -2.0 * z.real * z.imag
            ) + c;

        #elif FRACTAL == PERPENDICULAR_CELTIC
            z = Complex(
                abs(z_comp_sq.real - z_comp_sq.imag),
                -2.0 * abs(z.real) * z.imag
            ) + c;

        #elif FRACTAL == HEART_MANDELBROT
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                2.0 * abs(z.real) * z.imag
            ) + c;
        
        #elif FRACTAL == PERPENDICULAR_BURNING_SHIP
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                -2.0 * z.real * abs(z.imag)
            ) + c;

        #elif FRACTAL == BUFFALO
            z = Complex(
                abs(z_comp_sq.real - z_comp_sq.imag),
                2.0 * abs(z.real * z.imag)
            ) + c;

        #elif FRACTAL == CELTIC_HEART
            z = Complex(
                abs(z_comp_sq.real - z_comp_sq.imag),
                2.0 * abs(z.real) * z.imag
            ) + c;

        #elif FRACTAL == PERPENDICULAR_BUFFALO
            z = Complex(
                abs(z_comp_sq.real - z_comp_sq.imag),
                2.0 * z.real * abs(z.imag)
            ) + c;

        #elif FRACTAL == MULTIBROT
            z = exponent(z, fractal_param1) + c;
            
        #elif FRACTAL == MULTI_BURNING_SHIP
            z = exponent(abs(z), fractal_param1) + c;
            
        #elif FRACTAL == MULTI_MANDELBAR
            z = exponent(conj(z), fractal_param1) + c;

        #elif FRACTAL == COMPLEX_MULTIBROT
            z = exponent(z, Complex(fractal_param1, fractal_param2)) + c;

        #elif FRACTAL == COMPLEX_MULTI_BURNING_SHIP
            z = exponent(abs(z), Complex(fractal_param1, fractal_param2)) + c;

        #elif FRACTAL == COMPLEX_MULTI_MANDELBAR
            z = exponent(conj(z), Complex(fractal_param1, fractal_param2)) + c;

        #elif FRACTAL == AIRSHIP

            float abs_zi = abs(z.imag);

            z = Complex(
                z_comp_sq.real - abs_zi * z.imag,
                2.0 * z.real * abs_zi
            ) + c;

        #elif FRACTAL == TAIL
            z = Complex(
                -dot(abs(z), z),
                2.0 * z.real * z.imag
            ) + c;
            
        #elif FRACTAL == QUILL
            z = Complex(
                dot(abs(z), conj(z)),
                2.0 * z.real * z.imag
            ) + c;
        
        #elif FRACTAL == SHARK_FIN
            z = Complex(
                z_comp_sq.real - abs(z.imag) * z.imag,
                2.0 * z.real * z.imag
            ) + c;

        #elif FRACTAL == POWER_DRILL
            z = Complex(
                z_comp_sq.real - abs(z.imag) * z.imag,
                -2.0 * z.real * z.imag
            ) + c;

        #elif FRACTAL == BIG_AND_LITTLE
            z = -Complex(
                abs(z.real) * z.real + z_comp_sq.imag,
                2.0 * abs(z.real * z.imag)
            ) + c;

        #elif FRACTAL == HALO
            z = Complex(
                -dot(abs(z), z),
                2.0 * abs(z.real * z.imag)
            ) + c;

        #elif FRACTAL == GENIE_LAMP
            z = Complex(
                z_comp_sq.real + abs(z.imag) * z.imag,
                2.0 * abs(z.real) * z.imag
            ) + c;

        #elif FRACTAL == HOOK
            z = Complex(
                abs(z.real) * z.real - z_comp_sq.imag,
                2.0 * z.real * abs(z.imag)
            ) + c;

        #elif FRACTAL == COW
            z = Complex(
                abs(z_comp_sq.real + abs(z.imag) * z.imag),
                -2.0 * abs(z.real * z.imag)
            ) + c;

        #elif FRACTAL == SIDEWAYS_SHIP
            z = Complex(
                abs(dot(abs(z), z)),
                2.0 * z.real * z.imag
            ) + c;

        #elif FRACTAL == SOCK_PUPPET
            z = Complex(
                abs(z.real * abs(z.real) + z_comp_sq.imag),
                -2.0 * z.real * z.imag
            ) + c;

        #elif FRACTAL == SPEEDY_BUFFALO
            z = Complex(
                abs(z.real * abs(z.real) - abs(z.imag) * z.imag),
                -2.0 * abs(z.real * z.imag)
            ) + c;

        #elif FRACTAL == AUSTRALIA
            z = Complex(
                abs(z.real * abs(z.real) + z_comp_sq.imag),
                -2.0 * abs(z.real * z.imag)
            ) + c;

        #elif FRACTAL == SMART_BUFFALO
            z = Complex(
                abs(z.real * abs(z.real) - z_comp_sq.imag),
                -2.0 * abs(z.real * z.imag)
            ) + c;

        #elif FRACTAL == OTHER_BUFFALO
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                2.0 * abs(z.real * z.imag)
            ) - abs(z) + c;

        #elif FRACTAL == HEART
            z = Complex(
                z.real * z.imag,
                abs(z.imag) - abs(z.real)
            ) + c;

        #elif FRACTAL == MANDELBOX

            if (mag_sq < 0.25) {
                z *= 4.0;
            }
            else if (mag_sq < 1.0) {
                z /= mag_sq;
            }
            
            z = -fractal_param1 * z + c;
            
            if (z.real > 1.0) {
                z.real = 2.0 - z.real;
            }
            else if (z.real < -1.0) {
                z.real = -2.0 - z.real;
            }
            
            if (z.imag > 1.0) {
                z.imag = 2.0 - z.imag;
            }
            else if (z.imag < -1.0) {
                z.imag = -2.0 - z.imag;
            }

        #elif FRACTAL == FEATHER
            z = div(
                z * Complex(
                    z_comp_sq.real - 3.0 * z_comp_sq.imag,
                    3.0 * z_comp_sq.real - z_comp_sq.imag
                ),
                Complex(
                    z_comp_sq.real,
                    z_comp_sq.imag) + 1.0) + c;

        #elif FRACTAL == CHIRIKOV
            z += c * Complex(z.imag, sin(z.real));

        #elif FRACTAL == SMELLY_SHOE

            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                2.0 * sin(z.imag * z.real) * z.imag
            ) + c;

        #elif FRACTAL == DOG_SKULL
            z = Complex(
                z_comp_sq.real + tan(z.imag),
                z.imag * z_comp_sq.imag - z.real
            ) + c;

        #elif FRACTAL == EXPONENT2
            z = exponent(c, z);

        #elif FRACTAL == SINE

            Complex sine_z = sine(z);

            z = c * mat2(
                sine_z.real, -sine_z.imag,
                sine_z.imag, sine_z.real    
            );
			
		#elif FRACTAL == HYPERBOLIC_SINE
			z = abs(exponent(
				Complex(
					sinh(z.real) * cos(z.imag),
					cosh(z.real) * sin(z.imag)),
				fractal_param1)) + c;

        #elif FRACTAL == RATIONAL_MAP
            z = exponent(z, fractal_param1) - exponent(z, fractal_param2) * fractal_param3 + c;

        #elif FRACTAL == PHOENIX
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag + fractal_param1 * z.real - fractal_param2 * z.imag,
                2.0 * z.real * z.imag + fractal_param1 * z.imag + fractal_param2 * z.real
            ) + c;

        #elif FRACTAL == SIMONBROT
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                2.0 * z.real * z.imag
            ) * mag_sq + c;

        #elif FRACTAL == TIPPETTS
            z.real = z_comp_sq.real - z_comp_sq.imag + c.real;
            z.imag = 2.0 * z.real * z.imag + c.imag;

        #elif FRACTAL == MAREK_DRAGON
            z = prod(z, zc + z);

        #elif FRACTAL == GANGOPADHYAY

            Complex z_run = ZERO;

            float mag = sqrt(mag_sq);
            float t = atan(z.imag / z.real);

            #ifdef G_1
                z_run += sin(z);
            #endif
            
            #ifdef G_2
                z_run += z / mag_sq;
            #endif
            
            #ifdef G_3
                float theta = t + mag;
                z_run += mag * Complex(cos(theta), sin(theta));
            #endif
            
            #ifdef G_4
                float theta2 = 2.0 * t;
                z_run += mag * Complex(cos(theta2), sin(theta2));
            #endif
            
            #ifdef G_5
                z_run += Complex(t / PI, mag - 1.0);
            #endif
            
            z = square(z_run / G_TOTAL) + c;

        #elif FRACTAL == EXPONENT
            z = prod(c, exponent(z));

        #elif FRACTAL == SFX
            z = z * mag_sq - prod(z, c_mul);

        #elif FRACTAL == THORN
            z = Complex(
                z.real / cos(z.imag),
                z.imag / sin(z.real)
            ) + c;

        #elif FRACTAL == META_MANDELBROT

            Complex meta_z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                2.0 * z.real * z.imag
            ) + c;
            Complex meta_c = c2 + z;

            z = square(meta_z) + meta_c;

        #elif FRACTAL == MAGNET

            float dzr = 2.0 * z.real;

            z = square(
                div(
                    Complex(
                        z_comp_sq.real - z_comp_sq.imag - 1.0,
                        dzr * z.imag) + c,
                    Complex(
                        dzr - 2.0,
                        2.0 * z.imag) + c));

        #elif FRACTAL == TRIPLE_DRAGON

            Complex z3 = prod(
                z,
                Complex(
                    z_comp_sq.real - z_comp_sq.imag,
                    2.0 * z.real * z.imag));

            z = div(z3, z3 + ONE) + c;

        #elif FRACTAL == SPIRAL

            Complex dz2c = Complex(
                2.0 * (z_comp_sq.real - z_comp_sq.imag + c.real),
                4.0 * z.real * z.imag + c.imag
            );

            float denom = 1.0 / (cos(dz2c.real) + cosh(dz2c.imag));

            z = Complex(
                sin(dz2c.real),
                sinh(dz2c.imag)
            ) * denom;
		
		#elif FRACTAL == MANDELBRUH
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                fractal_param1 * z.real * z.imag
            ) + c;
				
		#elif FRACTAL == ZUBIETA
		
			Complex recip = div(
                prod(
                    c,
                    Complex(fractal_param1, fractal_param2)),
                z);

            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                2.0 * z.real * z.imag
            ) + recip;
			
		#elif FRACTAL == CUBIC
			z = exponent(z, 3.0) - exponent(-z, 2.00001) + c;

        #elif FRACTAL == DUFFING
            z = Complex(
                z.imag,
                dot(z, Complex(z.imag, c.real - z_comp_sq.imag))
            );

        #elif FRACTAL == GINGERBREAD
            z.real = 1.0 - z.imag + abs(z.real);
            z.imag = z.real;
            z += c;

        #elif FRACTAL == HENON
            z.real = 1.0 - c.real * z_comp_sq.real + z.imag;
            z.imag = c.imag * z.real;

        #elif FRACTAL == LOGISTIC
            z = prod(prod(z, ONE - z), c);

        #elif FRACTAL == TRICORN_SINE

            Complex sine_z = sine(z);

            z = mat2(
                sine_z.real, -sine_z.imag,
                sine_z.imag, sine_z.real    
            ) * c;

        #elif FRACTAL == TWIN_MANDELBROT
            z = square(z + div(square(c), z));
                        
        #elif FRACTAL == FRACKTAIL
            z = Complex(
                z_comp_sq.real - z_comp_sq.imag,
                2.0 * z.real * z.imag
            ) * argument(z) + c;
                        
        #elif FRACTAL == SAURON
            z = div(c, square(z)) + Complex(fractal_param1, fractal_param2) + c;
            
        #elif FRACTAL == MANDELBROT_FOAM

            w = div(
                prod(
                    Complex(
                        fractal_param1,
                        fractal_param2),
                    w),
                z);

            z = Complex(
                z_comp_sq.real - z_comp_sq.imag + w.real * w.real - w.imag * w.imag,
                2.0 * (z.real * z.imag + w.real * w.imag)
            ) + c;

        #elif FRACTAL == COLLATZ1
            z = 0.25 * (
                TWO
                + 7.0 * z
                - prod(5.0 * z + TWO, cosine(PI * z))
            );

        #elif FRACTAL == COLLATZ2

            Complex cos_pi_z = cosine(PI * z);

            z = 
                0.25 * prod(z, ONE + cos_pi_z)
                + 0.0625 * prod3(
                    3.0 * z + ONE,
                    ONE - cos_pi_z,
                    THREE - SQRT_2 * cosine(0.4 * PI * (2.0 * z - ONE))
                );

        #elif FRACTAL == FRAKTAL1
            z = exponent(z, z + c);

        #elif FRACTAL == FRAKTAL2
            z = exponent(z, prod(z, c));

        #elif FRACTAL == CACTUS
            z = prod(
                z,
                Complex(
                    z_comp_sq.real - z_comp_sq.imag,
                    2.0 * z.real * z.imag
                ))
                + prod(c - ONE, z) - c;

        #elif FRACTAL == CUSTOM
            z = z_comp_sq + prod(z, z) + c;

        #endif

        z_comp_sq = z * z;
        mag_sq = z_comp_sq.real + z_comp_sq.imag;

        #ifdef MONITOR_ORBIT_TRAPS
            orbit_min_dist = monitorOrbitTraps(z, orbit_min_dist, mag_sq);
        #endif

        #ifdef MONITOR_DERIVATIVE
            #if FRACTAL == BURNING_SHIP
                der = 2.0 * div(
                    prod(
                        z_prev,
                        der),
                    sign(z_prev)) + ONE;
    
            #elif FRACTAL == MULTIBROT

                der = scale(
                    prod(
                        exponent(
                            z_prev,
                            fractal_param1 - 1.0),
                        der),
                    2.0 * fractal_param1) + ONE;

            #else
                // try mandelbrot der, prob won't work
                der = 2.0 * prod(z_prev, der) + ONE;
            #endif
        #endif
        
        #if EXTERIOR_COLOURING_STYLE == 0 && MONOTONIC_FUNCTION == 3
            exterior_stripe_total_prev = exterior_stripe_total;
            exterior_stripe_total += 0.5 + 0.5 * sin(exterior_colouring_param1 * argument(z));
        #endif

        #if EXTERIOR_COLOURING_STYLE == 1
            #if CYCLE_FUNCTION == 1
                exp_diff = z - z_prev;
                exponential += exp(-(sqrt(mag_sq) + 0.5 * inversesqrt(dot(exp_diff, exp_diff))));
            #endif
			
		#elif EXTERIOR_COLOURING_STYLE == 2
			#if RADIAL_ANGLE == 2
				total_orbit += z;
			#endif
        #endif

        #if INTERIOR_COLOURING == 1
            mag_sum += mag_sq;

        #elif INTERIOR_COLOURING == 2
            min_dist_sq = min(min_dist_sq, 1.0 - mag_sq / escape_param);

        #elif INTERIOR_COLOURING == 3
            diff = z - z_prev;
            total_dist_sq += dot(diff, diff);
		
        #elif INTERIOR_COLOURING == 4
            interior_stripe_total += 0.5 + 0.5 * sin(interior_colouring_param1 * argument(z));
        
        #elif INTERIOR_COLOURING == 6

            Complex offset = z - period_check;

            period_count++;

            if (dot(offset, offset) < interior_colouring_param2 && (known_period == 0 || period_count < known_period)) {
                known_period = period_count;
                iterations = MAX_ITERATIONS;
            }

            if (period_count == max_period_length) {
                period_count = 0;
                period_check = z;
            }
        
        #elif INTERIOR_COLOURING == 7
        
            Complex dz = z - z_prev;
            Complex dzz = z_prev - z_prev_prev;
            Complex ddz = z - z_prev_prev;
            
            sum.x += dot(dz, dzz);
            sum.y += dot(dz, dz);
            sum.z += dot(ddz, ddz);

        #endif
        
        #if ESCAPE_ALGORITHM == 0
            if (mag_sq >= escape_param) {
                iterations = iteration;
                break;
            }
        
        #elif ESCAPE_ALGORITHM == 1
            if (dot(der, der) >= escape_param) {
                iterations = iteration;
                break;
            }
        #endif
    }

    if (iterations == MAX_ITERATIONS) {

        #if INTERIOR_COLOURING == 0
            return interior_colour1;

        #elif INTERIOR_COLOURING == 1
            return mix(interior_colour1, interior_colour2, mag_sum * inversesqrt(float(iterations)));

        #elif INTERIOR_COLOURING == 2
            return mix(interior_colour2, interior_colour1, min_dist_sq);

        #elif INTERIOR_COLOURING == 3
            return hsv2rgb(vec3(fract(sqrt(total_dist_sq)), 1.0, 1.0));

        #elif INTERIOR_COLOURING == 4
            return mix(interior_colour2, interior_colour1, interior_stripe_total / float(MAX_ITERATIONS));

        #elif INTERIOR_COLOURING == 5
            #ifdef MONITOR_ORBIT_TRAPS
                return mix(interior_colour2, interior_colour1, orbit_min_dist * 0.5);
            #else
                return interior_colour1;
            #endif

        #elif INTERIOR_COLOURING == 6
            return bool(known_period) ? hsv2rgb(vec3(sin(float(known_period)) * 0.5 + 0.5, 1.0, 1.0)) : vec3(0.0, 0.0, 0.0);

        #elif INTERIOR_COLOURING == 7
            return sin(abs(sum) / float(MAX_ITERATIONS) * 5.0) * 0.45 + 0.5;
        #endif

    }
    else {

        float colour_val = 0.0;

        #if EXTERIOR_COLOURING_STYLE == 0

            #if MONOTONIC_FUNCTION == 0 || MONOTONIC_FUNCTION == 1 || MONOTONIC_FUNCTION == 5
            
                float f_iterations = float(iterations);

                #if MONOTONIC_FUNCTION == 1
                    f_iterations += getSmoothIter(mag_sq);
                    
                #elif MONOTONIC_FUNCTION == 5
                    f_iterations += getSmoothDerIter(der);
                #endif

                colour_val = f_iterations / float(MAX_ITERATIONS);

            #elif MONOTONIC_FUNCTION == 2

                z = normalize(div(z, der));
                Complex dir = Complex(exterior_colouring_param1, exterior_colouring_param2);
                
                colour_val = max(0.0, dot(z, dir) + sqrt(1.0 - dot(dir, dir)));

            #elif MONOTONIC_FUNCTION == 3
                float interp = getSmoothIter(mag_sq);
                colour_val = mix(exterior_stripe_total_prev, exterior_stripe_total, interp) / (float(iterations) + interp);
                colour_val = max(colour_val, 0.0);

            #elif MONOTONIC_FUNCTION == 4
                #ifdef MONITOR_ORBIT_TRAPS
                    colour_val = clamp(1.0 - orbit_min_dist * 0.5, 0.0, 1.0);
                #else
                    colour_val = 0.0;
                #endif
            #endif

            #ifdef MONOTONIC_EASE_OUT
                colour_val = 1.0 - colour_val;
            #endif

            #if MONOTONIC_EASING_FUNCTION == 1
                colour_val = colour_val * colour_val;

            #elif MONOTONIC_EASING_FUNCTION == 2
                colour_val = sqrt(colour_val);

            #elif MONOTONIC_EASING_FUNCTION == 3
                colour_val = colour_val * colour_val * colour_val;

            #elif MONOTONIC_EASING_FUNCTION == 4
                colour_val = pow(colour_val, 1.0 / 3.0);

            #elif MONOTONIC_EASING_FUNCTION == 5
                colour_val = colour_val * colour_val * colour_val * colour_val;

            #elif MONOTONIC_EASING_FUNCTION == 6
                colour_val = pow(colour_val, 0.25);

            #elif MONOTONIC_EASING_FUNCTION == 7
                colour_val = colour_val * colour_val * colour_val * colour_val * colour_val;

            #elif MONOTONIC_EASING_FUNCTION == 8
                colour_val = pow(colour_val, 0.2);

            #elif MONOTONIC_EASING_FUNCTION == 9
                colour_val = (exp(colour_val) - 1.0) / (E - 1.0);

            #elif MONOTONIC_EASING_FUNCTION == 10
                colour_val = sin(colour_val * PI * 0.5);
            #endif

            #ifdef MONOTONIC_EASE_OUT
                colour_val = 1.0 - colour_val;
            #endif

        #elif EXTERIOR_COLOURING_STYLE == 1

            float val;

            #if CYCLE_FUNCTION == 0
                val = float(iterations) + getSmoothIter(mag_sq);

            #elif CYCLE_FUNCTION == 1
                val = log(exponential);

            #elif CYCLE_FUNCTION == 2
                #ifdef MONITOR_ORBIT_TRAPS
                    val = log(orbit_min_dist);
                #else
                    val = 0.0;
                #endif
            #endif

            val /= exterior_colouring_param1;

            #if CYCLIC_WAVEFORM == 0
                colour_val = 0.5 * sin(val * 2.0 * PI) + 0.5;

            #elif CYCLIC_WAVEFORM == 1
                colour_val = round(fract(val + 0.5));

            #elif CYCLIC_WAVEFORM == 2
                val = fract(val);
                colour_val = val > 0.5 ? 1.0 - 2.0 * (val - 0.5) : 2.0 * val;

            #elif CYCLIC_WAVEFORM == 3
                colour_val = fract(val + 0.5);
            #endif

        #elif EXTERIOR_COLOURING_STYLE == 2
            
            float angle;

			#if RADIAL_ANGLE == 0
				angle = argument(z);
				
			#elif RADIAL_ANGLE == 1
				angle = init_angle;
				
			#elif RADIAL_ANGLE == 2
				angle = argument(total_orbit);
			#endif

            #if RADIAL_DECOMPOSITION == 0
                colour_val = abs(angle) / PI;

            #elif RADIAL_DECOMPOSITION == 1
                colour_val = angle > 0.0 ? 0.0 : 1.0;
            #endif
        #endif

        #if EXTERIOR_COLOURING == 0
            return mix(exterior_colour2, exterior_colour1, colour_val);

        #elif EXTERIOR_COLOURING == 1
            return hsv2rgb(vec3(colour_val, 1.0, 1.0));
        #endif

    }
}