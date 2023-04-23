var concussive = {mainColor: "rgb(255, 0, 0)", sineColor: "rgb(255, 69, 0)"}
var theme = concussive

//constructor function to draw visuals
function Custom3() {
    //name of the visualisation
    this.name = "Concussive";
    angleMode(DEGREES);

    //init of construtor objects
    soundWaveEmit = new SoundWaveEmitter();
    ringEmit = new RingEmitter();
    mascot1 = new Mascot();
    shardEmit = new ShardClustersEmitter();
    
    this.draw = function() {
        //updating the value of amp
        fourier.analyze();
        var amp = fourier.getEnergy(20, 250);

        push();
        ringEmit.startEmitter();
        ringEmit.updateRings();
        pop();

        push();
        soundWaveEmit.startEmitter();
        soundWaveEmit.updateSoundWaves();
        pop();

        push();
        shardEmit.startEmitter(amp > 160);
        shardEmit.updateClusterEmitter();
        pop();

        push();
        mascot1.draw();
        pop();

    } 
}

//constructor function for visualisation
function SoundWave() {
    //initial states for the sound wave
    this.radius = -200;
    this.inc = 5;

    //function to draw the red sound wave
    this.draw = function() { 
        var amp = fourier.getEnergy(20, 200);
        var wave = fourier.waveform();

        push();
        //translated so that the sound wave is position in the center of the window
        translate(width/2, height/2);
        noFill();
        stroke("rgba(255, 69, 0, 1)");
        strokeWeight(10);
        angleMode(DEGREES);

        //the sound waves are 2 mirrored halfs, joined together to form a complete ring
        //draws right half of the sound wave ring
        beginShape();
        for(var i = 0; i <= 180; i += 10) {
            var index = floor(map(i, 0, 360, 0, wave.length - 1));
            var r = map(wave[index], 0, 1, this.radius, this.radius + 400);
            var x = r * sin(i);
            var y = r * cos(i);
            vertex(x, y);
        }
        endShape()
        //draws the left half of the sound wave ring
        beginShape();
        for(var i = 0; i <= 180; i += 10) {
            var index = floor(map(i, 0, 360, 0, wave.length - 1));
            var r = map(wave[index], 0, 1, this.radius, this.radius + 400);
            var x = r * -sin(i);
            var y = r * cos(i);
            vertex(x, y);
        }
        endShape();
        pop();
    }

    //controls to radiate the ring outwards
    this.update = function() {
        this.radius += this.inc;
    }
}

//constructor function to manage the state and position of each sound waves
function SoundWaveEmitter() {
    this.interval = 0;
    this.inc = 2;
    //array to store any newly created sound waves
    this.soundWaves = [];

    //function to create new sound wave
    this.addSoundWave = function() {
        var sW = new SoundWave();
        return sW;
    }

    //function to push newly created sound wave into an array
    this.startEmitter = function() {

        //controls the interval between the creation of sound wave rings
        if(this.interval == 250) {
            this.soundWaves.push(this.addSoundWave());
            //'clock' is reset after a sound wave is created
            //'clock' then starts to count up again
            this.interval = 0;
        }
        this.interval += this.inc;
    }

    //function to update the cordinates and state of the sound waves
    this.updateSoundWaves = function() {
        for(var i = this.soundWaves.length - 1; i >= 0; i--) {
            //draws the sound wave
            if(this.soundWaves[i].radius >= 0) {
                this.soundWaves[i].draw();
            }
            this.soundWaves[i].update();

            //condition to remove any sound waves that exceeds the window
            //prevents overloading of the program
            if(this.soundWaves[i].radius > 800) {
                this.soundWaves.splice(i, 1);
            }
        }
    }
}

//constructor for the visualisation
function Mascot() {
    //initial conditions / coordinates of the drawing of the mascot
    this.offset = 0;
    this.headRadius = 175;
    //starting cordinates are set as such so the visualisation appears in the center of the window
    this.x = width / 2;
    this.y = height / 2;
    this.vel = 0.5;
    this.timer = 0;
    this.count = 1;

    this.draw = function() {
        this.update();
    }

    this.head = function() {
        //draws left sine wave
        push();
        noFill();
        stroke(theme.sineColor);
        strokeWeight(25);

        angleMode(RADIANS);
        push();
        beginShape();
        for(var i = 0; i < width / 2; i++) {
            var angle = this.offset + i * 0.01;
            var y = map(sin(angle), -1, 1, height/2 - 50, height/2 + 50);
            vertex(i, y);
        }
        endShape();
        pop();
        //draws right sine wave
        push();
        //translate the sine wave to the left side of the window
        translate(width, height);
        rotate(PI);
        beginShape();
        for(var i = 0; i < width / 2; i++) {
            var angle = this.offset + i * 0.01;
            //left sine wave is inverted to mirror the right side sine wave
            var y = map(-sin(angle), -1, 1, height/2 - 50, height/2 + 50);
            vertex(i, y);
        }
        endShape();
        pop();
        //controls for progression of sine wave
        //creates the 'wave' effect
        this.offset += 0.1;
        pop();

        push();
        stroke(theme.mainColor);
        fill(0);
        //draws left headset
        triangle(this.x - 200, this.y, this.x - 75, this.y + 75, this.x - 75, this.y -75);
        triangle(this.x - 175, this.y - 200, this. x - 75, this.y + 75, this.x, this.y);
        //draws right headset
        triangle(this.x + 200, this.y, this.x + 75, this.y + 75, this.x + 75, this.y -75);
        triangle(this.x + 175, this.y - 200, this. x + 75, this.y + 75, this.x, this.y);

        ellipse(this.x, this.y, this.headRadius);
        pop();
    }
    
    this.update = function() {
        //center of the window to be the starting point
        this.x = width / 2;

        //controls to bob the head of mascot up and down
        if(this.timer == 15) {
            this.vel = -this.vel;
            this.count = -this.count;
        }
        if(this.timer == -15) {
            this.vel = -this.vel;
            this.count = -this.count;
        }
        
        this.y += this.vel;
        this.timer += this.count;

        this.head();
    }
}

//constructor function for the purple ring visualisation
function Ring() {
    //intial condition and coordinates of the visualisation
    //x and y are such so that starting point of the visualisation is in the center of the window
    this.x = width/2;
    this.y = height/2;
    this.radius = 100;
    this.speed = 0.05;
    this.arcStart = 0;
    this.arcEnd =  2 * PI / 3;
    this.random = random(-10, 10);

    //creates the purple gradient for the ring
    //higher opacity at the out edge while lower opacity closer to the center of the ring
    this.radialGrad = function(sX, sY, sR, eX, eY, eR) {
        var gradient = drawingContext.createRadialGradient(sX, sY, sR, eX, eY, eR);
        gradient.addColorStop(0.35, color("rgba(75, 0, 130, 0)"));
        gradient.addColorStop(1, color("rgba(75, 0, 130, 1)"));
        drawingContext.fillStyle = gradient;
    }

    //function to draw the ring
    this.drawRing = function() {
        angleMode(RADIANS);

        //determinds the starting and ending point of the colour gradient
        this.radialGrad(this.x, this.y, 0, this.x, this.y, this.radius);
        ellipse(this.x, this.y, this.radius);
  
        push();
        noFill();

        //draws inner trail effects of the purple ring
        stroke(148, 0, 211);
        for(var i = 1; i < 10; i++) {
            arc(this.x, this.y, this.radius - 20 * i, this.radius - 20 * i, this.arcStart + this.random * i, this.arcEnd + this.random * i);
        }
        pop();
    }

    //controls and updates the coordinate of the ring
    this.updateRing = function(cond) {
        this.x = width/2;
        this.y = height/2;
        this.radius += 10;
        this.arcStart += this.speed;
        this.arcEnd += this.speed;
    }
}

//constructor function to manage the state and coordinates of newly created rings
function RingEmitter() {
    this.interval = 0;
    this.inc = 2;
    //array to store the newly created rings
    this.rings = [];

    //function to add new ring
    this.addRing = function() {
        var r = new Ring();
        return r;
    }

    //function to push nrw ring at fixed intervals
    this.startEmitter = function() {
        //a new ring is generated at a fixed interval
        if(this.interval == 250) {
            //when a ring is newly created, 'clock' is reset and starts counting up again
            this.rings.push(this.addRing());
            this.interval = 0;
        }
        this.interval += this.inc;
    }

    //function to control the expansion and removal of rings
    this.updateRings = function() {
        for(var i = this.rings.length - 1; i >= 0; i--) {
            this.rings[i].drawRing();
            this.rings[i].updateRing();

            //ring is removed when it exceeds the window size
            //prevents overloading of the program
            if(this.rings[i].radius > 2000) {
                this.rings.splice(i, 1);
            }
        }
    }
}

//constructor function for visualisation
function ShardVertice() {
    //initial conditions and coordinates of each shard vertice
    this.x = width / 2;
    this.y = height / 2;
    this.movementLimit = 10;
    this.size = 0;
    //each shard vertice is randomly position
    this.randomX = random(-40, 40);
    this.randomY = random(-40, 40);
    this.ellipseX = this.x + this.randomX;
    this.ellipseY = this.y + this.randomY;

    //controls and updates the coordinates of the shard vertices
    this.updateSV = function(vector) {
        this.ellipseX += vector.x;
        this.ellipseY += vector.y;
    }
} 

//constructor function to control shard cluster; shard clusters consist of shard vertices
function ShardCluster() {
    //array to store the shard vertices
    this.shardClusterArr = [];

    //function to create shard vertices
    this.addShardVertice = function() {
        var sV = new ShardVertice();
        return sV;
    }
    
    //function to push newly created shard vertices into the array
    this.makeShardCluster = function() {
        this.shardClusterArr.push(this.addShardVertice());
    }

    //function to control the coordinates of each shard cluster
    this.updateShardCluster = function(vector) {
        for(var i = 0; i < this.shardClusterArr.length; i++) {
            this.shardClusterArr[i].updateSV(vector);
            for(var j = 0; j < this.shardClusterArr.length; j++) {
                //within each shard cluster, the shard vertices are connected together to form a 'crystal shard'
                if(this.shardClusterArr[i] != this.shardClusterArr[j]) {
                    stroke(255, 69, 0);
                    line(this.shardClusterArr[i].ellipseX, this.shardClusterArr[i].ellipseY, this.shardClusterArr[j].ellipseX, this.shardClusterArr[j].ellipseY);
                }
            }
        }
    }

    //generates shard cluter with 5 vertices
    for(var i = 0; i < 5; i ++) {
        this.makeShardCluster();
    }
}

//constructor function to manage the coordinate and state of each shard cluter
function ShardClustersHandler() {
    angleMode(DEGREES)
    this.lifetime = 0;
    this.inc = 2;
    //array to store newly created shard cluters
    this.shardClustersArr = [];
    //array to store vector that is used to move the shard clusters
    this.rotatedVectorArr = [];

    //function to create new shard cluter
    this.addShardCluster = function() {
        var sC = new ShardCluster();
        return sC;
    }

    //function to push newly created shard cluster into array
    this.makeShardClusters = function() {
        this.shardClustersArr.push(this.addShardCluster());
    }

    //generates 12 shardCluster
    for(var i = 0; i < 12; i++) {
        this.makeShardClusters();
    }

    //creates vectors which are then used to reposition the shard clusters
    this.rotateVector = function(index) {
        var v = createVector(3, 0);
        var newIndex = map(index, 1, this.shardClustersArr.length, 1, 2);
        //rotates the shard clusters
        var rV = v.rotate(30 * index).mult(newIndex * 5);
        return rV;
    }

    for(var i = 0; i < this.shardClustersArr.length; i++) {
        this.rotatedVectorArr.push(this.rotateVector(i));
    }
    
    //function to control the coordinate of the shard clusters
    //causes the shard cluters to radiate and move away from the center of the window
    this.updateShardClusters = function() {
        for(var i = this.shardClustersArr.length - 1; i >= 0; i--) {
            this.shardClustersArr[i].updateShardCluster(this.rotatedVectorArr[i]);
        }
        this.lifetime += this.inc;
    }
}

//constructor function to control and manage sets of shard cluters
function ShardClustersEmitter() {
    this.count = 0;
    this.inc = 1;
    //array to contain shard clusters that are altered by vector
    this.shardClustersEmitterArr = [];

    //creates one set of shard clusters
    this.addClusterSet = function() {
        var clusterSet = new ShardClustersHandler();
        return clusterSet;
    }

    //controls the creation of set of shard cluters via fixed intervals
    this.startEmitter = function(cond) {
        
        //set of shard cluter is created when conditions are met
        if(cond && this.count >= 250) {
            this.shardClustersEmitterArr.push(this.addClusterSet());
            //count is then reset, and the 'clock' starts counting up again before creating another set of shard clusters
            this.count = 0;
        }
        this.count += this.inc;
    }

    //function to handle state and coordinate of the set of shard cluters
    this.updateClusterEmitter = function() {
        for(var i = this.shardClustersEmitterArr.length - 1; i >= 0; i--) {
            this.shardClustersEmitterArr[i].updateShardClusters();

            //removes set of shard clusters that are beyond the screen of the window
            if(this.shardClustersEmitterArr[i].lifetime > 100) {
                this.shardClustersEmitterArr.splice(i, 1);
            }
        }
    }
}