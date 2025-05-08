function initSceneSetup() {
    // Scene
    scene.background = new THREE.Color(0xcce0ff);
    scene.fog = new THREE.Fog(0xcce0ff, 200, 500);

    // Camera
    // camera is already initialized in main.js

    // Renderer
    // renderer is already initialized in main.js

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    // controls.maxPolarAngle = Math.PI / 2; // Allow viewing from below

    initPlane();
    initLights();
    initEnvironmentMap();
    initParticles(); // Add this line
}

function initPlane() {
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    // planeMaterial is no longer needed for the Reflector itself,
    // as Reflector handles its own appearance for reflection.

    plane = new THREE.Reflector(planeGeometry, {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0xaaaaaa, // A light grey for the floor surface
        // recursion: 1 // Optional: for multi-reflections, can be performance intensive
    });
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -100;
    // plane.receiveShadow = true; // Shadows on a perfect reflector might look odd or not work as expected. Test if needed.
    scene.add(plane);
}

function initLights() {
    ambientLight = new THREE.AmbientLight(0x606060, 1.0);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.bottom = -150;
    scene.add(directionalLight);
}

function initEnvironmentMap() {
    const rgbeLoader = new THREE.RGBELoader();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    rgbeLoader.load('https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr', function (texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap; // Re-enable environment map
        texture.dispose();
        pmremGenerator.dispose();
        if (textMaterial && textMaterial.isMeshStandardMaterial) {
            textMaterial.envMap = envMap;
            textMaterial.needsUpdate = true;
        }
        console.log('Environment map loaded and applied.');
    }, undefined, function (error) {
        console.error('An error occurred loading the HDRI:', error);
    });
}

function initParticles() {
    const particleCount = 10000; // パーティクルの数を増やす
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3); // x, y, z for each particle
    const colors = new Float32Array(particleCount * 3); // r, g, b for each particle
    const velocities = new Float32Array(particleCount * 3); // 速度も保存
 
    for (let i = 0; i < particleCount * 3; i += 3) {
        // Distribute particles in a sphere around the origin (logo's general area)
        const radius = 150 + Math.random() * 100; // Spread them out a bit
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;

        positions[i] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i + 1] = radius * Math.sin(theta) * Math.sin(phi); // Y position
        positions[i + 2] = radius * Math.cos(theta); 

        // Initialize velocities
        velocities[i] = (Math.random() - 0.5) * 0.2;   // x velocity
        velocities[i + 1] = (Math.random() - 0.5) * 0.2; // y velocity
        velocities[i + 2] = (Math.random() - 0.5) * 0.2; // z velocity

        // Assign a random bright color
        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.7 + Math.random() * 0.3, 0.5 + Math.random() * 0.3); // ランダムな色相、彩度高め、明度もそこそこ
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3)); // 色情報を属性として追加
    particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3)); // 速度を属性として追加

    const particleMaterial = new THREE.PointsMaterial({
        // color: 0xffffff, // 個別の色を使用するためコメントアウト
        size: 3.5, // パーティクルのサイズをさらに大きくする
        transparent: true,
        opacity: 0.7,
        blending: THREE.NormalBlending, // 一時的にNormalBlendingに変更して確認
        sizeAttenuation: false // 距離による減衰をオフに（お好みで）
    });

    particleMaterial.vertexColors = true; // 頂点カラーを有効にする
    particleMaterial.needsUpdate = true; // マテリアルの更新を強制
    particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.visible = false; // Initially hidden, controlled by UI
    scene.add(particleSystem);
    console.log('Particle system initialized.');
}