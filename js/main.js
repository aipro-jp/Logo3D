// Create a scene
const scene = new THREE.Scene();
// Create a camera (FOV, Aspect Ratio, Near, Far)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing
// Add OrbitControls for camera interaction
let controls; // Will be initialized in sceneSetup.js
// Post-processing
let composer;
let bloomPass;
let bokehPass;
const passResolutionX = Math.max(1, window.innerWidth);
const passResolutionY = Math.max(1, window.innerHeight);
// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

// Create a ground plane - Updated Material for mirror effect and white color
let plane; // Will be initialized in sceneSetup.js
let planeMaterial; // Will be initialized in sceneSetup.js
// Add ambient light (soft white light)
let ambientLight; // Will be initialized in sceneSetup.js
// Add directional light (like sun) - Intensity might be adjusted after adding env map
let directionalLight; // Will be initialized in sceneSetup.js

// Particle system
let particleSystem; // Will be initialized in sceneSetup.js

// Variable to hold the loaded font
let loadedFont;
// Variable to hold the 3D text mesh
let textMesh;
// Variable to hold the text material
let textMaterial;

// Get the UI elements
const textInput = document.getElementById('textInput');
const fontSelect = document.getElementById('fontSelect');
const materialSelect = document.getElementById('materialSelect');
const colorInput = document.getElementById('colorInput');
const metalnessInput = document.getElementById('metalnessInput');
const roughnessInput = document.getElementById('roughnessInput');
const metalnessValueSpan = document.getElementById('metalnessValue');
const roughnessValueSpan = document.getElementById('roughnessValue');
const metalnessControlDiv = document.getElementById('metalnessControl');
const roughnessControlDiv = document.getElementById('roughnessControl');
// Lighting UI elements
const ambientColorInput = document.getElementById('ambientColorInput');
const ambientIntensityInput = document.getElementById('ambientIntensityInput');
const ambientIntensityValue = document.getElementById('ambientIntensityValue');
const directionalColorInput = document.getElementById('directionalColorInput');
const directionalIntensityInput = document.getElementById('directionalIntensityInput');
const directionalIntensityValue = document.getElementById('directionalIntensityValue');
const directionalPosXInput = document.getElementById('directionalPosXInput');
const directionalPosYInput = document.getElementById('directionalPosYInput');
const directionalPosZInput = document.getElementById('directionalPosZInput');
const directionalPosXValue = document.getElementById('directionalPosXValue');
// const toggleLightingControls = document.getElementById('toggleLightingControls'); // This was for the sub-toggle, now we have category toggles
const lightingControlsWrapper = document.getElementById('lightingControlsWrapper'); // Detail panel for lighting
const directionalPosYValue = document.getElementById('directionalPosYValue');
const toggleFloorVisibility = document.getElementById('toggleFloorVisibility');
const animationControlsWrapper = document.getElementById('animationControlsWrapper'); // Detail panel for animation
const toggleRotationAnimation = document.getElementById('toggleRotationAnimation');
const togglePulsingAnimation = document.getElementById('togglePulsingAnimation');
const toggleFloatingAnimation = document.getElementById('toggleFloatingAnimation');
const toggleSwingingAnimation = document.getElementById('toggleSwingingAnimation');
const toggleEmissivePulseAnimation = document.getElementById('toggleEmissivePulseAnimation');
const toggleColorPulseAnimation = document.getElementById('toggleColorPulseAnimation');
const toggleJitterAnimation = document.getElementById('toggleJitterAnimation');
const toggleOrbitAnimation = document.getElementById('toggleOrbitAnimation');
const resetAnimationsButton = document.getElementById('resetAnimationsButton');
const postProcessingControlsWrapper = document.getElementById('postProcessingControlsWrapper'); // Detail panel for post-processing
const toggleBloomEffect = document.getElementById('toggleBloomEffect');
const bloomStrengthInput = document.getElementById('bloomStrength');
const bloomStrengthValue = document.getElementById('bloomStrengthValue');
const bloomRadiusInput = document.getElementById('bloomRadius');
const bloomRadiusValue = document.getElementById('bloomRadiusValue');
const bloomThresholdInput = document.getElementById('bloomThreshold');
const bloomThresholdValue = document.getElementById('bloomThresholdValue');
const toggleDofEffect = document.getElementById('toggleDofEffect');
const dofFocusInput = document.getElementById('dofFocus');
const dofFocusValue = document.getElementById('dofFocusValue');
const dofApertureInput = document.getElementById('dofAperture');
const dofApertureValue = document.getElementById('dofApertureValue');
const dofMaxblurInput = document.getElementById('dofMaxblur');
const dofMaxblurValue = document.getElementById('dofMaxblurValue');
const toggleParticleEffect = document.getElementById('toggleParticleEffect');
const directionalPosZValue = document.getElementById('directionalPosZValue');

// Category Toggles and Detail Panels
const toggleLightingCategory = document.getElementById('toggleLightingCategory');
const toggleAnimationCategory = document.getElementById('toggleAnimationCategory');
const togglePostProcessCategory = document.getElementById('togglePostProcessCategory');
const toggleOtherCategory = document.getElementById('toggleOtherCategory');

// Detail panel wrappers (some might be reused from previous structure)
// lightingControlsWrapper is already defined above
// animationControlsWrapper is already defined above
// postProcessingControlsWrapper is already defined above
const settingsDetailContainer = document.getElementById('settingsDetailContainer'); // The main container for all detail panels
const otherSettingsWrapper = document.getElementById('otherSettingsWrapper'); // Detail panel for other settings


// Set camera initial position
camera.position.set(0, 75, 150); // Position camera closer to the text

// Animation loop
let clock = new THREE.Clock(); // アニメーション用に時間経過を取得するためのClockオブジェクト

function animate() {
    requestAnimationFrame(animate);

    // Update controls (for inertia and user interaction)
    controls.update();

    const elapsedTime = clock.getElapsedTime(); // アプリケーション開始からの経過時間を取得

    // Call animation updates from animations.js
    updateAllAnimations(elapsedTime);

    // Render the scene with the camera
    composer.render();
}

// Handle window resize
window.addEventListener('resize', () => {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    // Update camera projection matrix
    camera.updateProjectionMatrix();
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight); // Update composer size
});

function init() {
    // Set renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Add renderer's DOM element to the body
    document.body.appendChild(renderer.domElement);

    initSceneSetup(); // From sceneSetup.js
    initTextManager(); // From textManager.js, which includes loadFontAndUpdateText()
    initPostProcessing(); // From postProcessing.js
    initUIEventListeners(); // From uiControls.js

    animate(); // Start the animation loop
    console.log('Application initialized and animation loop started.');
}

init(); // Start the application
