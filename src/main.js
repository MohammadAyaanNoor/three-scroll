import * as THREE from 'three';
import GUI from 'lil-gui'; 
import { gsap } from "gsap";

const gui = new GUI();


const canvas = document.querySelector('.webgl');

const scene = new THREE.Scene();

const parameters ={
    color : '#59ff38',
    

}

gui.addColor(parameters, 'color').onChange(()=>{
    material.color.set(parameters.color);
    particlesMaterial.color.set(parameters.color);
})
//objects

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('../static/textures/5.jpg');
gradientTexture.magFilter = THREE.NearestFilter; 

const material = new THREE.MeshToonMaterial({color: parameters.color,gradientMap:gradientTexture})

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1,0.4,16,60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1,2,32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8,0.35,100,16),
    material
)

scene.add(mesh1,mesh2,mesh3);

const sectionMeshes = [mesh1,mesh2,mesh3];



const objectDistance = 4;
mesh1.position.y = - objectDistance * 0;
mesh2.position.y = - objectDistance * 1;
mesh3.position.y = - objectDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

const particlesCount = 1000;
const positions = new Float32Array(particlesCount * 3);

for(let i = 0; i< particlesCount; i++){
  positions[i*3 + 0] = (Math.random() -0.5) * 10
  positions[i*3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * sectionMeshes.length;
  positions[i*3 + 2] = (Math.random()-0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));

const particlesMaterial = new THREE.PointsMaterial({
  color:parameters.color,
  sizeAttenuation:true,
  size:0.03,
})

const particles = new THREE.Points(particlesGeometry,particlesMaterial);
scene.add(particles);


const directionalLight = new THREE.DirectionalLight('#ffffff',3)
directionalLight.position.set(1,1,0);
scene.add(directionalLight);



const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize',()=>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
// camera.lookAt(mesh.position);
cameraGroup.add(camera);

let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener('scroll',()=>{
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY/sizes.height);

  if(newSection != currentSection){
    currentSection = newSection;
    gsap.to(sectionMeshes[currentSection].rotation,{
      duration:1.5,
      ease:'power2.inOut',
      x:'+=6',
      y:'+=6',
      z: '+=1.5'
    })
  }
})

const cursor ={}
cursor.x = 0;
cursor.y = 0;

window.addEventListener('mousemove',(event)=>{
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
})

// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha:true
})

renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();
let previousTime = 0;

function tick(){
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  camera.position.y = -scrollY / sizes.height * objectDistance;

 

  const parallaxX = cursor.x;
  const parallaxY = -cursor.y;
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.6 * deltaTime
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.6 * deltaTime


  // Update objects
  for(const mesh of sectionMeshes){
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }
//   controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();