//constructor function to draw visuals
function Custom1() {
    frameRate(60);
    //name of the visualisation
    this.name = "SoundWave";
    this.isBeat = false;

    //init of constructor objects
    emit = new Emitter();
    noiseCircle = new NoiseCircle();
    afterEffects = new AfterEffects();
    beatDetect = new BeatDetector();
    bg = new BG();

    this.draw = function() {
        //updating the value of amp
        var spectrum = fourier.analyze();
        var amp = fourier.getEnergy(20, 200);

        //conditions of beat detection
        if(beatDetect.detectBeat(spectrum)) {
            this.isBeat = true;
        } else {
            this.isBeat = false;
        }
        
        bg.draw();

        push();
        afterEffects.draw();
        afterEffects.updateAfterEffects(this.isBeat);
        pop();

        push();
        //translated so that visual starting point is the center of the window
        translate(width/2, height/2);
        if(sound.isPlaying()) {
            emit.startEmitter();
            emit.updateParticles(this.isBeat); 
        }
        pop();

        push();
        noiseCircle.draw();
        noiseCircle.updateNoiseCircle(this.isBeat);
        pop();
    }
}

//constructor function for beat detection
function BeatDetector() {
    this.sampleBuffer = [];

    this.detectBeat = function(spectrum) {
        var sum = 0;
        var varianceSum = 0;
        var isBeat = false;

        for(var i = 0; i < spectrum.length; i++) {
            sum += spectrum[i] * spectrum[i];
        }

        if(this.sampleBuffer.length == 60) {
            var sampleSum = 0;
            for(var i = 0; i < this.sampleBuffer.length; i++) {
                sampleSum += this.sampleBuffer[i];
            }

            var sampleAverage = sampleSum / this.sampleBuffer.length;
            var variance = varianceSum / this.sampleBuffer.length;

            for(var i = 0; i < this.sampleBuffer.length; i++) {
                varianceSum += this.sampleBuffer[i] - sampleAverage;
            }

            var m = -0.15 / (25 - 200);
            var b = 1 + (m * 200);
            var c = (m * variance) + b;

            if(sum > sampleAverage * c) {
                isBeat = true;
            }
            this.sampleBuffer.splice(0, 1)
            this.sampleBuffer.push(sum);
        } else {
            this.sampleBuffer.push(sum);
        }
        return isBeat;
    }
}

//constructor function for visualisation
function NoiseCircle() {
    this.x = 75;
    this.limit = 75;
    this.space = 1;

    this.draw = function() {
        fill(255);
        //translated so that visualisation is created in the center of the window
        translate(width / 2, height / 2);
        angleMode(DEGREES);
        this.spectrum = fourier.analyze();

        //draws the upper half of the outer ring
        for(var i = 0; i < 180; i += this.space) {
            var w = map(this.spectrum[i], 0, 255, 0, width / 8);
            
            fill(37, 255, 255);
            rotate(this.space);
            rect(this.x, 0, w, 2.5);
        }

        //draws the lower half of the outer ring
        for(var i = 180; i < 360; i += this.space) {
            var w = map(this.spectrum[i - 180], 0, 255, 0, width / 8);
            
            fill(37, 255, 255);
            rotate(this.space);
            rect(this.x, 0, w, 2.5);
        }

        //draws the upper half of the center ring
        for(var i = 0; i < 180; i += this.space) {
            var w = map(this.spectrum[i], 0, 255, 0, width / 12);
            
            fill(220, 20, 60);
            rotate(this.space);
            rect(this.x, 0, w, 2.5);
        }

        //draws the lower half of the center ring
        for(var i = 180; i < 360; i += this.space) {
            var w = map(this.spectrum[i - 180], 0, 255, 0, width / 12);
            
            fill(220, 20, 60);
            rotate(this.space);
            rect(this.x, 0, w, 2.5);
        }

        //draws the upper half of the inner ring
        for(var i = 0; i < 180; i += this.space) {
            var w = map(this.spectrum[i], 0, 255, 0, width / 16);
            
            fill(0);
            rotate(this.space);
            rect(this.x, 0, 1 + w, 2.5);
        }

        //draws the lower half of the inner ring
        for(var i = 180; i < 360; i += this.space) {
            var w = map(this.spectrum[i - 180], 0, 255, 0, width / 16);
            
            fill(0);
            rotate(this.space);
            rect(this.x, 0, 1 + w, 2.5);
        }

    }

    //controls the size of the starting point of the rings.
    //size increases when a beat is detected, and shrinks back to original when not detected.
    this.updateNoiseCircle = function(cond) {
        if(cond && this.x == this.limit) {
            this.x += 10;
        } else {
            if(this.x > this.limit) {
                this.x += -1;
            }
        }
    }
}

//constructor function for particles effect
function Particle() {
    //initialise starting conditions of the particle.
    this.pos = p5.Vector.random2D().mult(120);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.001, 0.0001));

    //draws a particle
    this.drawParticle = function() {
        noStroke();
        fill(255);
        ellipse(this.pos.x, this.pos.y, 3);
    }

    //updates the position of the particle
    this.updateParticle = function() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
    }
}

//constructor function to control the state of the particles
function Emitter() {
    this.startParticle = 0;
    this.lifetime = 0;

    //array to store any newly created particles
    this.particles = [];
    //function to create new particles
    this.addParticle = function() {
        var p = new Particle();
        return p;
    }
    //function to start generating particles and pushes them into the array
    this.startEmitter = function() {
        this.particles.push(this.addParticle());
    }
    //function to control the state of the particles
    //manages the position and location of the particles
    this.updateParticles = function(cond) {
        for(var i = this.particles.length - 1; i>= 0; i--) {
            this.particles[i].drawParticle();
            this.particles[i].updateParticle();

            //if condition is met, the particles are sped up
            if(cond) {
                this.particles[i].updateParticle();
                this.particles[i].updateParticle();
            }

            //condition to remove particles that goes beyond the screen.
            //prevents overloading of the program by removing particles that are no longer rendered
            if(this.particles[i].pos.x < -width / 2 || this.particles[i].pos.x > width / 2 || this.particles[i].pos.y < -height / 2 || this.particles[i].pos.y > height / 2) {
                this.particles.splice(i, 1);
            }
        }
    }
    
}

//construction function to control the brightness of the background
function AfterEffects() {
    //initialisation of initial conditions of the 'screen' being drawn
    //starts from the upper left of the screen, ends at the bottom right, spans the entire window.
    this.x = 0;
    this.y = 0;
    this.length = width;
    this.height = height;
    this.opacity = 0.85;
    this.inc = 0.01;

    //draws the 'filter'
    this.draw = function() {
        noStroke();
        fill(`rgba(0, 0, 0, ${this.opacity})`);
        rect(this.x, this.y, this.length, this.height);
    }

    //controls for the opacity of the filter
    //when conditions are met, the opacity of the filter decreases, thus 'increasing the brightness'
    //afterwards, the opacity increases and returns to 'dark' mode
    this.updateAfterEffects = function(cond) {
        if(cond && this.opacity >= 0.1) {
            this.opacity += -this.inc;
        } else {
            if(this.opacity < 0.85) {
                this.opacity += this.inc / 2;
            }
        }

        this.length = width;
        this.height = height;
    }
}

//constructor function for the background image.
function BG() {
    //this.x and this.y are set as so to create a 'pivot' for the image that
    //is positioned at the center of the window
    this.x = width / 2;
    this.y = height / 2;
    this.velX = 0.1;
    this.velY = 0.1;
    this.angle = 0;
    this.tilt = 0.01;

    //draws and updates the position and state of the background image
    this.draw = function() {
        this.backgroundShake();
        this.updateBG();
    }

    this.backgroundShake = function() {
        push();
        //repositions the background image
        translate(width / 2, height / 2);
        //rotates the background image to create a dynamic background
        rotate(this.angle);
        image(backgroundImg, this.x - width / 2, this.y - height / 2, width + 100, height + 100);
        pop();
    }
    
    //controls / limits the movement of the background shake
    this.updateBG = function() {
        //controls the x and y axis movement of the background image
        if(this.x >= (width / 2) + 5) {
            this.velX = -this.velX;
        }
        if(this.x <= (width / 2) - 5) { 
            this.velX = -this.velX;
        }
        if(this.y >= (height / 2) + 5) {
            this.velY = -this.velY;
        }
        if(this.y <= (height / 2) - 5) { 
            this.velY = -this.velY;
        }

        //controls the tilt of the background image
        if(this.angle >= 1) {
            this.tilt = -this.tilt;
        }
        if(this.angle <= -1) {
            this.tilt = -this.tilt;
        }

        this.angle += this.tilt;
        this.x += this.velX;
        this.y += this.velY;
    }
}