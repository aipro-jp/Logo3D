let renderScene; // Make it accessible if needed elsewhere, or keep local

function initPostProcessing() {
    renderScene = new THREE.RenderPass(scene, camera); // scene and camera are global

    if (window.innerWidth === 0 || window.innerHeight === 0) {
        console.warn(`Initial window dimensions were 0x0. Using 1x1 for post-processing passes. Resize should correct this.`);
    }

    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(passResolutionX, passResolutionY), 0.5, 0.4, 0.85); // passResolutionX/Y are global
    bloomPass.strength = 0; // Initially off

    bokehPass = new THREE.BokehPass(scene, camera, { // scene and camera are global
        focus: 150.0,
        aperture: 0.5,
        maxblur: 0.005,
        width: passResolutionX, // passResolutionX/Y are global
        height: passResolutionY
    });
    bokehPass.enabled = false; // Initially off

    composer = new THREE.EffectComposer(renderer); // renderer is global
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(bokehPass);
}