
import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
import { ARButton } from 'https://cdn.skypack.dev/three@0.152.2/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let controller;
const arrows = [];

init();
animate();

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  controller = renderer.xr.getController(0);
  controller.addEventListener('select', onSelect);
  scene.add(controller);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);
}

function onSelect() {
  const refSpace = renderer.xr.getReferenceSpace();
  const viewerSpace = renderer.xr.getViewerSpace();

  renderer.xr.getSession().requestReferenceSpace('viewer').then((viewerRefSpace) => {
    renderer.xr.getSession().requestHitTestSource({ space: viewerRefSpace }).then((hitTestSource) => {
      renderer.setAnimationLoop((timestamp, frame) => {
        if (frame) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(refSpace);

            for (let i = 0; i < 10; i++) {
              const arrow = createArrow();
              arrow.position.set(
                pose.transform.position.x + i * 0.5,
                pose.transform.position.y,
                pose.transform.position.z
              );
              scene.add(arrow);
              arrows.push(arrow);
            }

            const dest = createDestination();
            dest.position.set(
              pose.transform.position.x + 5.5,
              pose.transform.position.y,
              pose.transform.position.z
            );
            scene.add(dest);

            renderer.setAnimationLoop(null); // stop loop after placing
          }
        }
      });
    });
  });
}

function createArrow() {
  const geometry = new THREE.ConeGeometry(0.05, 0.15, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xffa500 });
  const cone = new THREE.Mesh(geometry, material);
  cone.rotation.x = Math.PI / 2;
  return cone;
}

function createDestination() {
  const geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const marker = new THREE.Mesh(geometry, material);
  return marker;
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  renderer.render(scene, camera);
}
