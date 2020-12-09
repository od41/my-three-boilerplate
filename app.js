import * as THREE from 'three';
import { DoubleSide } from 'three';

export default class Sketch {
    constructor() {
        // insert stuff

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
        this.camera.position.z = 1;
        this.scene = new THREE.Scene();
        this.time = 0;

        this.addMesh()
        this.resize();
        this.render()

    }

    addMesh() {
        // code
        this.geometry = new THREE.PlaneBufferGeometry(1, 1);
        this.material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    resize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        })
    }

    render() {
        // code
        this.time++
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;
        this.renderer.render(this.scene, this.camera);

        window.requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch();
