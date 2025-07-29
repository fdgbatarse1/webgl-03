import "./reset.css";

import Stats from "stats.js";
import {
  AmbientLight,
  AxesHelper,
  CameraHelper,
  Clock,
  Color,
  DirectionalLight,
  DirectionalLightHelper,
  FrontSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Object3DEventMap,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { degToRad } from "three/src/math/MathUtils.js";

const isDebug = false;

const stats = new Stats();
document.body.appendChild(stats.dom);

const loader = new GLTFLoader();

const renderer = new WebGLRenderer({
  canvas: document.querySelector("#canvas") as HTMLCanvasElement,
});

renderer.outputColorSpace = SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 15;
camera.position.x = 15;
camera.position.z = 15;
camera.lookAt(0, 0, 0);

new OrbitControls(camera, renderer.domElement);

const scene = new Scene();
scene.background = new Color(0x87ceeb);

const ambientLight = new AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 15, 15);
directionalLight.target.position.set(0, 0, -10);

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
const size = 30;
directionalLight.shadow.camera.top = size;
directionalLight.shadow.camera.bottom = -size;
directionalLight.shadow.camera.left = -size;
directionalLight.shadow.camera.right = size;

directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 35;

scene.add(directionalLight);

if (isDebug) {
  const shadowHelper = new CameraHelper(directionalLight.shadow.camera);
  scene.add(shadowHelper);
  const directionalLightHelper = new DirectionalLightHelper(directionalLight);
  scene.add(directionalLightHelper);
}

const geometry = new PlaneGeometry();
const material = new MeshStandardMaterial({ color: 0x8b4513 });
material.side = FrontSide;
const floor = new Mesh(geometry, material);
floor.rotation.x = -Math.PI / 2;
floor.scale.set(20, 20, 20);
floor.receiveShadow = true;
scene.add(floor);

let remy: Group<Object3DEventMap>;

loader.load("/models/remy.glb", remyGltf => {
  remy = remyGltf.scene;
  remy.rotation.y = Math.PI;
  remy.traverse((obj: Object3D) => {
    if (obj instanceof Mesh) {
      obj.castShadow = true;
      obj.material.side = FrontSide;
    }
  });

  const rightUpperArm = remy.getObjectByName("Bip001_R_UpperArm_054");
  const rightForeArm = remy.getObjectByName("Bip001_R_Forearm_055");

  if (rightUpperArm) {
    rightUpperArm.rotation.x = degToRad(-45.3066);
    rightUpperArm.rotation.y = degToRad(-31.6865);
    rightUpperArm.rotation.z = degToRad(-39.8504);
  }
  if (rightForeArm) {
    rightForeArm.rotation.x = degToRad(8.00177);
    rightForeArm.rotation.y = degToRad(1.32406);
    rightForeArm.rotation.z = degToRad(-22.9602);
  }

  const leftUpperArm = remy.getObjectByName("Bip001_L_UpperArm_044");
  const leftForeArm = remy.getObjectByName("Bip001_L_Forearm_045");
  const leftHand = remy.getObjectByName("Bip001_L_Hand_046");

  if (leftUpperArm) {
    leftUpperArm.rotation.x = degToRad(-45.8715);
    leftUpperArm.rotation.y = degToRad(-20.6298);
    leftUpperArm.rotation.z = degToRad(-29.8079);
  }

  if (leftForeArm) {
    leftForeArm.rotation.x = degToRad(-18.9058);
    leftForeArm.rotation.y = degToRad(2.88094);
    leftForeArm.rotation.z = degToRad(-80.0258);
  }

  if (leftHand) {
    leftHand.rotation.x = degToRad(-45.6384);
    leftHand.rotation.y = degToRad(6.45698);
    leftHand.rotation.z = degToRad(-11.3543);
  }

  scene.add(remy);
});

if (isDebug) {
  scene.add(new AxesHelper(10));
}

function resize() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

resize();

window.addEventListener("resize", resize);

const clock = new Clock(true);

function animate() {
  stats.begin();

  renderer.render(scene, camera);

  if (remy) {
    remy.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.5;
  }

  stats.end();

  window.requestAnimationFrame(animate);
}

animate();
