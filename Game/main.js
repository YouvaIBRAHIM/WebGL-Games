import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./orbitControl.js";
import { GLTFLoader } from "./gltfLoader.js";

const presentationrId = document.querySelector('#presentation');
const scoreId = document.querySelector('#score');
const bestScoreId = document.querySelector('#bestScore');
const levelId = document.querySelector('#level');
const lifesId = document.querySelector('#lifes');
const gameOverId = document.querySelector('#gameOver');
const restartButton = document.querySelector('#restart');
const startButton = document.querySelector('#start');
let asteroids = [];
let hearts = [];
let rings = [];
let vaisseau;
let currentSpeed = 0.2;
let am_I_touchable = true;
let lifeLimit = true;
let ringLimit = true;
let play = true;
let stopMoving = true;
let stopScore = true;
let scoreMultiplication = 1;
let cameraPerspective = 1;

const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.01, 300);
const renderer = new THREE.WebGLRenderer({antialias : true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const control = new OrbitControls(camera, renderer.domElement);
renderer.render(scene, camera);
const origin = new THREE.Vector3(0,0,0);
const direction = new THREE.Vector3(1,1,1);
direction.normalize();
const raycaster = new THREE.Raycaster(origin, direction,0,100);


bestScoreId.innerHTML = 'Best Score : ' + localStorage.getItem('bestscore');

/**
 * permet d'avoir un nombre aléatoire
 * @param {number} max 
 */
function random(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
/**
 * permet de gérer le bouton start qui lance le jeu
 */
function startGame() {
    startButton.addEventListener('click', (event) =>{
        event.preventDefault();
        startButton.style.display = 'none';
        presentationrId.style.display = 'none';
        //lance une première fois l'animation
        requestAnimationFrame(animation);
    });
}

/**
 * permet de rafraichir la page quand on clique sur le bouton "RESTART"
 */
function restart() {
    restartButton.addEventListener('click', (event) =>{
        event.preventDefault();
        window.location.href = "index.html";

    });
}

/**
 * fonction qui met le jeu en pause une fois qu'on appuie sur le bouton
 */
function pause() {
    const pauseButton = document.querySelector('#pause');
    pauseButton.addEventListener('click', (event) =>{
        event.preventDefault();
        //la condition permet de passer de la pause à la lecture et inversement
        if (play) {
            vaisseau.userData.speed = 0;
            stopMoving = false;
            stopScore = false;
            play = false;
            presentationrId.style.display = 'block';
            presentationrId.style.left = '34%';
            presentationrId.style.textAlign = 'center';
        }else{
            vaisseau.userData.speed = currentSpeed + currentSpeed;
            stopMoving = true;
            stopScore = true;
            play = true;
            presentationrId.style.display = 'none';
        }
    });
}

/**
 * fonction qui charge les modèles 3D
 */
function environement() {
    const gLoader = new GLTFLoader();
    let asteroid, heart, ring;

    //importation du vaisseau
    gLoader.load('./U-Wing/U-Wing.gltf', (gltf) => {
    scene.add(gltf.scene);
    vaisseau = gltf.scene.children[0];
    scene.add(vaisseau);
    //initialisation d'un objet littéral contenant les caractéristiques du vaisseau 
    vaisseau.userData = {
        lifes : 3,
        speed : 0.5,
        score : 0,
        level : 1,
        cameraZ : 3,
        cameraY : 1
    };
    vaisseau.scale.set(0.005,0.005,0.005);
    vaisseau.position.z = 100;

})
    //importation du premier modèle d'astéroid
    gLoader.load('./asteroid/scene.gltf', (gltf) => {
        
        asteroid = gltf.scene.children[0];
        asteroidGenerator(asteroid, 100);
    })
    //importation du deuxième modèle d'astéroid
    gLoader.load('./asteroid2/scene.gltf', (gltf) => {
        
        asteroid = gltf.scene.children[0];
        
        asteroidGenerator(asteroid, 200);
    })
    //importation du modèle qui représentera les coeurs
    gLoader.load('./heart_low_poly/scene.gltf', (gltf) => {
        
        heart = gltf.scene.children[0];
        itemGenerator(heart, hearts,20, 0.05);
    })
    //importation du modèle en forme d'anneau qui représentera les points bonus
    gLoader.load('./ring/ring1.glb', (gltf) => {
        
        ring = gltf.scene.children[0];
        itemGenerator(ring, rings,20, 0.05);
    })
}

/**
 * génére les asteroids sur le long du parcours
 * @param {String} asteroid 
 * @param {Number} iteration
 */
function asteroidGenerator(asteroid, iteration) {
    
    for (let i = 0; i < iteration; i++) {
        
        let asteroidClone = asteroid.clone();
        asteroidClone.scale.set(random(20)/1000 + 0.01, random(20)/1000 + 0.01,random(20)/1000 + 0.01);
        asteroidClone.position.set(random(60)-30, random(60)-30, random(5000)-5000);
        asteroidClone.rotation.set(random(10), random(10), random(10));

        asteroids.push(asteroidClone); 
        asteroidClone.userData.rx = random(10)/1000;
        asteroidClone.userData.ry = random(10)/1000;
        
        scene.add(asteroidClone); 
    }
}
/**
 * génére les anneaux et les coeurs sur le long du parcours
 * @param {String} item 
 * @param {Array} tab 
 * @param {Number} iteration 
 * @param {Number} scale 
 */
function itemGenerator(item, tab,iteration, scale) {
    for (let i = 0; i < iteration; i++) {
        
        let itemClone = item.clone();
        itemClone.scale.set(scale, scale, scale);
        itemClone.position.set(random(60)-30, random(60)-30, random(5000)-5000);
        
        itemClone.userData.rx = random(10)/1000;
        itemClone.userData.ry = random(10)/1000;
        tab.push(itemClone);
        scene.add(itemClone);
    }
}

/**
 * génére la lumière dans la scène
 */
function lightGenerator() {
    const spotLight = new THREE.SpotLight();
    spotLight.position.set(5, 1000, 2000);
    scene.add(spotLight);

    const ambiantLight = new THREE.AmbientLight("#ffffff", 0.5);
    scene.add(ambiantLight);

    const hemisphereLight = new THREE.HemisphereLight("#0000ff", "#ff0000");
    scene.add(hemisphereLight);
}



/**
 * Affiche le nombre de vies restantes et arrete l'animation si on n'en a plus
 */
function remainingLives() {
    if (vaisseau.userData.lifes == 3) {
        lifesId.innerHTML = '&#x2665;&#x2665;&#x2665;' ;
    }else if (vaisseau.userData.lifes == 2) {
        lifesId.innerHTML = '&#x2665;&#x2665;' ;
    }else if (vaisseau.userData.lifes == 1) {
        lifesId.innerHTML = '&#x2665;' ;
    }else{
        lifesId.innerHTML = '' ;
        stopScore = false;
        gameOverId.style.display = 'block';
        restartButton.style.display = 'block';
        //une fois la partie perdue, on verifie si le score acquis est plus grand que l'actuel meilleur score
        if (vaisseau.userData.score > localStorage.getItem('bestscore')) {
            bestScoreId.innerHTML = 'Best Score : ' + vaisseau.userData.score;
            //Si le score est plus grand, il sera enregistré dans la mémoire locale du navigateur
            localStorage.setItem('bestscore', vaisseau.userData.score)
        }else if(vaisseau.userData.score <= localStorage.getItem('bestscore')){
            bestScoreId.innerHTML = 'Best Score : ' + localStorage.getItem('bestscore');
        }
        //arrete l'animanition quand on n'a plus de vies
        animationFrame.cancelAnimationFrame();
    }
}

/**
 * Calclule les impacts et intéragit avec les objets 3D se trouvant dans la scène
 */
function collision() {
    raycaster.setFromCamera(vaisseau.position, camera);
    const asteroidIntersects = raycaster.intersectObjects(asteroids, true);
    const ringIntersects = raycaster.intersectObjects(rings, true);
    const heartIntersects = raycaster.intersectObjects(hearts, true);
    if (lifeLimit) {
        if (heartIntersects.length != 0) {
        vaisseau.userData.lifes += 1;
        heartIntersects[0].object.position.set(20000,0,0);
        console.log(heartIntersects[0]);
        console.log('coeur touché !');
        lifeLimit = false;
        }
    }else {
        setTimeout(() => {
            lifeLimit = true;
        }, 1500);
    } 
    if (vaisseau.userData.lifes > 3) {
        vaisseau.userData.lifes -= 1;
    }

    if (am_I_touchable) {
        if (asteroidIntersects.length != 0) {
            console.log('asteroid touché !');

            vaisseau.userData.lifes -= 1;
            am_I_touchable = false;
        }
    }else {
        setTimeout(() => {
            am_I_touchable = true;
        }, 1500);
    }
    if (ringLimit) {
        if (ringIntersects.length != 0) {
            console.log('anneau touché !');
            vaisseau.userData.score += 2000 * scoreMultiplication;
            ringIntersects[0].object.position.set(20000,0,0);            
            ringLimit = false;
        }
    }else {
        setTimeout(() => {
            ringLimit = true;
        }, 1500);
    }
}

/**
 * redimentionne automatiquement le jeu selon la taille de l'écran
 */
function onResize (){
	camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
}

/**
 * Met en background une cubemap dans la scene
 */
function cubemapGenerator() {
    const cubemap = [
    "cubemap/px.png", "cubemap/nx.png",
    "cubemap/py.png", "cubemap/ny.png",
    "cubemap/pz.png", "cubemap/nz.png"
    ];

    const textureCube = new THREE.CubeTextureLoader().load(cubemap);
    textureCube.mapping = THREE.CubeRefractionMapping;
    scene.background = textureCube;
}


/**
 * Lance une boucle en 60fps qui fait l'animation
 */
function animation() {
    //Fait une rotation sur chaque astéroid à chaque image
    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].rotation.x += asteroids[i].userData.rx;
        asteroids[i].rotation.y += asteroids[i].userData.ry;
    }
    //Fait une rotation sur chaque anneau et coeur à chaque image
    for (let i = 0; i < rings.length; i++) {
        rings[i].rotation.z += 0.05;
        hearts[i].rotation.z += 0.05;
    }
    //Fait avancer le vaisseau et la caméra vers l'avant 
    vaisseau.position.z -= vaisseau.userData.speed;
    camera.position.set(vaisseau.position.x,vaisseau.position.y + vaisseau.userData.cameraY,vaisseau.position.z + vaisseau.userData.cameraZ);
    //Focalise la caméra sur la position du vaisseau
    control.target = vaisseau.position;
    //Si on arrive à une certaine distance, une suite d'actions se déclanche
    if (vaisseau.position.z <= -5000) {
        //le vaisseau revient au début du parcours
        vaisseau.position.z = 100;
        camera.position.z = 104;
        //Le niveau augmente
        vaisseau.userData.level += 1;
        levelId.innerHTML = 'Level : ' + vaisseau.userData.level;
        //le score est multiplié par x1.1
        scoreMultiplication = scoreMultiplication*2;
        //La vitesse est multipliée par x2
        vaisseau.userData.speed = vaisseau.userData.speed * 1.1;
        currentSpeed = vaisseau.userData.speed;
    }
    //si le jeu n'est pas mis sur pause, le score augmente à la vitesse correspondante au niveau
    if (play) {
        vaisseau.userData.score += scoreMultiplication;
    }

    remainingLives();

    scoreId.innerHTML = vaisseau.userData.score;

    control.update();

    collision(); 

    renderer.render(scene, camera);
    
    let animationFrame = requestAnimationFrame(animation);

}
pause();

window.addEventListener("keydown", updateKeyDown, false);
window.addEventListener("keyup", updateKeyUp, false);
let stopMultiplication = true;
/**
 * fonction qui détécte les touches à l'appuie. Permet de se déplacer, d'accélérer et de changer l'angle de vue
 */
    function updateKeyDown(event) {
        //Change l'angle de la caméra quand on appuie sur le bouton CTRL
        if (event.keyCode == "17") {
            if (cameraPerspective == 1)  {
                vaisseau.userData.cameraY = 2;
                vaisseau.userData.cameraZ = 5;

                cameraPerspective = 2;
            }else if (cameraPerspective == 2)  {
                vaisseau.userData.cameraY = 0.3;
                vaisseau.userData.cameraZ = 2;

                cameraPerspective = 3;
            }else{
                vaisseau.userData.cameraY = 1;
                vaisseau.userData.cameraZ = 4;
                
                cameraPerspective = 1;
            }      
        }
        //Si le jeu n'est pas sur pause...
        if (play) {
            // accelere et multiplie le score quand on appuie sur la barre d'espace
            if (event.keyCode == "32") {
            vaisseau.position.z -=  currentSpeed * 10;
                if (stopMultiplication) {
                    scoreMultiplication = scoreMultiplication*2;
                    stopMultiplication = false;
                }
                    
            }
            // En appuyant sur les touches Z/S/Q/D, on déplace le vaisseau
            if (event.keyCode == "81") {
                vaisseau.position.x -= 2;
                vaisseau.rotation.y += 0.05; 
                vaisseau.rotation.z += 0.05;    
            }
            if (event.keyCode == "68") {
                vaisseau.position.x += 2;
                vaisseau.rotation.y -= 0.05;
                vaisseau.rotation.z -= 0.05; 
            }
            if (event.keyCode == "90") {
                vaisseau.position.y += 2;
                vaisseau.rotation.x += 0.05;
            }
            if (event.keyCode == "83") {
                vaisseau.position.y -= 2;
                vaisseau.rotation.x -= 0.05;

            }
            //Si le vaisseau dépasse une certaine limite sur telle direction, le vaisseau ne pourra plus continuer sur cette direction
            if (vaisseau.position.x <= -30) {
                vaisseau.position.x = -30;
                    
            }else if (vaisseau.position.x >= 30) {
                vaisseau.position.x = 30;
        
            }else if(vaisseau.position.y <= -30) {
                vaisseau.position.y = -30;
        
            }else if (vaisseau.position.y >= 30) {
                vaisseau.position.y = 30;
            
            }
        }
        
        
        //Arrete la rotation du vaisseau après un certain angle
        if (vaisseau.rotation.y >= 0.3) {
            vaisseau.rotation.y = 0.3;
            vaisseau.rotation.z = 0.3; 
        }
        if (vaisseau.rotation.y <= -0.3) {
            vaisseau.rotation.y = -0.3;
            vaisseau.rotation.z = -0.3; 
        }
        if (vaisseau.rotation.x >= 0.25) {
            vaisseau.rotation.x = 0.25;
        }
        if (vaisseau.rotation.x <= -0.25) {
            vaisseau.rotation.x = -0.25;
        }
    }
/**
 * recentre le vaisseau quand une touche n'est plus pressée
 */
    function updateKeyUp(event) {
        //si le jeu n'est pas sur pause
        if (play) {
            if (event.keyCode == "81") {          
            vaisseau.rotation.y = 0;
            vaisseau.rotation.z = 0;  
            
            }if (event.keyCode == "68") {
                vaisseau.rotation.y = 0;
                vaisseau.rotation.z = 0; 
                
            }if (event.keyCode == "90") {
                vaisseau.rotation.x = 0;
                vaisseau.rotation.z = 0; 
                
            }if (event.keyCode == "83") {
                vaisseau.rotation.x = 0;
                vaisseau.rotation.z = 0;
                

            }
            //Le score progessera à la vitesse qu'il avait avant d'appuyer sur la barre d'espace quand cette dernière n'est plus pressée 
            if (event.keyCode == "32") {
                scoreMultiplication = scoreMultiplication/2;
                stopMultiplication = true;
            } 
        }
            
    }
window.addEventListener('resize', onResize);
onResize();
cubemapGenerator();
environement();
startGame();
restart();
lightGenerator();