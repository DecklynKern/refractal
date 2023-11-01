class Recursive extends Program {

    shader = "shaders/recursive.glsl";
    options_panel = "recursive_options";

    fractal_type = new ParamInt(0, "fractal_type");
    iterations = new ParamInt(8, "iterations");

    setupGUI() {
        document.getElementById("rc_fractal_type").onchange = paramSet(this.fractal_type);
        document.getElementById("rc_iterations").onchange = paramSet(this.iterations);
    }
}