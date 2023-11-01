const ESCAPE_TIME_FUNCTIONS = [
    "z ← z<sup>2</sup> + c",
    "z ← (|x| + |y|i)<sup>2</sup> + c",
    "z ← z̄<sup>2</sup> + c",
    "z ← xy + (|y - x|)i + c",
    "",
    "z ← z<sup>p</sup> + c",
    "z ← z<sup>3</sup>/(z⊙z + 1) + c",
    "z ← ysin(x) + xyi",
    "z ← (sin(xy) + iy)<sup>2</sup> + c",
    "",
    "",
    "z ← y + (z·c - y<sup>3</sup>)i",
    "z ← 1 - y + |x| + xi + c",
    "z ← 1 - x<sup>2</sup>Re(c) + y + (xIm(c))i",
    "z ← sin(z)c",
    "z ← z<sup>p</sup> + λz<sup>q</sup> + c",
    "z ← z<sup>2</sup> + pz + c",
    "z ← z<sup>2</sup>|z|<sup>2</sup> + c",
    "z ← Re(z<sup>2</sup>) + 2[Re(z<sup>2</sup> + c)y]i + c",
    "z ← z<sup>2</sup> + e<sup>2πr</sup>z",
    "",
    "z ← ce<sup>z</sup>",
    "z ← z(z·z - c / ⊙c)",
    "z ← z<sup>p</sup> + c",
    "z ← x / cos(y) + yi / sin(x) + c",
    "z ← (z<sup>2</sup> + c)<sup>2</sup> + (z + c<sup>2</sup>)",
    "z ← Re(z<sup>2</sup>) - |x| + |Im(z<sup>2</sup>)| - |y| + c",
    "z ← [(z<sup>2</sup> + c - 1)/(2z + c - 2)]<sup>2</sup>",
    "z ← z<sup>3</sup>/(z<sup>3</sup> + 1) + c",
    "z ← tan(z<sup>2</sup> + c)",
    "",
    "",
    "",
    "",
    "z ← cz(1 - z) [z<sub>0</sub> = 0.5]",
    ""
];

const ESCAPE_TIME_ANIMATIONS = [
    function(ms) {
        ESCAPE_TIME.julia_c_real.value = animation_param1 * Math.sin(ms / 1000);
        ESCAPE_TIME.julia_c_imag.value = animation_param1 * Math.cos(ms / 1000);
    },
    function(ms) {
        ESCAPE_TIME.julia_c_real.value = animation_param1 * Math.sin(ms / 1000) * Math.sin(ms / 2500);
        ESCAPE_TIME.julia_c_imag.value = animation_param1 * Math.cos(ms / 1000) * Math.sin(ms / 2500);
    },
];

class EscapeTime extends Program {

    shader = "shaders/escape-time.glsl";
    options_panel = "escape_time_options";

    fractal = 0;

    fractal_param1 = new ParamFloat(0, "fractal_param1");
    fractal_param2 = new ParamFloat(0, "fractal_param2");
    fractal_param3 = new ParamFloat(0, "fractal_param3");

    escape_algorithm = 0;
    
    escape_param = new ParamFloat(4, "escape_param");
    max_iterations = 30;
    
    julification = new ParamFloat(0, "julification");
    julia_c = new ParamComplex(0, 0, "julia_c");

    exterior_colouring_style = 0;

    monotonic_function = 1;
    monotonic_easing_function = 0;
    monotonic_ease_out = false;
    cyclic_cycle_function = 0;
    cyclic_waveform = 0;
    radial_angle = 0;
    radial_decomposition = 0;

    exterior_colouring = 0;

    exterior_colouring_param1 = new ParamFloat(0, "exterior_colouring_param1");
    exterior_colouring_param2 = new ParamFloat(0, "exterior_colouring_param2");

    exterior_colour1 = new ParamVec3([0, 0, 1], "exterior_colour1");
    exterior_colour2 = new ParamVec3([0, 0, 0], "exterior_colour2");

    interior_colouring = 0;
    interior_colouring_param1 = new ParamFloat(0, "interior_colouring_param1");
    interior_colouring_param2 = new ParamFloat(0, "interior_colouring_param2");

    interior_colour1 = new ParamVec3([0, 0, 0], "interior_colour1");
    interior_colour2 = new ParamVec3([0, 0, 0], "interior_colour2");

    params = [
        this.fractal_param1,
        this.fractal_param2,
        this.fractal_param3,
        this.escape_param,
        this.julification,
        this.julia_c,
        this.exterior_colouring_param1,
        this.exterior_colouring_param2,
        this.exterior_colour1,
        this.exterior_colour2,
        this.interior_colouring_param1,
        this.interior_colouring_param2,
        this.interior_colour1,
        this.interior_colour2
    ];
	
    getShader() {

        var def = `//%
        #define FRACTAL ${this.fractal}
        #define ESCAPE_ALGORITHM ${this.escape_algorithm}
        #define MAX_ITERATIONS ${this.max_iterations}
        #define EXTERIOR_COLOURING_STYLE ${this.exterior_colouring_style}
        #define EXTERIOR_COLOURING ${this.exterior_colouring}
        #define INTERIOR_COLOURING ${this.interior_colouring}`;

        var total = 0;

        if (this.fractal == 20) {

            for (var i = 1; i < 6; i++) {

                if (document.getElementById("gangopadhyay" + i).checked) {
                    def += "\n#define G_" + i;
                    total += 1;
                }
            }

            def += `\n#define G_TOTAL ${total}.0`;

        }

        var monitor_orbit_traps = document.getElementById("orbit_traps").childElementCount != 0;

        var monotonic_function = this.monotonic_function;
        if (this.exterior_colouring_style != 0) {
            monotonic_function = -1;
        }

        def += `\n#define MONOTONIC_FUNCTION ${monotonic_function}`;
        def += `\n#define MONOTONIC_EASING_FUNCTION ${this.monotonic_easing_function}`

        if (this.monotonic_ease_out) {
            def += "\n#define MONOTONIC_EASE_OUT";
        }

        var cycle_function = this.cyclic_cycle_function;
        var cyclic_waveform = this.cyclic_waveform;
        if (this.exterior_colouring_style != 1) {
            cycle_function = cyclic_waveform = -1;
        }

        def += `\n#define CYCLE_FUNCTION ${cycle_function}`;
        def += `\n#define CYCLIC_WAVEFORM ${cyclic_waveform}`;

        var radial_angle = this.radial_angle;
        var radial_decomposition = this.radial_decomposition;
        if (this.exterior_colouring_style != 2) {
			radial_angle = radial_decomposition = -1;
        }

        def += `\n#define RADIAL_ANGLE ${radial_angle}`;
        def += `\n#define RADIAL_DECOMPOSITION ${radial_decomposition}`;

        if (monitor_orbit_traps) {

            def += `
            #define MONITOR_ORBIT_TRAPS
            float centrePointOrbitDist(float mag_sq);
            float centrePointOrbitTaxicabDist(Complex z);
            float circleOrbitDist(float mag_sq, float radius);
            float crossOrbitDist(Complex z, float size);
            float gaussianIntegerOrbitDist(Complex z, float scale);
            float gaussianIntegerOrbitTaxicabDist(Complex z, float scale);
            float lineOrbitDist(Complex z, float angle);

            float monitorOrbitTraps(Complex z, float min_dist, float mag_sq) {
            float orbit_dist;`

            const orbit_traps = document.getElementById("orbit_traps").children;

            for (var i = 0; i < orbit_traps.length; i++) {

                const param = (+orbit_traps[i].children[2].firstElementChild.value).toFixed(2);

                switch (+orbit_traps[i].children[1].firstElementChild.value) {

                    case 0:
                        def += "orbit_dist = centrePointOrbitDist(mag_sq);\n";
                        break;

                    case 1:
                        def += `orbit_dist = circleOrbitDist(mag_sq, ${param});\n`;
                        break;

                    /*
                    case 2:
                        def += `
                        float areal = abs(z.real);
                        float aimag = abs(z.imag);

                        bool px = areal <= ${param};
                        bool py = aimag <= ${param};
                        
                        if (px) {
                            min_dist = min(min_dist, abs(z.imag - ${param}));
                        }
                        
                        if (py) {
                            min_dist = min(min_dist, abs(z.real - ${param}));
                        }
                        
                        if (!(py || px)) {
                            float dreal = areal - ${param};
                            float dimag = aimag - ${param};
                            min_dist = min(min_dist, sqrt(dreal * dreal + dimag * dimag));
                        }\n`;
                        break;*/

                    case 3:
                        def += `orbit_dist = crossOrbitDist(z, ${param});\n`;
                        break;

                    case 4:
                        def += `orbit_dist = gaussianIntegerOrbitDist(z, ${1 / param});\n`;
                        break;

                    case 5:
                        def += `orbit_dist = gaussianIntegerOrbitTaxicabDist(z, ${1 / param});\n`;
                        break;

                    case 6:
                        def += "orbit_dist = centrePointOrbitTaxicabDist(z);\n";
                        break;

                    case 7:
                        def += `orbit_dist = lineOrbitDist(z, ${param});\n`;
                        break;

                }

                def += "min_dist = min(min_dist, orbit_dist);"

            }

            def += "return min_dist;\n}";

        }
        
        return this.baseShader.replace("//%", def);

    }

    setupGUI() {
        
        document.querySelectorAll('[esc_param="1"]').forEach(
            function(fractal_param) {
                fractal_param.onchange = paramSet(ESCAPE_TIME.fractal_param1);
            }
        );
        
        document.querySelectorAll('[esc_param="2"]').forEach(
            function(fractal_param) {
                fractal_param.onchange = paramSet(ESCAPE_TIME.fractal_param2);
            }
        );
        
        document.querySelectorAll('[esc_param="3"]').forEach(
            function(fractal_param) {
                fractal_param.onchange = paramSet(ESCAPE_TIME.fractal_param3);
            }
        );

        document.getElementById("esc_fractal").onchange = this.updateFractal;

        document.getElementById("gangopadhyay1").onchange = this.updateGangopadhyay;
        document.getElementById("gangopadhyay2").onchange = this.updateGangopadhyay;
        document.getElementById("gangopadhyay3").onchange = this.updateGangopadhyay;
        document.getElementById("gangopadhyay4").onchange = this.updateGangopadhyay;
        document.getElementById("gangopadhyay5").onchange = this.updateGangopadhyay;

        this.cmultibrot_p_handler = new ComplexPickerHandler("cmultibrot_p_selector", [this.fractal_param1, this.fractal_param2], 6, 0, 0, "cmultibrot_p_text", "p = $");
        
        this.phoenix_p_handler = new ComplexPickerHandler("phoenix_p_selector", [this.fractal_param1, this.fractal_param2], 2, 0, 0, "phoenix_p_text", "p = $");
        
        this.zubieta_a_handler = new ComplexPickerHandler("zubieta_a_selector", [this.fractal_param1, this.fractal_param2], 2, 0, 0, "zubieta_a_text", "a = $");
    
        this.sauron_a_handler = new ComplexPickerHandler("sauron_a_selector", [this.fractal_param1, this.fractal_param2], 2, 0, 0, "sauron_a_text", "a = $");
    
        this.foam_q_handler = new ComplexPickerHandler("foam_q_selector", [this.fractal_param1, this.fractal_param2], 2, 0, 0, "sauron_a_text", "q = $");
    
        document.getElementById("julification").oninput = paramSet(this.julification);
        this.julia_c_handler = new ComplexPickerHandler("julia_selector", [this.julia_c], 2.5, 0, 0, "esc_julia_text", "c = $");

        document.getElementById("esc_max_iterations").onchange = paramSetWithRecompile(this, "max_iterations");
        
        document.getElementById("escape_algorithm").onchange = this.updateEscapeAlgorithm;
        document.getElementById("escape_radius").onchange = this.updateEscapeParamSquared;
        document.getElementById("escape_derivative").onchange = this.updateEscapeParamSquared;
        
        document.getElementById("orbit_trap_add").onclick = this.addOrbitTrap;

        document.getElementById("exterior_colouring_style").onchange = this.updateExteriorColouringStyle;

        document.getElementById("monotonic_function").onchange = this.updateMonotonicFunction;
        document.getElementById("monotonic_easing_function").onchange = paramSetWithRecompile(this, "monotonic_easing_function");
        document.getElementById("monotonic_ease_out").onchange = paramSetWithRecompile(this, "monotonic_ease_out");
		
        document.getElementById("cyclic_cycle_function").onchange = paramSetWithRecompile(this, "cycle_function");
        document.getElementById("cyclic_waveform").onchange = paramSetWithRecompile(this, "cyclic_waveform");
        document.getElementById("esc_cycle_period").onchange = paramSet(this.exterior_colouring_param1);
		
        document.getElementById("radial_angle").onchange = paramSetWithRecompile(this, "radial_angle");
        document.getElementById("radial_decomposition").onchange = paramSetWithRecompile(this, "radial_decomposition");

        document.getElementById("esc_exterior_colouring").onchange = this.updateExteriorColouring;

        document.getElementById("stripe_density").onchange = paramSet(this.exterior_colouring_param1);

        document.getElementById("close_colour").onchange = paramSetColour(this.exterior_colour1);
        document.getElementById("far_colour").onchange = paramSetColour(this.exterior_colour2);
        document.getElementById("exterior_colour1").onchange = paramSetColour(this.exterior_colour1);
        document.getElementById("exterior_colour2").onchange = paramSetColour(this.exterior_colour2);

        document.getElementById("interior_colouring").onchange = this.updateInteriorColouring;
		
        document.getElementById("interior_stripe_density").onchange = paramSet(this.interior_colouring_param1);

        document.getElementById("interior_period_length").onchange = paramSet(this.interior_colouring_param1);
        document.getElementById("interior_period_threshold").onchange = paramSet(this.interior_colouring_param2);

        document.getElementById("interior_solid_colour").onchange = paramSetColour(this.interior_colour1);
        document.getElementById("interior_close_colour").onchange = paramSetColour(this.interior_colour1);
        document.getElementById("interior_far_colour").onchange = paramSetColour(this.interior_colour2);

        this.light_handler = new ComplexPickerHandler("light_selector", [this.exterior_colouring_param1, this.exterior_colouring_param2], 1, 0, 0, null, null);
		
    }

    updateFractal(event) {

        ESCAPE_TIME.fractal = +event.target.value;
    
        var scaling_style = document.getElementById("scaling_div").style;
        var exponent_style = document.getElementById("exponent_div").style;
        var cmultibrot_style = document.getElementById("cmultibrot_div").style;
        var rational_style = document.getElementById("rational_div").style;
        var phoenix_style = document.getElementById("phoenix_div").style;
        var dragon_style = document.getElementById("dragon_div").style;
        var gangopadhyay_style = document.getElementById("gangopadhyay_div").style;
        var mandelbruh_style = document.getElementById("mandelbruh_div").style;
        var hyperbolic_sine_style = document.getElementById("hyperbolic_sine_div").style;
        var zubieta_style = document.getElementById("zubieta_div").style;
        var sauron_style = document.getElementById("sauron_div").style;
        var foam_style = document.getElementById("foam_div").style;
        var function_text = document.getElementById("esc_function_text");
    
        scaling_style.display = "none";
        exponent_style.display = "none";
        cmultibrot_style.display = "none";
        rational_style.display = "none";
        phoenix_style.display = "none";
        dragon_style.display = "none";
        gangopadhyay_style.display = "none";
        mandelbruh_style.display = "none";
        hyperbolic_sine_style.display = "none";
        zubieta_style.display = "none";
        sauron_style.display = "none";
        foam_style.display = "none";

        function_text.innerHTML = ESCAPE_TIME_FUNCTIONS[ESCAPE_TIME.fractal];

        document.getElementById("julia_div").style.display = show(
            ![19, 34, 42, 43].includes(ESCAPE_TIME.fractal)
        );

        if ([5, 40, 52].includes(ESCAPE_TIME.fractal)) {
            exponent_style.display = "block";
            ESCAPE_TIME.fractal_param1.value = document.getElementById("exponent").value;
        }
        else if ([23, 53, 54].includes(ESCAPE_TIME.fractal)) {
            cmultibrot_style.display = "block";
            ESCAPE_TIME.cmultibrot_p_handler.loadValues();
        }

        if (ESCAPE_TIME.fractal == 4) {
            scaling_style.display = "block";
            ESCAPE_TIME.fractal_param1.value = document.getElementById("scaling").value;
        }
        else if (ESCAPE_TIME.fractal == 15) {
            rational_style.display = "block";
            ESCAPE_TIME.fractal_param1.value = document.getElementById("rational_p").value;
            ESCAPE_TIME.fractal_param2.value = document.getElementById("rational_q").value;
            ESCAPE_TIME.fractal_param3.value = document.getElementById("rational_lambda").value;
        }
        else if (ESCAPE_TIME.fractal == 16) {
            phoenix_style.display = "block";
            ESCAPE_TIME.phoenix_p_handler.loadValues();
        }
        else if (ESCAPE_TIME.fractal == 19) {
            dragon_style.display = "block";
        }
        else if (ESCAPE_TIME.fractal == 20) {
            gangopadhyay_style.display = "block";
        }
        else if (ESCAPE_TIME.fractal == 30) {
            mandelbruh_style.display = "block";
            ESCAPE_TIME.fractal_param1.value = document.getElementById("mandelbruh_a").value;
        }
        else if (ESCAPE_TIME.fractal == 31) {
            hyperbolic_sine_style.display = "block";
            ESCAPE_TIME.fractal_param1.value = document.getElementById("hyperbolic_sine_p").value;
        }
        else if (ESCAPE_TIME.fractal == 32) {
            zubieta_style.display = "block";
            ESCAPE_TIME.zubieta_a_handler.loadValues();
        }
        else if (ESCAPE_TIME.fractal == 38) {
            sauron_style.display = "block";
            ESCAPE_TIME.sauron_a_handler.loadValues();
        }
        else if (ESCAPE_TIME.fractal == 41) {
            foam_style.display = "block";
            ESCAPE_TIME.foam_q_handler.loadValues();
        }
        
        setupShader();
        redraw();
    
    }
    
    updateEscapeAlgorithm(event) {
        
        ESCAPE_TIME.escape_algorithm = event.target.value;
        
        var mag_style = document.getElementById("esc_mag_div").style;
        var der_style = document.getElementById("esc_der_div").style;
        
        mag_style.display = "none";
        der_style.display = "none";
        
        if (ESCAPE_TIME.escape_algorithm == 0) {
            mag_style.display = "block";
            ESCAPE_TIME.escape_param.value = Math.pow(document.getElementById("escape_radius").value, 2.0);
        }
        else if (ESCAPE_TIME.escape_algorithm == 1) {
            der_style.display = "block";
            ESCAPE_TIME.escape_param.value = Math.pow(document.getElementById("escape_derivative").value, 2.0);
        }
        
        setupShader();
        redraw();
        
    }
    
    updateEscapeParamSquared(event) {
        ESCAPE_TIME.escape_param.value = event.target.value * event.target.value;
        redraw();
    }

    updateGangopadhyay(_event) {
        setupShader();
        redraw();
    }

    addOrbitTrap(_event) {

        var new_orbit_trap = document.createElement("div");
        new_orbit_trap.innerHTML = `
        <hr>
        <div class="grid-entry">
            <select onchange="ESCAPE_TIME.updateOrbitTrap(event)">
                <option value=0>Centre Point</option>
                <option value=6>Centre Point (Taxicab distance)</option>
                <option value=1>Circle</option>
                <!-- <option value=2>Square</option> -->
                <option value=3>Cross</option>
                <option value=4>Gaussian Integers</option>
                <option value=5>Gaussian Integers (Taxicab distance)</option>
                <option value=7>Line</option>
            </select>
            <button onclick="ESCAPE_TIME.deleteOrbitTrap(event)">
                X
            </button>
        </div>
        <div class="grid-entry" style="display: none">
            <input type="number" value=2 min=0 step=0.1 onchange="setupShader();redraw()">
        </div>`;

        document.getElementById("orbit_traps").appendChild(new_orbit_trap);

        setupShader();
        redraw();

    }

    deleteOrbitTrap(event) {

        event.target.parentElement.parentElement.remove();

        setupShader();
        redraw();
    }

    updateOrbitTrap(event) {
        
        var settings_div = event.target.parentElement.nextSibling.nextSibling;
        settings_div.style.display = "none";
        
        var setting = "";

        if (event.target.value == 1) {
            settings_div.style.display = "flex";
            settings_div.childNodes[0].nodeValue
            setting = "Radius:";
        }
        else if (event.target.value == 2 || event.target.value == 3) {
            setting = "Size:";
        }
        else if (event.target.value == 4 || event.target.value == 5) {
            setting = "Scale:";
        }
        else if (event.target.value == 7) {
            setting = "Angle (Radians):";
        }
        
        if (setting) {
            settings_div.style.display = "flex";
            settings_div.childNodes[0].nodeValue = setting;
        }

        setupShader();
        redraw();

    }

    synchExteriorColourSettings() {
    
        const monotonic_colour_style = document.getElementById("monotonic_colour_select").style;
        const other_colour_style = document.getElementById("other_colour_select").style;
        
        monotonic_colour_style.display = "none";
        other_colour_style.display = "none";
        
        if (ESCAPE_TIME.exterior_colouring == 0) {
            if (ESCAPE_TIME.exterior_colouring_style == 0) {
                monotonic_colour_style.display = "block";
                ESCAPE_TIME.exterior_colour1.value = hexToRGB(document.getElementById("close_colour").value);
                ESCAPE_TIME.exterior_colour2.value = hexToRGB(document.getElementById("far_colour").value);    
            }
            else {
                other_colour_style.display = "block";
                ESCAPE_TIME.exterior_colour1.value = hexToRGB(document.getElementById("exterior_colour1").value);
                ESCAPE_TIME.exterior_colour2.value = hexToRGB(document.getElementById("exterior_colour2").value);
            }
        }
    }

    updateExteriorColouringStyle(event) {

        ESCAPE_TIME.exterior_colouring_style = event.target.value;

        const styles = [
            document.getElementById("monotonic_rendering_div").style,
            document.getElementById("cyclic_rendering_div").style,
            document.getElementById("radial_rendering_div").style
        ];

        styles.forEach((style) => style.display = "none");
        styles[ESCAPE_TIME.exterior_colouring_style].display = "block";

        if (ESCAPE_TIME.exterior_colouring_style == 1) {
            ESCAPE_TIME.exterior_colouring_param1.value = document.getElementById("esc_cycle_period").value;
        }

        ESCAPE_TIME.synchExteriorColourSettings();
        setupShader();
        redraw();

    }

    updateMonotonicFunction(event) {

        ESCAPE_TIME.monotonic_function = event.target.value;

        var light_style = document.getElementById("light_selector_div").style;
        var stripe_style = document.getElementById("stripe_average_div").style;

        light_style.display = "none";
        stripe_style.display = "none";

        if (ESCAPE_TIME.monotonic_function == 2) {
            light_style.display = "block";
            ESCAPE_TIME.light_handler.loadValues();
        }
        else if (ESCAPE_TIME.monotonic_function == 3) {
            stripe_style.display = "block";
            ESCAPE_TIME.exterior_colouring_param1.value = document.getElementById("stripe_density").value;
        }

        setupShader();
        redraw();

    }

    updateExteriorColouring(event) {
    
        ESCAPE_TIME.exterior_colouring = event.target.value;

        ESCAPE_TIME.synchExteriorColourSettings();
        setupShader();
        redraw();
    
    }

    updateInteriorColouring(event) {

        ESCAPE_TIME.interior_colouring = event.target.value;

        var solid_style = document.getElementById("interior_solid_div").style;
        var dist_style = document.getElementById("interior_dist_div").style;
        var stripe_style = document.getElementById("interior_stripe_div").style;
        var period_style = document.getElementById("interior_period_div").style;

        solid_style.display = "none";
        dist_style.display = "none";
        stripe_style.display = "none";
        period_style.display = "none";

        if (ESCAPE_TIME.interior_colouring == 6 || ESCAPE_TIME.interior_colouring == 7) {
        }
        else if (ESCAPE_TIME.interior_colouring == 0) {
            solid_style.display = "block";
            ESCAPE_TIME.interior_colour1.value = hexToRGB(document.getElementById("interior_solid_colour").value);
        
        }
        else {
            dist_style.display = "block";
            ESCAPE_TIME.interior_colour1.value = hexToRGB(document.getElementById("interior_close_colour").value);
            ESCAPE_TIME.interior_colour2.value = hexToRGB(document.getElementById("interior_far_colour").value);
        }
		
        if (ESCAPE_TIME.interior_colouring == 4) {
            ESCAPE_TIME.interior_colouring_param1.value = document.getElementById("interior_stripe_density").value;
            stripe_style.display = "block";
        }
        else if (ESCAPE_TIME.interior_colouring == 6) {
            ESCAPE_TIME.interior_colouring_param1.value = document.getElementById("interior_period_length").value;
            ESCAPE_TIME.interior_colouring_param2.value = document.getElementById("interior_period_threshold").value;
            period_style.display = "block";
        }

        setupShader();
        redraw();

    }
}
