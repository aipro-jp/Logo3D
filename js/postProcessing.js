let renderScene; // 必要に応じて他からもアクセス可能にするか、ローカルに保持

function initPostProcessing() {
    renderScene = new THREE.RenderPass(scene, camera);

    if (window.innerWidth === 0 || window.innerHeight === 0) {
        console.warn(`Initial window dimensions were 0x0. Using 1x1 for post-processing passes. Resize should correct this.`);
    }

    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(passResolutionX, passResolutionY), 0.5, 0.4, 0.85);
    bloomPass.strength = 0; // 初期状態ではオフ

    bokehPass = new THREE.BokehPass(scene, camera, {
        focus: 150.0,
        aperture: 0.5,
        maxblur: 0.005,
        width: passResolutionX,
        height: passResolutionY
    });
    bokehPass.enabled = false; // 初期状態ではオフ

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(bokehPass);
}