const fontLoader = new THREE.FontLoader();

const fonts = {
    helvetiker_regular: 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    optimer_regular: 'https://threejs.org/examples/fonts/optimer_regular.typeface.json',
    gentilis_regular: 'https://threejs.org/examples/fonts/gentilis_regular.typeface.json',
    'droid/droid_sans_mono_regular': 'https://threejs.org/examples/fonts/droid/droid_sans_mono_regular.typeface.json',
    'droid/droid_serif_regular': 'https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json',
    gentilis_bold: 'https://threejs.org/examples/fonts/gentilis_bold.typeface.json',
    helvetiker_bold: 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
    optimer_bold: 'https://threejs.org/examples/fonts/optimer_bold.typeface.json'
};

function initTextManager() {
    loadFontAndUpdateText(); // 初期状態でデフォルトフォントを読み込む
}

function createText(text, font) {
    if (textMesh) {
        scene.remove(textMesh);
        textMesh.geometry.dispose();
    }

    if (!text || !font) {
        textMesh = null;
        return;
    }

    const textGeometry = new THREE.TextGeometry(text, {
        font: font,
        size: 50,
        height: 10,
        curveSegments: 32,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1.5,
        bevelOffset: 0,
        bevelSegments: 15
    });

    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textGeometry.translate(-textWidth / 2, 0, 0);

    textMesh = new THREE.Mesh(textGeometry, textMaterial); // textMaterial はグローバルに利用可能か、引数で渡されることを想定
    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
    textMesh.userData.baseY = plane.position.y + textHeight * 0.5 + 40;
    textMesh.position.y = textMesh.userData.baseY;
    textMesh.userData.baseScale = { x: textMesh.scale.x, y: textMesh.scale.y, z: textMesh.scale.z };
    textMesh.userData.basePosition = { x: textMesh.position.x, y: textMesh.userData.baseY, z: textMesh.position.z };
    textMesh.userData.baseRotationX = textMesh.rotation.x;
    if (textMaterial && textMaterial.isMeshStandardMaterial) {
        textMesh.userData.baseColor = textMaterial.color.getHex();
        textMesh.userData.baseEmissive = textMaterial.emissive.getHex();
    }
    textMesh.castShadow = true;
    scene.add(textMesh);
    console.log('3D text updated:', text);
}

function loadFontAndUpdateText() {
    const selectedFontKey = fontSelect.value; // fontSelect はグローバルに利用可能であることを想定
    const fontUrl = fonts[selectedFontKey];

    if (!fontUrl) {
        console.error('Selected font URL not found:', selectedFontKey);
        return;
    }
    console.log('Attempting to load font:', fontUrl);

    fontLoader.load(
        fontUrl,
        function (font) {
            console.log('Font loaded successfully!');
            loadedFont = font;
            createText(textInput.value, loadedFont); // textInput はグローバルに利用可能であることを想定
            applySelectedPresetThenUpdateMaterial(); // この関数はグローバルに利用可能か、uiControls.js にあることを想定
        },
        function (xhr) { console.log('Font loading progress: ' + (xhr.loaded / xhr.total * 100).toFixed(2) + '% loaded'); },
        function (error) { console.error('An error happened while loading the font:', error); }
    );
}