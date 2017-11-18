import * as THREE from 'three';

const content = [];

const shape1 = new THREE.Shape();
shape1.moveTo(26.0, 11.5);
shape1.bezierCurveTo(26.0, 12.3, 25.3, 13.0, 24.5, 13.0);
shape1.lineTo(19.0, 13.0);
shape1.bezierCurveTo(18.6, 13.0, 18.2, 12.8, 17.9, 12.5);
shape1.bezierCurveTo(17.7, 12.2, 17.5, 11.8, 17.5, 11.4);
shape1.bezierCurveTo(17.5, 11.4, 17.5, 7.5, 17.4, 1.4);
shape1.bezierCurveTo(17.4, 1.0, 17.4, 0.5, 17.4, 0.0);
shape1.bezierCurveTo(7.2, 0.9, 0.0, 5.6, 0.0, 11.5);
shape1.bezierCurveTo(0.0, 18.0, 9.2, 23.1, 21.0, 23.1);
shape1.bezierCurveTo(32.8, 23.1, 42.0, 18.0, 42.0, 11.5);
shape1.bezierCurveTo(42.0, 5.9, 35.5, 1.4, 26.1, 0.2);
shape1.bezierCurveTo(26.1, 0.6, 26.1, 1.1, 26.1, 1.5);
shape1.bezierCurveTo(26.0, 7.7, 26.0, 11.5, 26.0, 11.5);
content.push(shape1);

exports.content = content;
exports.color = 0xbfb4a7;
exports.position = [241.15, -166.7];
