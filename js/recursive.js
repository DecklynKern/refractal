class Recursive extends Program {

    name = "recursive";
    display_name = "Recursive";
    shader = "shaders/recursive.glsl";
    options_panel = "recursive_options";

    default_centre_x = 0.5;
    default_centre_y = -0.5;
    default_magnitude = 0.5;

    fractal_type = new ParamInt(0, "fractal_type");
    iterations = new ParamInt(8, "iterations");

    params = [
        this.fractal_type,
        this.iterations
    ];

    setupGUI() {
        document.getElementById("rc_fractal_type").onchange = paramSet(this.fractal_type);
        document.getElementById("rc_iterations").onchange = paramSet(this.iterations);
    }
}