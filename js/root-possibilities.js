class RootPossibilities extends Program {

    name = "root-possibilities";
    display_name = "Root Possibilities";
    shader = "shaders/root-possibilities.glsl";
    options_panel = "root_possibilities_options";

    degree = 8;

    getShader() {
        
        var def = `//%
        #define DEGREE ${this.degree}`;

        return this.base_shader.replace("//%", def);

    }

    setupGUI() {
        document.getElementById("rp_degree").onchange = this.updateDegree;
    }

    updateDegree() {

        ROOT_POSSIBILITIES.degree = document.getElementById("rp_degree").value;

        setupShader();
        redraw();
    }
}