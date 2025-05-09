import { initVideoRecorder } from './videoRecorder.js';

// scriptタグで使用する場合、これらはTHREEオブジェクト経由でグローバルに利用可能です。

// グローバル変数 (プロジェクトが大きくなる場合は、後でカプセル化を検討してください)
window.scene = null;
window.camera = null;
window.renderer = null;
window.controls = null;
window.composer = null;
window.bloomPass = null;
window.bokehPass = null;
window.passResolutionX = 1; // デフォルト値、後で更新されます
window.passResolutionY = 1; // デフォルト値、後で更新されます

window.plane = null;
// window.planeMaterial = null; // Reflectorは反射用の独自マテリアルを扱います

window.ambientLight = null;
window.directionalLight = null;

window.particleSystem = null;

window.loadedFont = null;
window.textMesh = null;
window.textMaterial = null; // This will hold the current material for the text

// UI要素 (これらのIDがHTMLと一致することを確認してください)
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


// アニメーション用クロック
const clock = new THREE.Clock();

// --- 初期化関数 ---
function init() {
    // シーン
    window.scene = new THREE.Scene();
    window.scene.background = new THREE.Color(0xcce0ff); // 明るい青色の背景
    window.scene.fog = new THREE.Fog(0xcce0ff, 200, 500); // 背景に合わせたフォグ

    // カメラ
    window.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000); // FOVを75から50に変更
    window.camera.position.set(0, 75, 200); // Z位置を150から200に変更
    
    // レンダラー
    window.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); // preserveDrawingBuffer: 録画用
    window.renderer.setSize(window.innerWidth, window.innerHeight);
    window.renderer.shadowMap.enabled = true;
    window.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(window.renderer.domElement);

    // ポストプロセッシング解像度
    window.passResolutionX = Math.max(1, window.innerWidth);
    window.passResolutionY = Math.max(1, window.innerHeight);

    // 他のモジュール/コンポーネントを初期化
    initSceneSetup();     // sceneSetup.js より - 平面、ライト、コントロール、環境マップ、パーティクルを設定
    initTextManager();    // textManager.js より - 初期フォントとテキストを読み込み
    initPostProcessing(); // postProcessing.js より - コンポーザーとパスを設定
    initUIEventListeners(); // uiControls.js より - すべてのUIイベントリスナーを設定

    // ビデオレコーダーを初期化
    // renderer.domElement が利用可能であることを確認
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

    // アニメーションループを開始
    animate();
    console.log('Application initialized and animation loop started.');
}

// --- アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // アニメーションを更新
    updateAllAnimations(elapsedTime);

    // パーティクルを更新 (updateAllAnimations とは別に独自のロジックがある場合)
    // updateParticles(elapsedTime); // パーティクルに個別の更新がある場合の例

    // コントロールを更新
    if (window.controls) window.controls.update();

    // シーンをレンダリング
    if (window.composer) {
        window.composer.render();
    } else if (window.renderer && window.scene && window.camera) {
        window.renderer.render(window.scene, window.camera);
    }
}

// --- ウィンドウリサイズハンドラ ---
function onWindowResize() {
    if (window.camera && window.renderer) {
        window.camera.aspect = window.innerWidth / window.innerHeight;
        window.camera.updateProjectionMatrix();
        window.renderer.setSize(window.innerWidth, window.innerHeight);

        // ポストプロセッシングの解像度とパスサイズを更新
        window.passResolutionX = Math.max(1, window.innerWidth);
        window.passResolutionY = Math.max(1, window.innerHeight);

        if (window.composer) {
            window.composer.setSize(window.innerWidth, window.innerHeight);
        }
        if (window.bloomPass) {
            // UnrealBloomPassのコンストラクタはVector2を取るが、必要に応じてサイズを更新可能
            // bloomPass.setSize(window.innerWidth, window.innerHeight); // setSizeが利用可能か、再作成が必要か確認
        }
        if (window.bokehPass) {
            // BokehPassは解像度変更のために特定の更新または再作成が必要な場合がある
            // bokehPass.uniforms['aspect'].value = window.innerWidth / window.innerHeight;
        }
        // ポストプロセッシング用の特定のリサイズハンドラが存在する場合は呼び出す
        // onPostProcessingResize(); // この関数が詳細なパスのリサイズを処理すると仮定
    }
}
window.addEventListener('resize', onWindowResize);

// --- アプリケーションを開始 ---
// 初期化前にDOMが完全に読み込まれていることを確認 (特にスクリプトが<head>内にある場合)
// ただし、scriptタグに `defer` があれば、通常これは問題になりません。
// 堅牢性のために:
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init(); // または、DOMContentLoadedが既に発火済み
}
