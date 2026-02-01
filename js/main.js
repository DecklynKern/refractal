var FRAGMENT_MAIN = "";
var FRAGMENT_SHADER = "";
var gl;

var path_context;

const ESCAPE_TIME = new EscapeTime();
const LYAPUNOV = new Lyapunov();
const ROOT_FINDING = new RootFinding();
const PENDULUM = new Pendulum();
const RECURSIVE = new Recursive();
const ROOT_POSSIBILITIES = new RootPossibilities();

const PROGRAMS = [
    ESCAPE_TIME,
    LYAPUNOV,
    ROOT_FINDING,
    PENDULUM,
    RECURSIVE,
    ROOT_POSSIBILITIES,
];
var program = PROGRAMS[0];

var mouse_down = false;

var magnitude = new ParamFloat(2, "magnitude");
var centre_x = new ParamFloat(0, "centre_x");
var centre_y = new ParamFloat(0, "centre_y");
var canvas_size = new ParamInt(1000, "canvas_size");

var gradients = [];

var transformation = 0;
var invert_handler;
var moebius_a_handler;
var moebius_b_handler;
var moebius_c_handler;
var moebius_d_handler;
var exponent_a_handler;
var exponent_b_handler;
var transform_param1 = new ParamFloat(0.0, "transform_param1");
var transform_param2 = new ParamFloat(0.0, "transform_param2");
var transform_param3 = new ParamFloat(0.0, "transform_param3");
var transform_param4 = new ParamFloat(0.0, "transform_param4");
var transform_param5 = new ParamFloat(0.0, "transform_param5");
var transform_param6 = new ParamFloat(0.0, "transform_param6");
var transform_param7 = new ParamFloat(0.0, "transform_param7");
var transform_param8 = new ParamFloat(0.0, "transform_param8");

var samples = 1;
var blending_algorithm = 0;

var busy = false;

var animation_param1 = 1;

function main() {

    const vertex_request = new XMLHttpRequest();
    vertex_request.addEventListener("load", function() {
        VERTEX_SHADER = this.responseText;
    });
    vertex_request.open("GET", "shaders/vertex.glsl");
    vertex_request.send();

    const main_request = new XMLHttpRequest();
    main_request.addEventListener("load", function() {
        FRAGMENT_MAIN = this.responseText;
    });
    main_request.open("GET", "shaders/frag_main.glsl");
    main_request.send();

    document.getElementById("program").onchange = updateProgram;

    document.onkeydown = keyhandler;

    document.onmousedown = function(_ev) {mouse_down = true};
    document.onmouseup = function(_ev) {mouse_down = false};
    
    document.getElementById("transformation").onchange = updateTransformation;
    invert_handler = new ComplexPickerHandler("invert_selector", [transform_param1, transform_param2], 2.5, 0, 0, "invert_text", "$");
    
    moebius_a_handler = new ComplexPickerHandler("moebius_a_selector", [transform_param1, transform_param2], 2.5, 0, 0, "moebius_a_text", "a = $");
    moebius_b_handler = new ComplexPickerHandler("moebius_b_selector", [transform_param3, transform_param4], 2.5, 0, 0, "moebius_b_text", "b = $");
    moebius_c_handler = new ComplexPickerHandler("moebius_c_selector", [transform_param5, transform_param6], 2.5, 0, 0, "moebius_c_text", "c = $");
    moebius_d_handler = new ComplexPickerHandler("moebius_d_selector", [transform_param7, transform_param8], 2.5, 0, 0, "moebius_d_text", "d = $");
    
    exponent_a_handler = new ComplexPickerHandler("trans_exponent_a_selector", [transform_param1, transform_param2], 2.5, 1, 0, "trans_exponent_a_text", "a = $");
    exponent_b_handler = new ComplexPickerHandler("trans_exponent_b_selector", [transform_param3, transform_param4], 2.5, 0, 0, "trans_exponent_b_text", "b = $");

    document.getElementById("samples").onchange = updateSamples;
    document.getElementById("canvas_size").onchange = updateCanvasSize;
    document.getElementById("blending_algorithm").onchange = updateBlendingAlgorithm;

    document.getElementById("path_canvas").onclick = onFractalClick;
    
    document.querySelectorAll('[anim_param="1"]').forEach(anim_param => {
        anim_param.onchange = event => animation_param1 = event.target.value
    });

    path_context = document.getElementById("path_canvas").getContext("2d");
    document.getElementById("path_canvas").onmouseleave = clearPath;

    var idx = 0;
    document.querySelectorAll(".gradient").forEach(canvas => {

        const init_min_colour = canvas.dataset.hasOwnProperty("init_min_colour") ? canvas.dataset.init_min_colour : "#FF0000";
        const init_max_colour = canvas.dataset.hasOwnProperty("init_max_colour") ? canvas.dataset.init_max_colour : "#0000FF";
        
        gradients.push(new GradientHandler(canvas, init_min_colour, init_max_colour));
        canvas.gradient_idx = idx++;

    });

    for (let setup_program of PROGRAMS) {

        var option = document.createElement("option");
        option.value = setup_program.name;
        option.innerText = setup_program.display_name;
        document.getElementById("program").appendChild(option);

        document.getElementById(setup_program.options_panel).style.display = show(setup_program == program);

        setup_program.setupGUI();
    }

    initWebGL();
    loadProgram(ESCAPE_TIME);

}

function loadProgram(prgrm) {

    document.getElementById(program.options_panel).style.display = "none";

    program = prgrm;
    
    const fragment_request = new XMLHttpRequest();
    fragment_request.addEventListener("load", receiveShader);
    fragment_request.open("GET", program.shader);
    fragment_request.send();

    document.getElementById(program.options_panel).style.display = "block";
    document.getElementById("path_canvas").onmousemove = program.drawPath;

}

function receiveShader() {
    program.base_shader = FRAGMENT_MAIN + this.responseText;
    setupShader();
    resetView();
}

function setupShader() {

    const global_settings = `
    #define TRANSFORMATION ${transformation}
    #define SAMPLES ${samples}
    #define BLENDING_ALGORITHM ${blending_algorithm}`;

    FRAGMENT_SHADER = program.getShader().replace("//%", global_settings);
    initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER);

    const position_attr = gl.getAttribLocation(gl.program, "position");

    gl.vertexAttribPointer(position_attr, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position_attr);

    magnitude.getAttr();
    centre_x.getAttr();
    centre_y.getAttr();
    canvas_size.getAttr();
    
    transform_param1.getAttr();
    transform_param2.getAttr();
    transform_param3.getAttr();
    transform_param4.getAttr();
    transform_param5.getAttr();
    transform_param6.getAttr();
    transform_param7.getAttr();
    transform_param8.getAttr();

    program.setupAttrs();

}

function initWebGL() {
    
    const canvas = document.getElementById("fractal_canvas");
    gl = canvas.getContext("webgl2", {preserveDrawingBuffer: true});
    gl.disable(gl.DEPTH_TEST);

    const vertices = new Float32Array([
        -1.0,  1.0,
        -1.0, -1.0,
         1.0,  1.0,
         1.0, -1.0
    ]);

    const vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

}

function redraw() {
    tryRedraw(false);
}

function tryRedraw(force) {
    
    if (busy && !force) {
        return;
    }
    
    busy = true;

    magnitude.load();
    centre_x.load();
    centre_y.load();
    canvas_size.load();
    
    transform_param1.load();
    transform_param2.load();
    transform_param3.load();
    transform_param4.load();
    transform_param5.load();
    transform_param6.load();
    transform_param7.load();
    transform_param8.load();

    program.loadAttrs();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    clearPath();
    
    busy = false;

}

function updateProgram() {
    for (let program of PROGRAMS) {
        if (document.getElementById("program").value == program.name) {
            loadProgram(program);
        }
    }
}

function updateTransformation(event) {
    
    transformation = event.target.value;
    
    var invert_style = document.getElementById("invert_div").style;
    var moebius_style = document.getElementById("moebius_div").style;
    var exponent_style = document.getElementById("trans_exponent_div").style;
    
    invert_style.display = "none";
    moebius_style.display = "none";
    exponent_style.display = "none";
    
    if (transformation == 1) {
        invert_style.display = "block";
        invert_handler.loadValues();
    }
    else if (transformation == 2) {
        moebius_style.display = "block";
        moebius_a_handler.loadValues();
        moebius_b_handler.loadValues();
        moebius_c_handler.loadValues();
        moebius_d_handler.loadValues();
    }
    else if (transformation == 3) {
        exponent_style.display = "block";
        exponent_a_handler.loadValues();
        exponent_b_handler.loadValues();
    }
    
    setupShader();
    redraw();
    
}

function updateSamples(event) {
    samples = event.target.value;
    setupShader();
    redraw();
}

function updateCanvasSize(event) {

    canvas_size.value = event.target.value;
    
    var canvas = document.getElementById("fractal_canvas");
    var path_canvas = document.getElementById("path_canvas");

    canvas.width = canvas.height = path_canvas.width = path_canvas.height = canvas_size.value;
    canvas.style.maxHeight = canvas_size.value + "px";
    gl.viewport(0, 0, canvas_size.value, canvas_size.value);

    redraw();

}

function clearPath() {
    path_context.clearRect(0, 0, canvas_size.value, canvas_size.value);
}

function updateBlendingAlgorithm(event) {
    blending_algorithm = event.target.value;
    setupShader();
    redraw();
}

function updateDisplayText() {
    
    var text;
    
    if (program == ESCAPE_TIME || program == ROOT_FINDING) {
        text = `z = ${formatComplex(centre_x.value, centre_y.value)}`;
    }
    else {
        text = `centre = (${centre_x.value.toPrecision(6)}, ${centre_y.value.toPrecision(6)})`;
    }

    document.getElementById("display_text").innerHTML = text + `<br>Zoom = ${(1 / magnitude.value).toPrecision(5)}`;

}

async function playAnimation() {
    
    const frame_delay = document.getElementById("animation_frame_delay").value;
    const frames = document.getElementById("animation_duration").value * 1000 / frame_delay;
    const speed = document.getElementById("animation_speed").value;
    
    // todo
    const func = ESCAPE_TIME_ANIMATIONS[document.getElementById("esc_animations").value];
    
    busy = true;
    
    for (var frame_num = 0; frame_num < frames; frame_num++) {
        await new Promise(r => setTimeout(r, frame_delay));
        func(frame_num * speed * frame_delay);
        tryRedraw(true);
    }
    
    busy = false;
    
}

function resetView() {

    centre_x.value = program.default_centre_x;
    centre_y.value = program.default_centre_y;
    magnitude.value = program.default_magnitude;

    updateDisplayText();
    redraw();
}

function keyhandler(event) {
    
    switch (event.key.toLocaleLowerCase()) {
        
        case "r":
            resetView();
            break;
        
        case "w":
            centre_y.value -= 0.5 * magnitude.value;
            redraw();
            break;
        
        case "s":
            centre_y.value += 0.5 * magnitude.value;
            redraw();
            break;

        case "a":
            centre_x.value -= 0.5 * magnitude.value;
            redraw();
            break;

        case "d":
            centre_x.value += 0.5 * magnitude.value;
            redraw();
            break;
        
        case "=":
            magnitude.value /= 1.5;
            redraw();
            break;

        case "-":
            magnitude.value *= 1.5;
            redraw();
            break;
            
    }
    
    updateDisplayText();

}

function onFractalClick(event) {

    const centre = canvas_size.value / 2;
    centre_x.value += (event.x - centre) / centre * magnitude.value;
    centre_y.value += (event.y - centre) / centre * magnitude.value;
    redraw();
    
}