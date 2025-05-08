import { initVideoRecorder } from './videoRecorder.js';
// Import necessary Three.js components if using modules (ES6)
// import * as THREE from 'three'; // Or specific imports
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
// import { PMREMGenerator } from 'three/examples/jsm/pmrem/PMREMGenerator.js';
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
// import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

// For script tag usage, these are globally available via THREE object.

// Global variables (consider encapsulating these later if project grows)
window.scene = null;
window.camera = null;
window.renderer = null;
window.controls = null;
window.composer = null;
window.bloomPass = null;
window.bokehPass = null;
window.passResolutionX = 1; // Default, will be updated
window.passResolutionY = 1; // Default, will be updated

window.plane = null;
// window.planeMaterial = null; // Reflector handles its own material for reflection

window.ambientLight = null;
window.directionalLight = null;

window.particleSystem = null;

window.loadedFont = null;
window.textMesh = null;
window.textMaterial = null; // This will hold the current material for the text

// UI Elements (ensure these IDs match your HTML)
window.textInput = document.getElementById('textInput');
window.fontSelect = document.getElementById('fontSelect');
window.materialSelect = document.getElementById('materialSelect');
window.colorInput = document.getElementById('colorInput');
window.metalnessInput = document.getElementById('metalnessInput');
window.roughnessInput = document.getElementById('roughnessInput');
window.metalnessValueSpan = document.getElementById('metalnessValue');
window.roughnessValueSpan = document.getElementById('roughnessValue');
window.metalnessControlDiv = document.getElementById('metalnessControl');
window.roughnessControlDiv = document.getElementById('roughnessControl');

window.ambientColorInput = document.getElementById('ambientColorInput');
window.ambientIntensityInput = document.getElementById('ambientIntensityInput');
window.ambientIntensityValue = document.getElementById('ambientIntensityValue');
window.directionalColorInput = document.getElementById('directionalColorInput');
window.directionalIntensityInput = document.getElementById('directionalIntensityInput');
window.directionalIntensityValue = document.getElementById('directionalIntensityValue');
window.directionalPosXInput = document.getElementById('directionalPosXInput');
window.directionalPosYInput = document.getElementById('directionalPosYInput');
window.directionalPosZInput = document.getElementById('directionalPosZInput');
window.directionalPosXValue = document.getElementById('directionalPosXValue');
window.directionalPosYValue = document.getElementById('directionalPosYValue');
window.directionalPosZValue = document.getElementById('directionalPosZValue');

window.lightingControlsWrapper = document.getElementById('lightingControlsWrapper');
window.animationControlsWrapper = document.getElementById('animationControlsWrapper');
window.postProcessingControlsWrapper = document.getElementById('postProcessingControlsWrapper');
window.otherSettingsWrapper = document.getElementById('otherSettingsWrapper');
window.settingsDetailContainer = document.getElementById('settingsDetailContainer');

window.toggleLightingCategory = document.getElementById('toggleLightingCategory');
window.toggleAnimationCategory = document.getElementById('toggleAnimationCategory');
window.togglePostProcessCategory = document.getElementById('togglePostProcessCategory');
window.toggleOtherCategory = document.getElementById('toggleOtherCategory');

window.toggleFloorVisibility = document.getElementById('toggleFloorVisibility');
window.toggleParticleEffect = document.getElementById('toggleParticleEffect');

window.toggleRotationAnimation = document.getElementById('toggleRotationAnimation');
window.togglePulsingAnimation = document.getElementById('togglePulsingAnimation');
window.toggleFloatingAnimation = document.getElementById('toggleFloatingAnimation');
window.toggleSwingingAnimation = document.getElementById('toggleSwingingAnimation');
window.toggleEmissivePulseAnimation = document.getElementById('toggleEmissivePulseAnimation');
window.toggleColorPulseAnimation = document.getElementById('toggleColorPulseAnimation');
window.toggleJitterAnimation = document.getElementById('toggleJitterAnimation');
window.toggleOrbitAnimation = document.getElementById('toggleOrbitAnimation');
window.resetAnimationsButton = document.getElementById('resetAnimationsButton');

window.toggleBloomEffect = document.getElementById('toggleBloomEffect');
window.bloomStrengthInput = document.getElementById('bloomStrength');
window.bloomStrengthValue = document.getElementById('bloomStrengthValue');
window.bloomRadiusInput = document.getElementById('bloomRadius');
window.bloomRadiusValue = document.getElementById('bloomRadiusValue');
window.bloomThresholdInput = document.getElementById('bloomThreshold');
window.bloomThresholdValue = document.getElementById('bloomThresholdValue');

window.toggleDofEffect = document.getElementById('toggleDofEffect');
window.dofFocusInput = document.getElementById('dofFocus');
window.dofFocusValue = document.getElementById('dofFocusValue');
window.dofApertureInput = document.getElementById('dofAperture');
window.dofApertureValue = document.getElementById('dofApertureValue');
window.dofMaxblurInput = document.getElementById('dofMaxblur');
window.dofMaxblurValue = document.getElementById('dofMaxblurValue');


// Clock for animations
const clock = new THREE.Clock();

// --- Initialization Function ---
function init() {
    // Scene
    window.scene = new THREE.Scene();
    window.scene.background = new THREE.Color(0xcce0ff); // Light blue background
    window.scene.fog = new THREE.Fog(0xcce0ff, 200, 500); // Fog matching background

    // Camera
    window.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000); // FOVを75から50に уменьしました
    window.camera.position.set(0, 75, 200); // Z位置を150から200に遠ざけました
    
    // Renderer
    window.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); // preserveDrawingBuffer for recording
    window.renderer.setSize(window.innerWidth, window.innerHeight);
    window.renderer.shadowMap.enabled = true;
    window.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(window.renderer.domElement);

    // Post-processing resolution
    window.passResolutionX = Math.max(1, window.innerWidth);
    window.passResolutionY = Math.max(1, window.innerHeight);

    // Initialize other modules/components
    initSceneSetup(); // From sceneSetup.js - sets up plane, lights, controls, env map, particles
    initTextManager(); // From textManager.js - loads initial font and text
    initPostProcessing(); // From postProcessing.js - sets up composer and passes
    initUIEventListeners(); // From uiControls.js - sets up all UI event listeners

    // Initialize Video Recorder
    // Ensure renderer.domElement is available
    if (window.renderer && window.renderer.domElement) {
        const recorderInitialized = initVideoRecorder(
            window.renderer.domElement,
            'toggleRecordButton',
            'videoFormatSelect',
            'recordingStatus',
            'downloadLink'
        );
        if (!recorderInitialized) {
            console.warn("Video recorder could not be initialized.");
        }
    } else {
        console.error("Renderer or renderer.domElement not available for video recorder initialization.");
    }

    // Start animation loop
    animate();
    console.log('Application initialized and animation loop started.');
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Update animations
    updateAllAnimations(elapsedTime); // From animations.js

    // Update particles (if they have their own animation logic beyond what's in updateAllAnimations)
    // updateParticles(elapsedTime); // Example if particles had separate update

    // Update controls
    if (window.controls) window.controls.update();

    // Render scene
    if (window.composer) {
        window.composer.render();
    } else if (window.renderer && window.scene && window.camera) {
        window.renderer.render(window.scene, window.camera);
    }
}

// --- Window Resize Handler ---
function onWindowResize() {
    if (window.camera && window.renderer) {
        window.camera.aspect = window.innerWidth / window.innerHeight;
        window.camera.updateProjectionMatrix();
        window.renderer.setSize(window.innerWidth, window.innerHeight);

        // Update post-processing resolution and pass sizes
        window.passResolutionX = Math.max(1, window.innerWidth);
        window.passResolutionY = Math.max(1, window.innerHeight);

        if (window.composer) {
            window.composer.setSize(window.innerWidth, window.innerHeight);
        }
        if (window.bloomPass) {
            // UnrealBloomPass constructor takes Vector2, but size can be updated if needed
            // bloomPass.setSize(window.innerWidth, window.innerHeight); // Check if setSize is available or if re-creation is needed
        }
        if (window.bokehPass) {
            // BokehPass might need specific update or re-creation for resolution changes
            // bokehPass.uniforms['aspect'].value = window.innerWidth / window.innerHeight; // Example
        }
        // Call the specific resize handler for post-processing if it exists
        // onPostProcessingResize(); // Assuming this function handles detailed pass resizing
    }
}
window.addEventListener('resize', onWindowResize);

// --- Start the application ---
// Ensure DOM is fully loaded before initializing, especially if scripts are in <head>
// However, with `defer` on script tags, this is usually not an issue.
// For robustness:
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init(); // Or DOMContentLoaded has already fired
}
