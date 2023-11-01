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

    loadAttrs() {
        for (let param of this.params) {
            param.load();
        }
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
        var t = this;
        canvas_ref.onmousemove = function(event) {
            t.updateComplex(event);
        };
        
        var x = (offset_real - offset_real + scale) * this.unit_px;
        var y = (offset_imag - offset_imag + scale) * this.unit_px;
        
        this.redraw(x, y);

    }
    
    redraw(x, y) {
    
        this.canvas_context.clearRect(0, 0, 200, 200);
    
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
        this.real_param.value = this.real;
        this.imag_param.value = this.imag;
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