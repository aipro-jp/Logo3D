function initUIEventListeners() {
    // Text input
    textInput.addEventListener('input', (event) => {
        if (loadedFont) { // loadedFont is global
            createText(event.target.value, loadedFont); // createText is in textManager.js
        }
    });

    // Font select
    fontSelect.addEventListener('change', loadFontAndUpdateText); // loadFontAndUpdateText is in textManager.js

    // Material property inputs
    colorInput.addEventListener('input', updateMaterialPropertiesFromUI);
    metalnessInput.addEventListener('input', updateMaterialPropertiesFromUI);
    roughnessInput.addEventListener('input', updateMaterialPropertiesFromUI);
    materialSelect.addEventListener('change', applySelectedPresetThenUpdateMaterial);

    // Lighting controls
    ambientColorInput.addEventListener('input', updateLightsUI);
    ambientIntensityInput.addEventListener('input', updateLightsUI);
    directionalColorInput.addEventListener('input', updateLightsUI);
    directionalIntensityInput.addEventListener('input', updateLightsUI);
    directionalPosXInput.addEventListener('input', updateLightsUI);
    directionalPosYInput.addEventListener('input', updateLightsUI);
    directionalPosZInput.addEventListener('input', updateLightsUI);

    // --- Category Toggle Logic ---
    const categoryToggles = [
        { checkbox: toggleLightingCategory, panel: lightingControlsWrapper },
        { checkbox: toggleAnimationCategory, panel: animationControlsWrapper },
        { checkbox: togglePostProcessCategory, panel: postProcessingControlsWrapper },
        { checkbox: toggleOtherCategory, panel: otherSettingsWrapper }
    ];

    categoryToggles.forEach(currentToggle => {
        if (currentToggle.checkbox) {
            currentToggle.checkbox.addEventListener('change', function () {
                // If this checkbox is checked, uncheck all others
                if (this.checked) {
                    categoryToggles.forEach(otherToggle => {
                        if (otherToggle.checkbox && otherToggle.checkbox !== this) {
                            otherToggle.checkbox.checked = false;
                        }
                    });
                }

                // Show/hide all panels based on the current state of their respective checkboxes
                let anyPanelActive = false;
                categoryToggles.forEach(toggle => {
                    if (toggle.panel) {
                        // Ensure panel exists before trying to style it
                        if (toggle.checkbox && toggle.checkbox.checked) {
                            toggle.panel.style.display = 'flex'; // Or 'block', 'grid' depending on your CSS for the panel
                            anyPanelActive = true;
                        } else {
                            toggle.panel.style.display = 'none';
                        }
                    }
                });

                // Show or hide the main detail container based on whether any panel is active
                if (settingsDetailContainer) { // settingsDetailContainer is global from main.js
                    settingsDetailContainer.style.display = anyPanelActive ? 'block' : 'none';
                }
            });
        }
    });

    // Ensure all individual detail panels are initially hidden by JS as well (CSS handles settingsDetailContainer)
    categoryToggles.forEach(toggle => {
        if (toggle.panel && (!toggle.checkbox || !toggle.checkbox.checked)) {
            toggle.panel.style.display = 'none';
        }
    });

    // --- Other Toggles (Floor, Particles) ---
    if (toggleFloorVisibility && plane && planeMaterial) { // plane & planeMaterial are global
        toggleFloorVisibility.addEventListener('change', function () {
            if (this.checked) {
                plane.visible = true;
                // planeMaterial.transparent = false; // Assuming you want it opaque when visible
                // planeMaterial.opacity = 1.0;
            } else {
                plane.visible = false;
            }
        });
    }

    if (toggleParticleEffect && particleSystem) { // particleSystem is global
        toggleParticleEffect.addEventListener('change', function () {
            particleSystem.visible = this.checked;
        });
    }

    // Animation reset button
    if (resetAnimationsButton) {
        resetAnimationsButton.addEventListener('click', resetAllAnimations); // resetAllAnimations is in animations.js
    }

    // Bloom effect UI listeners
    if (toggleBloomEffect && bloomPass && bloomStrengthInput && bloomRadiusInput && bloomThresholdInput) { // bloomPass is global
        toggleBloomEffect.addEventListener('change', updateBloomEffectUI);
        bloomStrengthInput.addEventListener('input', updateBloomEffectUI);
        bloomRadiusInput.addEventListener('input', updateBloomEffectUI);
        bloomThresholdInput.addEventListener('input', updateBloomEffectUI);
    }

    // DOF effect UI listeners
    if (toggleDofEffect && bokehPass && dofFocusInput && dofApertureInput && dofMaxblurInput) { // bokehPass is global
        toggleDofEffect.addEventListener('change', updateDofEffectUI);
        dofFocusInput.addEventListener('input', updateDofEffectUI);
        dofApertureInput.addEventListener('input', updateDofEffectUI);
        dofMaxblurInput.addEventListener('input', updateDofEffectUI);
    }

    // Initial UI updates
    updateLightsUI();
    updateBloomEffectUI();
    updateDofEffectUI();
}

function updateMaterialPropertiesFromUI() {
    const selectedMaterialType = materialSelect.value;
    let needsNewMaterialInstance = false;

    if (!textMaterial) needsNewMaterialInstance = true;
    else if (selectedMaterialType === 'phong' && !(textMaterial instanceof THREE.MeshPhongMaterial)) needsNewMaterialInstance = true;
    else if ((selectedMaterialType.startsWith('standard_') || ['gold', 'silver', 'copper'].includes(selectedMaterialType)) && !(textMaterial instanceof THREE.MeshStandardMaterial)) needsNewMaterialInstance = true;

    if (needsNewMaterialInstance) {
        if (textMaterial) textMaterial.dispose();
        if (selectedMaterialType === 'phong') {
            textMaterial = new THREE.MeshPhongMaterial();
        } else {
            textMaterial = new THREE.MeshStandardMaterial();
            if (scene.environment) { // scene is global
                textMaterial.envMap = scene.environment;
                textMaterial.envMapIntensity = 1.5;
            }
        }
        if (textMesh) textMesh.material = textMaterial; // textMesh is global
    }

    if (selectedMaterialType === 'phong') {
        if (textMaterial) textMaterial.color.set(colorInput.value);
        metalnessControlDiv.classList.add('disabled-slider');
        roughnessControlDiv.classList.add('disabled-slider');
        metalnessInput.disabled = true;
        roughnessInput.disabled = true;
    } else {
        metalnessControlDiv.classList.remove('disabled-slider');
        roughnessControlDiv.classList.remove('disabled-slider');
        metalnessInput.disabled = false;
        roughnessInput.disabled = false;
        if (textMaterial) {
            textMaterial.color.set(colorInput.value);
            textMaterial.metalness = parseFloat(metalnessInput.value);
            textMaterial.roughness = parseFloat(roughnessInput.value);
            if (textMaterial.isMeshStandardMaterial && textMesh && textMesh.userData) {
                textMesh.userData.baseColor = textMaterial.color.getHex();
                textMaterial.envMapIntensity = 1.5;
            }
        }
    }

    metalnessValueSpan.innerText = parseFloat(metalnessInput.value).toFixed(2);
    roughnessValueSpan.innerText = parseFloat(roughnessInput.value).toFixed(2);
    if (textMaterial) textMaterial.needsUpdate = true;
}

function applySelectedPresetThenUpdateMaterial() {
    const selectedMaterialType = materialSelect.value;
    if (selectedMaterialType === 'gold') { colorInput.value = '#FFD700'; metalnessInput.value = "1.0"; roughnessInput.value = "0.1"; }
    else if (selectedMaterialType === 'silver') { colorInput.value = '#C0C0C0'; metalnessInput.value = "1.0"; roughnessInput.value = "0.1"; }
    else if (selectedMaterialType === 'copper') { colorInput.value = '#B87333'; metalnessInput.value = "1.0"; roughnessInput.value = "0.2"; }
    else if (selectedMaterialType === 'standard_nonmetal') { metalnessInput.value = "0.0"; roughnessInput.value = "0.8"; }
    // For standard_metal, we don't change color, just ensure metalness is high
    else if (selectedMaterialType === 'standard_metal') { metalnessInput.value = "1.0"; roughnessInput.value = "0.3"; } // Example roughness
    updateMaterialPropertiesFromUI();
}

function updateLightsUI() {
    if (ambientLight && ambientColorInput && ambientIntensityInput && ambientIntensityValue) {
                const newAmbientColor = ambientColorInput.value;
                const newAmbientIntensity = parseFloat(ambientIntensityInput.value);
                console.log('Ambient Light - UI values:', { color: newAmbientColor, intensity: newAmbientIntensity });
                if (ambientLight) {
                    console.log('Ambient Light object BEFORE update:', ambientLight.color.getHexString(), ambientLight.intensity);
                    ambientLight.color.set(newAmbientColor);
                    ambientLight.intensity = newAmbientIntensity;
                    ambientIntensityValue.innerText = ambientLight.intensity.toFixed(2);
                    console.log('Ambient Light object AFTER update:', ambientLight.color.getHexString(), ambientLight.intensity);
                } else {
                    console.error('ambientLight object is not defined!');
                }
            } else {
                console.warn('Ambient light or its UI elements are not fully available for update.');
            }
        
            if (directionalLight && directionalColorInput && directionalIntensityInput && directionalIntensityValue &&
                directionalPosXInput && directionalPosYInput && directionalPosZInput &&
                directionalPosXValue && directionalPosYValue && directionalPosZValue) {
                const newDirectionalColor = directionalColorInput.value;
                const newDirectionalIntensity = parseFloat(directionalIntensityInput.value);
                const newDirectionalPosX = parseFloat(directionalPosXInput.value);
                const newDirectionalPosY = parseFloat(directionalPosYInput.value);
                const newDirectionalPosZ = parseFloat(directionalPosZInput.value);
                console.log('Directional Light - UI values:', { color: newDirectionalColor, intensity: newDirectionalIntensity, x: newDirectionalPosX, y: newDirectionalPosY, z: newDirectionalPosZ });
                if (directionalLight) {
                    console.log('Directional Light object BEFORE update:', directionalLight.color.getHexString(), directionalLight.intensity, directionalLight.position);
                    directionalLight.color.set(newDirectionalColor);
                    directionalLight.intensity = newDirectionalIntensity;
                    directionalLight.position.set(newDirectionalPosX, newDirectionalPosY, newDirectionalPosZ);
                    directionalIntensityValue.innerText = directionalLight.intensity.toFixed(2);
                    directionalPosXValue.innerText = directionalLight.position.x.toFixed(0);
                    directionalPosYValue.innerText = directionalLight.position.y.toFixed(0);
                    directionalPosZValue.innerText = directionalLight.position.z.toFixed(0);
                    console.log('Directional Light object AFTER update:', directionalLight.color.getHexString(), directionalLight.intensity, directionalLight.position);
                } else {
                    console.error('directionalLight object is not defined!');
                }
            } else {
                console.warn('Directional light or its UI elements are not fully available for update.');
            }
        }

function updateBloomEffectUI() {
    const bloomSliderControls = document.querySelectorAll('.bloom-slider-control');
    if (toggleBloomEffect && bloomPass && bloomStrengthInput && bloomRadiusInput && bloomThresholdInput && bloomStrengthValue && bloomRadiusValue && bloomThresholdValue) {
        if (toggleBloomEffect.checked) {
            console.log('Bloom ON - Strength:', parseFloat(bloomStrengthInput.value), 'Radius:', parseFloat(bloomRadiusInput.value), 'Threshold:', parseFloat(bloomThresholdInput.value));
            bloomPass.strength = parseFloat(bloomStrengthInput.value);
            bloomPass.radius = parseFloat(bloomRadiusInput.value);
            bloomPass.threshold = parseFloat(bloomThresholdInput.value);
            bloomSliderControls.forEach(control => control.style.display = 'flex');
        } else {
            console.log('Bloom OFF');
            bloomPass.strength = 0;
            bloomSliderControls.forEach(control => control.style.display = 'none');
        }
        bloomStrengthValue.textContent = parseFloat(bloomStrengthInput.value).toFixed(2);
        bloomRadiusValue.textContent = parseFloat(bloomRadiusInput.value).toFixed(2);
        bloomThresholdValue.textContent = parseFloat(bloomThresholdInput.value).toFixed(2);
    }
}

function updateDofEffectUI() {
    const dofSliderControls = document.querySelectorAll('.dof-slider-control');
    if (toggleDofEffect && bokehPass && dofFocusInput && dofApertureInput && dofMaxblurInput && dofFocusValue && dofApertureValue && dofMaxblurValue) {
        if (toggleDofEffect.checked) {
            console.log('DOF ON - Focus:', parseFloat(dofFocusInput.value), 'Aperture:', parseFloat(dofApertureInput.value) * 0.00001, 'Maxblur:', parseFloat(dofMaxblurInput.value));
            bokehPass.enabled = true;
            bokehPass.uniforms['focus'].value = parseFloat(dofFocusInput.value);
            bokehPass.uniforms['aperture'].value = parseFloat(dofApertureInput.value) * 0.00001;
            bokehPass.uniforms['maxblur'].value = parseFloat(dofMaxblurInput.value);
            dofSliderControls.forEach(control => control.style.display = 'flex');
        } else {
            console.log('DOF OFF');
            bokehPass.enabled = false;
            dofSliderControls.forEach(control => control.style.display = 'none');
        }
        dofFocusValue.textContent = parseFloat(dofFocusInput.value).toFixed(0);
        dofApertureValue.textContent = parseFloat(dofApertureInput.value).toFixed(2);
        dofMaxblurValue.textContent = parseFloat(dofMaxblurInput.value).toFixed(4);
    }
}
