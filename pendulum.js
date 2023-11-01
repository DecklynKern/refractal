class Pendulum extends Program {

    shader = "shaders/pendulum.glsl";
    options_panel = "pendulum_options";

    iterations = 400;

    friction = new ParamFloat(0.01, "friction");
    tension = new ParamFloat(0.75, "tension");
    mass = new ParamFloat(1.0, "mass");
    dt = new ParamFloat(0.02, "dt");
    
    colouring_style = 0;
    
    base_colour = new ParamVec3([0.0, 0.0, 0.0], "base_colour");

    params = [
        this.friction,
        this.tension,
        this.mass,
        this.dt,
        this.base_colour
    ];

    magnet_strengths = [];
    magnet_strengths_attr = null;
    
    magnet_positions = [];
    magnet_positions_attr = null;

    magnet_colours = [];
    magnet_colours_attr = null;

    getShader() {

        var def = `//%
        #define ITERATIONS ${this.iterations}
        #define MAGNET_COUNT ${this.magnet_strengths.length}
        #define COLOURING_STYLE ${this.colouring_style}`;

        return this.baseShader.replace("//%", def);

    }
    
    magnet_clicked = 0;

    setupGUI() {

        document.getElementById("pend_iterations").onchange = paramSetWithRecompile(this, "iterations");
        
        document.getElementById("pend_friction").onchange = paramSet(this.friction);
        document.getElementById("pend_tension").onchange = paramSet(this.tension);
        document.getElementById("pend_mass").onchange = paramSet(this.mass);
        document.getElementById("pend_dt").onchange = paramSet(this.dt);
        
        document.getElementById("pend_colouring_style").onchange = paramSetWithRecompile(this, "colouring_style");
        
        document.getElementById("pend_base_colour").onchange = paramSetColour(this.base_colour);

        this.addMagnet(false);
        this.addMagnet(false);
        this.addMagnet(false);

        this.magnet_positions = [
             1.0,  0,
            -0.5, -0.866025404,
            -0.5,  0.866025404
        ];
        
        document.getElementById("magnet_selector").onmousedown = this.clickMagnet;
        document.getElementById("magnet_selector").onmousemove = this.updateMagnets;
        
        this.magnet_canvas_context = document.getElementById("magnet_selector").getContext("2d");
        this.drawMagnets();
        
    }

    setupAttrs() {

        super.setupAttrs();

        this.magnet_strengths_attr = gl.getUniformLocation(gl.program, "magnet_strengths");
        this.magnet_positions_attr = gl.getUniformLocation(gl.program, "magnet_positions");
        this.magnet_colours_attr = gl.getUniformLocation(gl.program, "magnet_colours");

    }

    loadAttrs() {

        super.loadAttrs();

        gl.uniform1fv(this.magnet_strengths_attr, this.magnet_strengths);
        gl.uniform2fv(this.magnet_positions_attr, this.magnet_positions);
        gl.uniform3fv(this.magnet_colours_attr, this.magnet_colours);

    }

    addMagnet(redraw_all) {

        var magnetNum = PENDULUM.magnet_strengths.length;
        var colour = BASIC_COLOURS[magnetNum % BASIC_COLOURS.length];

        var new_magnet_del_button = document.createElement("button");
        var new_magnet_div1 = document.createElement("div");
        var new_magnet_div2 = document.createElement("div");
        new_magnet_div1.className = new_magnet_div2.className = "grid-entry";

        new_magnet_div1.innerHTML = `Strength:
        <input type=number value=9.0 min=0 step=0.1 onchange="PENDULUM.setMagnetStrength(event, ${magnetNum})">`;

        new_magnet_div2.innerHTML = `Colour:
        <input type=color value=${colour} onchange="PENDULUM.setMagnetColour(event, ${magnetNum}); PENDULUM.drawMagnets()">`

        var magnets = document.getElementById("magnets")
        magnets.appendChild(document.createElement("hr"));
        magnets.appendChild(new_magnet_div1);
        magnets.appendChild(new_magnet_div2);

        PENDULUM.magnet_strengths.push(9);
        PENDULUM.magnet_positions.push(Math.random() * 2 - 1, Math.random() * 2 - 1);
        PENDULUM.magnet_colours.push(...hexToRGB(colour));
        
        if (redraw_all) {
            PENDULUM.drawMagnets();
            setupShader();
            redraw();
        }
    }
    
    deleteMagnet() {
        
        if (PENDULUM.magnet_strengths.length == 1) {
            return;
        }
        
        PENDULUM.magnet_strengths.pop();
        
        PENDULUM.magnet_positions.pop();
        PENDULUM.magnet_positions.pop();
        
        PENDULUM.magnet_colours.pop();
        PENDULUM.magnet_colours.pop();
        PENDULUM.magnet_colours.pop();
        
        var magnets = document.getElementById("magnets");
        
        magnets.removeChild(magnets.lastChild);
        magnets.removeChild(magnets.lastChild);
        magnets.removeChild(magnets.lastChild);
    
        PENDULUM.drawMagnets();
        setupShader();
        redraw();
    
    }

    setMagnetColour(event, idx) {
        [PENDULUM.magnet_colours[3 * idx], PENDULUM.magnet_colours[3 * idx + 1], PENDULUM.magnet_colours[3 * idx + 2]] = hexToRGB(event.target.value);
        redraw();
    }

    setMagnetStrength(event, idx) {
        PENDULUM.magnet_strengths[idx] = event.target.value;
        redraw();
    }

    clickMagnet(event) {
        
        var min_root = 0;
        var min_dist = 99999999;
        
        for (var i = 0; i < PENDULUM.magnet_strengths.length; i++) {
            
            const dx = 100 + 50 * PENDULUM.magnet_positions[2 * i] - event.offsetX;
            const dy = 100 + 50 * PENDULUM.magnet_positions[2 * i + 1] - event.offsetY;
            const dist = dx * dx + dy * dy;
            
            if (dist < min_dist) {
                min_dist = dist;
                min_root = i + 1;
            }
        }
        
        if (min_dist > 20) {
            min_root = 0;
        }
        
        PENDULUM.root_clicked = min_root;
        
    }

    updateMagnets(event) {
        
        if (!mouse_down) {
            PENDULUM.root_clicked = 0;
            return;
        }
        
        if (PENDULUM.root_clicked != 0) {
            PENDULUM.magnet_positions[PENDULUM.root_clicked * 2 - 2] = (event.offsetX - 100) / 50;
            PENDULUM.magnet_positions[PENDULUM.root_clicked * 2 - 1] = (event.offsetY - 100) / 50;

            PENDULUM.drawMagnets();
            redraw();
            
        }
    }

    drawMagnets() {

        this.magnet_canvas_context.clearRect(0, 0, 200, 200);

        this.magnet_canvas_context.beginPath();
        this.magnet_canvas_context.strokeStyle = "black";
        this.magnet_canvas_context.moveTo(0, 100);
        this.magnet_canvas_context.lineTo(200, 100);
        this.magnet_canvas_context.moveTo(100, 0);
        this.magnet_canvas_context.lineTo(100, 200);
        this.magnet_canvas_context.stroke();
        
        for (var i = 0; i < PENDULUM.magnet_strengths.length; i++) {
            
            this.magnet_canvas_context.strokeStyle = rgbToHex(
                256 * PENDULUM.magnet_colours[3 * i],
                256 * PENDULUM.magnet_colours[3 * i + 1],
                256 * PENDULUM.magnet_colours[3 * i + 2]
            )
            
            this.magnet_canvas_context.beginPath();
            this.magnet_canvas_context.arc(100 + 50 * PENDULUM.magnet_positions[2 * i], 100 + 50 * PENDULUM.magnet_positions[2 * i + 1], 4, 0, 2 * Math.PI);
            this.magnet_canvas_context.stroke();
            
        }
    }

    drawPath(event) {

        if (program != PENDULUM) {
            return;
        }
        
        clearPath();

        var pos = [
            (event.layerX / canvas_size.value * 2 - 1) * magnitude.value + centre_x.value,
            (event.layerY / canvas_size.value * 2 - 1) * magnitude.value + centre_y.value
        ];

        var velocity = [0, 0];
        var accel_prev = [0, 0];

        path_context.beginPath();
        path_context.strokeStyle = "white";

        for (var iteration = 0; iteration < PENDULUM.iterations; iteration++) {
        
            path_context.lineTo(
                ((pos[0] - centre_x.value) / magnitude.value + 1) * canvas_size.value / 2,
                ((pos[1] - centre_y.value) / magnitude.value + 1) * canvas_size.value / 2
            );

            var accel = [0, 0];

            for (var i = 0; i < PENDULUM.magnet_strengths.length; i++) {

                const offset = [PENDULUM.magnet_positions[2 * i] - pos[0], PENDULUM.magnet_positions[2 * i + 1] - pos[1]];
                const dist_sq = offset[0] * offset[0] + offset[1] * offset[1] + 0.1;
                const str = PENDULUM.magnet_strengths[i] * Math.pow(dist_sq, -1.5);

                accel[0] += str * offset[0];
                accel[1] += str * offset[1];

            }

            accel[0] -= PENDULUM.tension.value * pos[0];
            accel[1] -= PENDULUM.tension.value * pos[1];

            accel[0] -= PENDULUM.friction.value * velocity[0];
            accel[1] -= PENDULUM.friction.value * velocity[1];
            
            accel[0] = accel[0] / PENDULUM.mass.value;
            accel[1] = accel[1] / PENDULUM.mass.value;

            velocity[0] += accel[0] * PENDULUM.dt.value;
            velocity[1] += accel[1] * PENDULUM.dt.value;

            pos[0] += velocity[0] * PENDULUM.dt.value + 0.166666666 * (4 * accel[0] - accel_prev[0]) * PENDULUM.dt.value * PENDULUM.dt.value;
            pos[1] += velocity[1] * PENDULUM.dt.value + 0.166666666 * (4 * accel[1] - accel_prev[1]) * PENDULUM.dt.value * PENDULUM.dt.value;

            accel_prev = accel;

        }

        path_context.stroke();

    }
}