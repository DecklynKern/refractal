const BASIC_COLOURS = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FF00FF",
    "#00FFFF",
    "#FFFF00"
];

function hexToRGB(hex) {
    return [
        parseInt(hex.slice(1, 3), 16) / 256,
        parseInt(hex.slice(3, 5), 16) / 256,
        parseInt(hex.slice(5, 7), 16) / 256
    ];
}

function rgbToHex(r, g, b) {
    
    var r_str = r.toString(16);
    if (r_str.length == 1) {
        r_str = "0" + r_str;
    }
    
    var g_str = g.toString(16);
    if (g_str.length == 1) {
        g_str = "0" + g_str;
    }
    
    var b_str = b.toString(16);
    if (b_str.length == 1) {
        b_str = "0" + b_str;
    }
    
    return "#" + r_str + g_str + b_str;
}

function formatComplex(real, imag) {

    real = real.toPrecision(6);
    imag = imag.toPrecision(6);

    return `${real} ` + (imag > 0 ? "-" : "+") + ` ${Math.abs(imag)}i`;
    
}

function show(do_show) {
    return do_show ? "block" : "none";
}

function paramSet(param) {
    return function(event) {
        param.value = event.target.value;
        redraw();
    }
}

function paramSetColour(param) {
    return function(event) {
        param.value = hexToRGB(event.target.value);
        redraw();
    }
}

function paramSetWithRecompile(program, parameter) {
    return function(event) {
        program[parameter] = event.target.value;
        setupShader();
        redraw();
    }
}

class Param {
    
    constructor(value, name) {
        this.value = value;
        this.name = name;
        this.attr = null;
    }

    getAttr() {
        this.attr = gl.getUniformLocation(gl.program, this.name);
    }
}

class ParamFloat extends Param {
    load() {
        gl.uniform1f(this.attr, this.value);
    }
}

class ParamInt extends Param {
    load() {
        gl.uniform1i(this.attr, this.value);
    }
}

class ParamVec2 extends Param {
    load() {
        gl.uniform2f(this.attr, ...this.value);
    }
}

class ParamComplex extends Param {
    
    constructor(real, imag, name) {
        super(null, name);
        this.real = real;
        this.imag = imag;
    }

    load() {
        gl.uniform2f(this.attr, this.real, this.imag);
    }
}

class ParamVec3 extends Param {
    load() {
        gl.uniform3f(this.attr, ...this.value);
    }
}

class ParamFloatList extends Param {
    load() {
        gl.uniform1fv(this.attr, new Float32Array(this.value));
    }
}

class ParamVec3List extends Param {

    load() {

        var list = [];

        for (let vec3 of this.value) {
            list = list.concat(vec3);
        }
   
        gl.uniform3fv(this.attr, new Float32Array(list));
    
    }
}

class Program {
    
    baseShader = null;
    params = [];

    getShader() {
        return this.baseShader;
    }
    
    drawPath() {}

    setupAttrs() {
        for (let param of this.params) {
            param.getAttr();
        }
    }

    _load(params) {
        for (let param of params) {
            if (Array.isArray(param)) {
                this._load(param);
            }
            else {
                param.load();
            }
        }
    }

    loadAttrs() {
        this._load(this.params);
    }
}

class ComplexPickerHandler {

    constructor(canvas, params, scale, offset_real, offset_imag, info_div, template) {

        this.params = params;

        if (params.length == 1) {
            this.real = params[0].real;
            this.imag = params[0].imag;
        }
        else {
            this.real = params[0].value;
            this.imag = params[1].value;
        }
        
        this.scale = scale;
        this.unit_px = 100 / scale;
        
        this.offset_real = offset_real;
        this.offset_imag = offset_imag;
        
        this.info_div = info_div;
        this.template = template;

        var canvas_ref = document.getElementById(canvas);
        this.canvas_context = canvas_ref.getContext("2d");

        const t = this;
        canvas_ref.onmousemove = function(event) {
            t.updateComplex(event);
        };
        
        var x = (offset_real - offset_real + scale) * this.unit_px;
        var y = (offset_imag - offset_imag + scale) * this.unit_px;
        
        this.redraw(x, y);

    }
    
    redraw(x, y) {
    
        this.canvas_context.fillStyle = "white";
        this.canvas_context.fillRect(0, 0, 200, 200);
    
        this.canvas_context.beginPath();
        this.canvas_context.moveTo(0, 100);
        this.canvas_context.lineTo(200, 100);
        this.canvas_context.moveTo(100, 0);
        this.canvas_context.lineTo(100, 200);
        this.canvas_context.stroke();
        
        this.canvas_context.beginPath();
        this.canvas_context.arc(x, y, 4, 0, 2 * Math.PI);
        this.canvas_context.stroke();
        
    }
    
    loadValues() {

        if (this.params.length == 1) {
            this.params[0].real = this.real;
            this.params[0].imag = this.imag;
        }
        else {
            this.params[0].value = this.real;
            this.params[1].value = this.imag;
        }
    }

    updateComplex(event) {
    
        if (!mouse_down) {
            return;
        }
    
        var real = event.offsetX / this.unit_px - this.scale + this.offset_real;
        var imag = event.offsetY / this.unit_px - this.scale + this.offset_imag;

        if (this.params.length == 1) {
            this.params[0].real = real;
            this.params[0].imag = imag;
        }
        else {
            this.params[0].value = real;
            this.params[1].value = imag;
        }

        if (this.info_div) {
            document.getElementById(this.info_div).innerHTML = this.template.replace("$", formatComplex(real, imag));
        }
    
        this.redraw(event.offsetX, event.offsetY);
        redraw();
        
    }
}

const GRADIENT_WIDTH = 200;
const GRADIENT_HEIGHT = 100;
const GRADIENT_PAD = 5;
const GRADIENT_DRAW_WIDTH = GRADIENT_WIDTH - 2 * GRADIENT_PAD;
const GRADIENT_CIRCLE_Y = 20;
const GRADIENT_CIRCLE_RADIUS = 8;
const GRADIENT_BOX_WIDTH = 6;

class GradientHandler {

    constructor(canvas, init_min_colour, init_max_colour) {

        canvas.width = GRADIENT_WIDTH;
        canvas.height = GRADIENT_HEIGHT;

        this.selected_colour = 0;
        this.colours = [[0, init_min_colour], [1, init_max_colour]];
        this.context = canvas.getContext("2d");
        this.context.strokeWidth = 2;

        this.onColourNumChange = () => {};
        this.onColourChange = (_changed_idx) => {};

        const t = this;
        canvas.onmousedown = function(event) {
            t.onMouseDown(event);
        }
        canvas.ondblclick = function(event) {
            t.onDoubleClick(event);
        }
        canvas.onmousemove = function(event) {
            t.onMouseMove(event);
        }

        this.redraw();

    }

    getClickedColour = function(event) {

        for (var idx = 0; idx < this.colours.length; idx++) {

            if (Math.abs(event.offsetX - (GRADIENT_DRAW_WIDTH * this.colours[idx][0] + GRADIENT_PAD)) <= GRADIENT_CIRCLE_RADIUS) {
                return idx;
            }
        }

        return -1;

    }

    onMouseDown = function(event) {

        const clicked_colour = this.getClickedColour(event);

        if (clicked_colour != -1) {

            this.selected_colour = clicked_colour;

            if (event.offsetY < GRADIENT_CIRCLE_Y + GRADIENT_CIRCLE_RADIUS) {

                const colour_picker = document.getElementById("colour-picker");

                const t = this;

                colour_picker.value = this.colours[this.selected_colour][1];
                colour_picker.focus();
                colour_picker.click();
                colour_picker.onchange = function(event) {
                
                    t.colours[t.selected_colour][1] = event.target.value;
                    t.redraw();
                    t.onColourChange(clicked_colour);

                    mouse_down = false;
                
                }
            }

            return;

        }

        this.selected_colour = this.colours.length;
        this.colours.push([(event.offsetX - GRADIENT_PAD) / GRADIENT_DRAW_WIDTH, "#ffff00"]);
        this.redraw();
        this.onColourNumChange();

    }

    onDoubleClick = function(event) {

        const clicked_colour = this.getClickedColour(event);

        if (clicked_colour != -1) {
            this.colours.splice(clicked_colour, 1);
            this.redraw();
            this.onColourNumChange(this.colours.length - 1);
        }
    }

    onMouseMove = function(event) {

        if (!mouse_down) {
            return;
        }

        if (event.offsetX < GRADIENT_PAD || event.offsetX > GRADIENT_WIDTH - GRADIENT_PAD) {
            return;
        }

        this.colours[this.selected_colour][0] = (event.offsetX - GRADIENT_PAD) / GRADIENT_DRAW_WIDTH;
        this.redraw();
        this.onColourChange(this.selected_colour);

    }

    redraw() {

        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, GRADIENT_WIDTH, GRADIENT_HEIGHT);

        const gradient = this.context.createLinearGradient(
            GRADIENT_PAD,
            GRADIENT_HEIGHT / 2,
            GRADIENT_WIDTH - GRADIENT_PAD, 
            GRADIENT_HEIGHT / 2
        );

        var min_colour = "black";
        var min_pos = 2.0;

        var max_colour = "black";
        var max_pos = -1.0;

        for (let colour of this.colours) {
            if (colour[0] < min_pos) {
                [min_pos, min_colour] = colour;
            }
            if (colour[0] > max_pos) {
                [max_pos, max_colour] = colour;
            }
        }

        gradient.addColorStop(0, min_colour);
        this.colours.forEach(colour => gradient.addColorStop(...colour));
        gradient.addColorStop(1, max_colour);

        this.context.fillStyle = gradient;
        this.context.fillRect(GRADIENT_PAD, 40, GRADIENT_DRAW_WIDTH, 60);

        for (let colour of this.colours) {

            const x = GRADIENT_PAD + GRADIENT_DRAW_WIDTH * colour[0];
            
            this.context.fillStyle = colour[1];
            
            this.context.beginPath();
            
            this.context.arc(x, GRADIENT_CIRCLE_Y, GRADIENT_CIRCLE_RADIUS, 0, 2 * Math.PI);
            this.context.fill();
            
            const left = x - GRADIENT_BOX_WIDTH / 2;
            const right = x + GRADIENT_BOX_WIDTH / 2;
            const top = GRADIENT_CIRCLE_Y + GRADIENT_CIRCLE_RADIUS;
            const bottom = GRADIENT_HEIGHT;
            
            this.context.moveTo(left, top);
            this.context.lineTo(left, bottom);
            this.context.lineTo(right, bottom);
            this.context.lineTo(right, top);
            
            this.context.stroke();
         
        }
    }
}

function getGradientHandler(id) {
    return gradients[document.getElementById(id).gradient_idx];
}