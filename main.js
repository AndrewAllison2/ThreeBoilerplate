import * as THREE from 'three';
import { ThreeMFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background.
// renderer.setClearColor(0xFEFEFE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight)
);
bloomPass.threshold = 0.5;
bloomPass.strength = 0.4;
bloomPass.radius = 0.8;

const outputPass = new OutputPass();

const bloomComposer = new EffectComposer(renderer);

bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);
bloomComposer.addPass(outputPass);

// Sets orbit control to move the camera around.
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning.
camera.position.set(6, 8, 14);
// Has to be done everytime we update the camera position.
orbit.update();

const uniforms = {
    u_time: { value: 0.0 },
    u_frequency: { value: 0.0 },
};

const mat = new THREE.ShaderMaterial({
    wireframe: true,
    vertexShader: document.getElementById('vertexshader')?.textContent,
    fragmentShader: document.getElementById('fragmentshader')?.textContent
});

const geo = new THREE.IcosahedronGeometry(4, 30);
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('/November 17.wav', function (buffer) {
    sound.setBuffer(buffer);
    window.addEventListener('click', function () {
        sound.play();
    });
});

const analyser = new THREE.AudioAnalyser(sound, 32);

const clock = new THREE.Clock();

function animate() {
    uniforms.u_time.value = clock.getElapsedTime();
    uniforms.u_frequency.value = analyser.getAverageFrequency();
    bloomComposer.render();
    requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});