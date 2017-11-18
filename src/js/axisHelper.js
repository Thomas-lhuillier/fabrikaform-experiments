/**
 * Helpers
 */

import * as THREE from 'three';

export default function (size = 500) {
  const redLineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const greenLineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const blueLineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });

  const xGeometry = new THREE.Geometry();
  xGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
  xGeometry.vertices.push(new THREE.Vector3(size, 0, 0));
  const xAxis = new THREE.Line(xGeometry, redLineMaterial);
  // scene.add(xAxis);

  const yGeometry = new THREE.Geometry();
  yGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
  yGeometry.vertices.push(new THREE.Vector3(0, size, 0));
  const yAxis = new THREE.Line(yGeometry, greenLineMaterial);
  // scene.add(yAxis);

  const zGeometry = new THREE.Geometry();
  zGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
  zGeometry.vertices.push(new THREE.Vector3(0, 0, size));
  const zAxis = new THREE.Line(zGeometry, blueLineMaterial);
  // scene.add(zAxis);

  return [xAxis, yAxis, zAxis];
}
