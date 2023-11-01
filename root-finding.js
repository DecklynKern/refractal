class RootFinding extends Program {

    shader = "shaders/root-finding.glsl";
    options_panel = "root_finding_options";

    root_clicked = 0;

    function = 0;
    algorithm = 0;
    secant_start = 0;
    fractal_type = 0;

    colouring_type = 0;

    max_iterations = 40;
    threshold = new ParamFloat(0.000001, "threshold");

    root1 = new ParamComplex( 1.0,  0,         "root1");
    root2 = new ParamComplex(-0.5, -0.866025404, "root2");
    root3 = new ParamComplex(-0.5,  0.866025404, "root3");

    a = new ParamComplex(1, 0, "a");
    c = new ParamComplex(0, 0, "c");
    
    root1_colour = new ParamVec3([1.0, 0.0, 0.0], "root1_colour");
    root2_colour = new ParamVec3([0.0, 1.0, 0.0], "root2_colour");
    root3_colour = new ParamVec3([0.0, 0.0, 1.0], "root3_colour");
    base_colour = new ParamVec3([0.0, 0.0, 0.0], "base_colour");

    colouring_param = new ParamFloat(2, "colouring_param");

    params = [
        this.threshold,
        this.root1,
        this.root2,
        this.root3,
        this.a,
        this.c,
        this.root1_colour,
        this.root2_colour,
        this.root3_colour,
        this.base_colour,
        this.colouring_param
    ];

    getShader() {
        
        var def = `//%
        #define FUNCTION ${this.function}
        #define FRACTAL_TYPE ${this.fractal_type}
        #define ALGORITHM ${this.algorithm}
        #define MAX_ITERATIONS ${this.max_iterations}
        #define COLOURING_TYPE ${this.colouring_type}`;

        if (this.algorithm == 4) {
            def += `\n#define START_POINT ${this.secant_start}`;
        }

        return this.baseShader.replace("//%", def);

    }

    setupGUI() {
        
        document.getElementById("rtf_function").onchange = this.updateFunction;
        document.getElementById("rtf_algorithm").onchange = this.updateAlgorithm;
        document.getElementById("secant_start").onchange = paramSetWithRecompile(this, "secant_start");
        document.getElementById("rtf_fractal_type").onchange = this.updateFractalType;
        
        document.getElementById("rtf_iterations").onchange = paramSet(this.max_iterations);
        document.getElementById("rtf_threshold").onchange = paramSet(this.threshold);
        
        document.getElementById("root_selector").onmousedown = this.clickRoot;
        document.getElementById("root_selector").onmousemove = this.updateRoots;
        
        document.getElementById("rtf_colouring_type").onchange = this.updateColouringType;
        document.getElementById("rtf_dist_mod").onchange = paramSet(this.colouring_param);
        document.getElementById("rtf_root_dist_brightness").onchange = paramSet(this.colouring_param);
        
        document.getElementById("root1_colour").onchange = paramSetColour(this.root1_colour);
        document.getElementById("root2_colour").onchange = paramSetColour(this.root2_colour);
        document.getElementById("root3_colour").onchange = paramSetColour(this.root3_colour);

        document.getElementById("base_colour").onchange = paramSetColour(this.base_colour);
        document.getElementById("convergent_colour").onchange = paramSetColour(this.root1_colour);

        this.root_canvas_context = document.getElementById("root_selector").getContext("2d");
        this.drawRoots();

        this.root1.real = 3;

        this.exponent_handler = new ComplexPickerHandler("rtf_exponent_selector", [this.root1], 6, 0, 0, "rtf_exponent_text", "p = $");

        this.root1.real = 1;

        this.a_handler = new ComplexPickerHandler("a_selector", [this.a], 1, 1, 0, "a_text", "a = $");
        this.julia_c_handler = new ComplexPickerHandler("rtf_julia_c_selector", [this.c], 1, 0, 0, "rtf_julia_text", "c = $");

    }

    updateFunction(event) {

        ROOT_FINDING.function = event.target.value;

        var root_colour = document.getElementById("rtf_root_colouring");
        var shaded_root_colour = document.getElementById("rtf_shaded_root_colouring");
        var max_orbit_dist_colour = document.getElementById("rtf_max_orbit_dist_colouring");
        var closest_root_dist_colour = document.getElementById("rtf_closest_root_dist_colouring");

        var root_selector_style = document.getElementById("root_selector_div").style;
        var exponent_selector_style = document.getElementById("rtf_exponent_div").style;

        root_colour.disabled = true;
        shaded_root_colour.disabled = true;
        max_orbit_dist_colour.disabled = true;
        closest_root_dist_colour.disabled = true;

        root_selector_style.display = "none";
        exponent_selector_style.display = "none";

        if (ROOT_FINDING.function == 0) {
            
            root_colour.disabled = false;
            shaded_root_colour.disabled = false;
            max_orbit_dist_colour.disabled = false;
            closest_root_dist_colour.disabled = false;
            
            root_selector_style.display = "block";

        }
        else {

            if (ROOT_FINDING.function == 2) {
                exponent_selector_style.display = "block";
                ROOT_FINDING.exponent_handler.loadValues();
            }

            document.getElementById("rtf_colouring_type").value = 2;

            ROOT_FINDING.updateColouringType({target: {value: 2}});
            return;

        }

        setupShader();
        redraw();

    }

    updateAlgorithm(event) {

        ROOT_FINDING.algorithm = event.target.value;
        
        document.getElementById("secant_div").style.display = show(ROOT_FINDING.algorithm == 4);

        setupShader();
        redraw();
        
    }

    updateFractalType(event) {

        ROOT_FINDING.fractal_type = event.target.value;

        var julia_style = document.getElementById("rtf_julia_div").style;

        julia_style.display = "none";

        if (ROOT_FINDING.fractal_type == 2) {
            julia_style.display = "block";
        }

        ROOT_FINDING.drawRoots();

        setupShader();
        redraw();

    }

    drawRoots() {

        this.root_canvas_context.clearRect(0, 0, 200, 200);

        this.root_canvas_context.strokeStyle = "black";
        this.root_canvas_context.beginPath();
        this.root_canvas_context.moveTo(0, 100);
        this.root_canvas_context.lineTo(200, 100);
        this.root_canvas_context.moveTo(100, 0);
        this.root_canvas_context.lineTo(100, 200);
        this.root_canvas_context.stroke();

        this.root_canvas_context.strokeStyle = document.getElementById("root1_colour").value;
        this.root_canvas_context.beginPath();
        this.root_canvas_context.arc(100 + 50 * ROOT_FINDING.root1.real, 100 + 50 * ROOT_FINDING.root1.imag, 4, 0, 2 * Math.PI);
        this.root_canvas_context.stroke();
        
        this.root_canvas_context.strokeStyle = document.getElementById("root2_colour").value;
        this.root_canvas_context.beginPath();
        this.root_canvas_context.arc(100 + 50 * ROOT_FINDING.root2.real, 100 + 50 * ROOT_FINDING.root2.imag, 4, 0, 2 * Math.PI);
        this.root_canvas_context.stroke();

        if (this.fractal_type != 3) {   
            this.root_canvas_context.strokeStyle = document.getElementById("root3_colour").value;
            this.root_canvas_context.beginPath();
            this.root_canvas_context.arc(100 + 50 * ROOT_FINDING.root3.real, 100 + 50 * ROOT_FINDING.root3.imag, 4, 0, 2 * Math.PI);
            this.root_canvas_context.stroke();
        }
    }

    clickRoot(event) {

        const dx1 = 100 + 50 * ROOT_FINDING.root1.real - event.offsetX;
        const dy1 = 100 + 50 * ROOT_FINDING.root1.imag - event.offsetY;
        const root1_dist = dx1 * dx1 + dy1 * dy1;

        const dx2 = 100 + 50 * ROOT_FINDING.root2.real - event.offsetX;
        const dy2 = 100 + 50 * ROOT_FINDING.root2.imag - event.offsetY;
        const root2_dist = dx2 * dx2 + dy2 * dy2;

        var root3_dist;

        if (ROOT_FINDING.fractal_type != 3) {   
            const dx3 = 100 + 50 * ROOT_FINDING.root3.real - event.offsetX;
            const dy3 = 100 + 50 * ROOT_FINDING.root3.imag - event.offsetY;
            root3_dist = dx3 * dx3 + dy3 * dy3;
        }
        else {
            root3_dist = 999999999;
        }

        const min_dist = Math.min(root1_dist, root2_dist, root3_dist);

        if (min_dist > 20) {
            return;
        }

        if (min_dist == root1_dist) {
            ROOT_FINDING.root_clicked = 1;
            
        }
        else if (min_dist == root2_dist) {
            ROOT_FINDING.root_clicked = 2;    
        }
        else {
            ROOT_FINDING.root_clicked = 3;
        }
    }

    updateRoots(event) {
        
        if (!mouse_down) {
            ROOT_FINDING.root_clicked = 0;
            return;
        }

        const new_real = (event.offsetX - 100) / 50;
        const new_imag = (event.offsetY - 100) / 50;

        switch (ROOT_FINDING.root_clicked) {

            case 0:
                return;

            case 1:
                ROOT_FINDING.root1.real = new_real;
                ROOT_FINDING.root1.imag = new_imag;
                break;

            case 2:
                ROOT_FINDING.root2.real = new_real;
                ROOT_FINDING.root2.imag = new_imag;
                break;

            case 3:
                ROOT_FINDING.root3.real = new_real;
                ROOT_FINDING.root3.imag = new_imag;

        }

        ROOT_FINDING.drawRoots();
        redraw();

    }

    updateColouringType(event) {

        const colouring_type = event.target.value;
        ROOT_FINDING.colouring_type = colouring_type;
   
        const root1_style = document.getElementById("root1_colour_div").style;
        const root2_style = document.getElementById("root2_colour_div").style;
        const root3_style = document.getElementById("root3_colour_div").style;
        const convergent_style = document.getElementById("convergent_colour_div").style;
        const dist_style = document.getElementById("rtf_dist_options").style;
        const root_dist_style = document.getElementById("rtf_root_dist_options").style;

        root1_style.display = "none";
        root2_style.display = "none";
        root3_style.display = "none";
        convergent_style.display = "none";
        dist_style.display = "none";
        root_dist_style.display = "none";
        
        if (colouring_type == 2) {

            convergent_style.display = "block";

            ROOT_FINDING.root1_colour.value = hexToRGB(document.getElementById("convergent_colour").value);
            
        }
        else if (colouring_type != 5) {

            if (colouring_type == 3) {
                dist_style.display = "block";

            }
            else if (colouring_type == 4) {
                root_dist_style.display = "block";
            }
            
            root1_style.display = "block";
            root2_style.display = "block";
            root3_style.display = "block";

            ROOT_FINDING.root1_colour.value = hexToRGB(document.getElementById("root1_colour").value);

        }
    
        setupShader();
        redraw();
    
    }
}