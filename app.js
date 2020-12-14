import * as THREE from 'three';
import { DoubleSide } from 'three';
import gsap from 'gsap'
import * as dat from 'dat.gui'

import vertex from './shaders/vertex'
import fragment from './shaders/fragment'

import mask from './img/mask.png'
import penguin from './img/penguin.png'
import crewmate from './img/crewmate.png'
import iphone from './img/iphone.png'

// let OrbitControls = require('three-orbit-controls')(THREE);

export default class Sketch {
    constructor() {
        // insert stuff

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(this.renderer.domElement);

        this.raycaster = new THREE.Raycaster()

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.camera.position.z = 1500;
        this.scene = new THREE.Scene();
        this.time = 0;
        this.move = 0;
        this.mousePressed = 0;

        this.mouse = new THREE.Vector2();
        this.point = new THREE.Vector2();

        this.textures = [
            new THREE.TextureLoader().load(penguin),
            new THREE.TextureLoader().load(crewmate),

        ]

        this.mask = new THREE.TextureLoader().load(mask);

        // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.addMesh()
        // this.resize();
        this.mouseEffects();
        this.render()
        this.settings();

    }

    mouseEffects() {
        window.addEventListener('mousewheel', (e) => {
            // do something
            this.move += e.wheelDeltaY / 4000
        })

        window.addEventListener('mousedown', (e) => {
            gsap.to(this.material.uniforms.mousePressed, {
                duration: 0.5,
                value: 1,
                ease: 'elastic.out(1, 0.3)'

            })
        })

        window.addEventListener('mouseup', (e) => {
            gsap.to(this.material.uniforms.mousePressed, {
                duration: 0.5,
                value: 0,
                ease: 'elastic.out(1, 0.3)'
            })
        })

        this.test = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2000, 2000),
            new THREE.MeshBasicMaterial(),

        )

        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera)

            let intersects = this.raycaster.intersectObjects([this.test])

            this.point.x = intersects[0].point.x;
            this.point.y = intersects[0].point.y;
        }, false)
    }

    rand(a, b) {
        return a + (b - a) * Math.random();
    }

    settings() {
        let that = this;
        this.settings = {
            progress: 0,
        };
        this.gui = new dat.GUI();
        this.gui.add(this.settings, 'progress', 0, 1, 0.01)
    }

    addMesh() {
        // code
        // this.geometry = new THREE.PlaneBufferGeometry(1000, 1000, 100, 100);
        this.geometry = new THREE.BufferGeometry();
        let gridSize = 512
        let number = gridSize * gridSize;

        this.positions = new THREE.BufferAttribute(new Float32Array(number * 3), 3)
        this.coordinates = new THREE.BufferAttribute(new Float32Array(number * 3), 3)
        this.speed = new THREE.BufferAttribute(new Float32Array(number), 1)
        this.offset = new THREE.BufferAttribute(new Float32Array(number), 1)
        this.direction = new THREE.BufferAttribute(new Float32Array(number), 1)
        this.press = new THREE.BufferAttribute(new Float32Array(number), 1)


        let index = 0;
        for (let i = 0; i < gridSize; i++) {
            let posX = i - (gridSize / 2);
            for (let j = 0; j < gridSize; j++) {
                this.positions.setXYZ(index, posX * 2, (j - (gridSize / 2)) * 2, 0)
                this.coordinates.setXYZ(index, i, j, 0)
                this.offset.setX(index, this.rand(-1000, 1000))
                this.speed.setX(index, this.rand(0.4, 1))
                this.direction.setX(index, Math.random() > 0.5 ? 1 : -1) // generate a random number, if it's greater than 0.5 return 1 else return -1
                this.press.setX(index, this.rand(0.4, 1))

                index++
            }
        }

        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragment,
            vertexShader: vertex,
            uniforms: {
                time: { type: 'f', value: 0 },
                move: { type: 'f', value: 0 },
                mousePressed: { type: 'f', value: 0 },
                progress: { type: 'f', value: 0 },
                penguin: { type: 't', value: this.textures[0] },
                mask: { type: 't', value: this.textures[1] },
                crewmate: { type: 't', value: this.textures[2] },
                mouse: { type: 'v2', value: null },
                transition: { type: 'f', value: 0 },
            },
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });


        this.geometry.setAttribute("position", this.positions)
        this.geometry.setAttribute("aCoordinates", this.coordinates)
        this.geometry.setAttribute("aSpeed", this.speed)
        this.geometry.setAttribute("aOffset", this.offset)
        this.geometry.setAttribute("aPress", this.press)
        this.geometry.setAttribute("aDirection", this.direction)

        this.mesh = new THREE.Points(this.geometry, this.material);
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
        let next = Math.floor(this.move + 40) % 2
        let prev = (Math.floor(this.move) + 1 + 40) % 2
        this.material.uniforms.penguin.value = this.textures[prev];
        this.material.uniforms.crewmate.value = this.textures[next];

        this.material.uniforms.transition.value = this.settings.progress

        this.material.uniforms.time.value = this.time
        this.material.uniforms.move.value = this.move
        this.material.uniforms.mouse.value = this.point
        // this.mesh.rotation.x += 0.01;
        // this.mesh.rotation.y += Math.sin(0.02);
        this.renderer.render(this.scene, this.camera);

        window.requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch();
