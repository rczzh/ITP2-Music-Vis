//scene serves as new 'canvas'
const scene = new THREE.Scene()
//camera acts as where the viewer's POV
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
//array to store newly created cubes
cubesArray = []

//constructor function for the visualisation
function Custom4() {
    //gets the div which the new 'canvas' would be appended to
    const threeDiv = document.getElementById("threeJS")
    //sets the canvas size to be of similar size of the window
    renderer.setSize(window.innerWidth, window.innerHeight)
    threeDiv.appendChild(renderer.domElement)

    //initial conditions of the light source which illuminates the 'canvas'
    const color = 0xFFFFFF
    const intensity = 0.5
    const light = new THREE.DirectionalLight(color, intensity);
    //light sources is then positioned and added to the scene
    light.position.set(1, 1, 1)
    scene.add(light)
    
    //creates cubes with random x, y, z positions
    //newly created cubes are then pushed into the array
    while(cubesArray.length < 50) {
        cube = new Cube(random(-15, 15), random(-15, 15), random(-15, 15), random(-0.1, 0.1), random(-0.1, 0.1), random(-0.1, 0.1))
        cubesArray.push(cube)
    }

    //initialise the coordinates of the camera
    camera.position.z = 75;
    camera.position.x = 0;
    camera.position.y = 0;
 
    //name of the visualiser
    this.name = "Bouncing Cubes"

    //draws the new 'canvas' along with the cubes
    this.draw = function() {
        //old p5.js canvas is 'cleard' thus becoming transparent
        //new 'canvas' is position behind the p5'js canvas, thus p5.js canvas has to be cleared
        clear()
        renderer.render( scene, camera );
        
        fourier.analyze()
        var amp = (fourier.getEnergy(20, 250) / 25)

        //iterates through the array and draws / update all cubes created
        //amp is used to increase the speed of the cubes
        for(var i = 0; i < cubesArray.length; i++) {
            cubesArray[i].drawCube()
            cubesArray[i].updateCube(amp)
        }
    }
}

//constructor function for each individual cube
//x determines the x coordinate of the cube
//y determines the y coordinate of the cube
//z determines the z coordinate of the cube
//velX determins the x-axis speed of the cube
//velY determins the y-axis speed of the cube
//velZ determins the Z-axis speed of the cube
function Cube(x, y, z, velX, velY, velZ) {

    //determines the limit which each cube is able to move before having to change directions
    this.boxLimit = 25

    //initial conditions of the cubes
    //material determines the texture and colour of cube
    //geometry determines the size of the cube
    this.material = new THREE.MeshPhongMaterial( { color: 0x00ff00, flatShading : true } );
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    //cube is created with those conditions
    const cube = new THREE.Mesh( this.geometry, this.material );
    //cube is added to the scene
    scene.add( cube );

    this.x = x
    this.y = y
    this.z = z

    this.velX = velX
    this.velY = velY
    this.velZ = velZ

    //positions the cube on the scene
    this.drawCube = function() {
        cube.position.x = this.x
        cube.position.y = this.y
        cube.position.z = this.z
    }

    //function to control the movement of the cubes
    //cubes are to movement within the box limit
    //cubes will 'bounce' off the walls of the box
    this.updateCube = function(amp) {
        if(this.x >= this.boxLimit) {
            this.velX = -(this.velX)
        }

        if(this.x <= -this.boxLimit) {
            this.velX = -(this.velX)
        }

        if(this.y >= this.boxLimit) {
            this.velY = -(this.velY)
        }

        if(this.y <= -this.boxLimit) {
            this.velY = -(this.velY)
        }

        if(this.z >= this.boxLimit) {
            this.velZ = -(this.velZ)
        }

        if(this.z <= -this.boxLimit) {
            this.velZ = -(this.velZ)
        }

        //condition to change the direction of the cube
        if(amp > 200) {
            this.velX = -(this.velX)
            this.velY = -(this.velY)
            this.velZ = -(this.velZ)
        }

        //cubes to move with the amplitude of the music
        //moves faster when the music is loud
        //moves slower when the music is soft
        this.x += this.velX * amp
        this.y += this.velY * amp
        this.z += this.velZ * amp
    }
}
