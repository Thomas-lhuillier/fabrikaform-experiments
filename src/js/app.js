/* eslint-env browser */
// import * as THREE from 'three';
import * as THREE from 'three';
import 'three/OrbitControls';
import Stats from 'vendor/stats.min';

import AxisHelper from './axisHelper';

// import layer1 from './layers/layer1';

const layers = [];
layers.push(require('./layers/layer4'));
layers.push(require('./layers/layer3'));
layers.push(require('./layers/layer5'));
layers.push(require('./layers/layer2'));
layers.push(require('./layers/layer6'));
layers.push(require('./layers/layer1'));


/**
 * Color variables
 */
const colorPrimary = 0x03066f;
const colorSecondary = 0xffffff;


/**
 * Scene
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe5e0d4);


/**
 * Helpers
 */
const displayHelpers = false;
const axisHelper = new AxisHelper();

if (displayHelpers) {
  axisHelper.forEach(axis => {
    scene.add(axis);
  });
}


/**
 * Camera
 */
// const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  1,
  10000
);
camera.position.set(0, 0, 500);
// camera.lookAt(new THREE.Vector3(100, 100, 0));


/**
 * Lights
 */
// Ambiant light
const ambientLight = new THREE.AmbientLight(colorPrimary, 1); // blue .05
scene.add(ambientLight);

function makePointLight(params, position, castShadow = false, hasHelper = false) {
  const sphereSize = 10;
  const light = new THREE.PointLight(params[0], params[1], params[2]);
  light.position.set(position[0], position[1], position[2]);

  if (castShadow) {
    light.castShadow = true;
  }

  scene.add(light);

  if (hasHelper) {
    const helper = new THREE.PointLightHelper(light, sphereSize);
    scene.add(helper);
    // const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(cameraHelper);
  }
}

makePointLight([colorSecondary, 1, 0], [0, 0, 200], true, displayHelpers);


/**
 * Materials
 */
// usual materials
// const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x2194ce });
// const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0xf03066f0 });
// const phongMaterial = new THREE.MeshPhongMaterial({ color: 0x2194ce });
// const standardMaterial = new THREE.MeshStandardMaterial({ color: 0x2194ce });
// wireframe
// const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
// extra materials
// const depthMaterial = new THREE.MeshDepthMaterial();
// const normalMaterial = new THREE.MeshNormalMaterial();

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10000, 10000),
  new THREE.MeshLambertMaterial({ color: 0xf03066f0, side: THREE.DoubleSide })
);
plane.castShadow = true;
plane.receiveShadow = true;

// scene.add(plane)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // to antialias the shadow

function render() {
  renderer.render(scene, camera);
}

/**
 * Controls
 */
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', render); // remove when using animation loop
// enable animation loop when using damping or autorotation
// controls.enableDamping = true;
// controls.dampingFactor = 0.25;
controls.enableZoom = true;


/**
 * Stats
 */
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
// stats.showPanel(2)
// stats.showPanel(3)


/**
 * setup and animate loop
 */
const clock = new THREE.Clock();
let container;
// let elapsedTime;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const step = 20;

function init() {
  container = document.getElementById('container');
  container.appendChild(renderer.domElement);
  container.appendChild(stats.dom);

  window.addEventListener('resize', onWindowResize, false);

  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];

    for (let j = 0; j < layer.content.length; j += 1) {
      const shape = layer.content[j];

      // const geometry = new THREE.ShapeGeometry(shape);
      const geometry = new THREE.ExtrudeGeometry(shape, {
        bevelEnabled: false, bevelSegments: 0, steps: 20, amount: 20
      });
      const material = new THREE.MeshBasicMaterial({ color: layer.color });
      // const material = new THREE.MeshPhongMaterial({ color: layer.color });
      material.side = THREE.DoubleSide;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...layer.position, i * step);
      mesh.scale.set(1, -1, 1);

      scene.add(mesh);
    }
  }

  clock.start();
  render();
}

function animate() {
  requestAnimationFrame(animate);

  stats.begin();
  // elapsedTime = clock.getElapsedTime();
  // logic here

  render();
  stats.end();
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  animate();
});


/**
 * Tools
 */
// function randomFloat(float = 1) {
//   return Math.random() * float;
// }
