function updateAllAnimations(elapsedTime) {
    if (textMesh) {
        if (toggleRotationAnimation.checked) {
            textMesh.rotation.y += 0.005;
        }

        if (toggleFloatingAnimation.checked) {
            textMesh.position.y = textMesh.userData.baseY + Math.sin(elapsedTime * 2) * 5;
        } else {
            if (textMesh.position.y !== textMesh.userData.baseY) {
                textMesh.position.y = textMesh.userData.baseY;
            }
        }

        if (togglePulsingAnimation.checked) {
            const scaleFactor = 1 + Math.sin(elapsedTime * 3) * 0.1;
            textMesh.scale.set(textMesh.userData.baseScale.x * scaleFactor, textMesh.userData.baseScale.y * scaleFactor, textMesh.userData.baseScale.z * scaleFactor);
        } else {
            if (textMesh.scale.x !== textMesh.userData.baseScale.x || textMesh.scale.y !== textMesh.userData.baseScale.y || textMesh.scale.z !== textMesh.userData.baseScale.z) {
                textMesh.scale.set(textMesh.userData.baseScale.x, textMesh.userData.baseScale.y, textMesh.userData.baseScale.z);
            }
        }

        if (toggleSwingingAnimation.checked) {
            textMesh.rotation.x = textMesh.userData.baseRotationX + Math.sin(elapsedTime * 1.5) * 0.2;
        } else {
            if (textMesh.rotation.x !== textMesh.userData.baseRotationX) {
                textMesh.rotation.x = textMesh.userData.baseRotationX;
            }
        }

        if (toggleEmissivePulseAnimation.checked && textMaterial && textMaterial.isMeshStandardMaterial) {
            const pulseFactor = (Math.sin(elapsedTime * 2.5) + 1) / 2;
            const emissiveColor = new THREE.Color(textMaterial.color.getHex());
            emissiveColor.multiplyScalar(pulseFactor * 0.6);
            textMaterial.emissive.set(emissiveColor);
            textMaterial.emissiveIntensity = 1.0;
        } else if (textMaterial && textMaterial.isMeshStandardMaterial) {
            textMaterial.emissive.setHex(textMesh.userData.baseEmissive !== undefined ? textMesh.userData.baseEmissive : 0x000000);
        }

        if (toggleColorPulseAnimation.checked && textMaterial && textMesh.userData.baseColor !== undefined) {
            const pulseFactor = (Math.sin(elapsedTime * 2.0) + 1) / 2 * 0.5 + 0.5;
            const newColor = new THREE.Color(textMesh.userData.baseColor);
            newColor.multiplyScalar(pulseFactor);
            textMaterial.color.set(newColor);
        } else if (textMaterial && textMesh.userData.baseColor !== undefined) {
            if (textMaterial.color.getHex() !== textMesh.userData.baseColor) {
                textMaterial.color.setHex(textMesh.userData.baseColor);
            }
        }

        let currentX = textMesh.userData.basePosition.x;
        let currentZ = textMesh.userData.basePosition.z;

        if (toggleOrbitAnimation.checked) {
            const orbitRadius = 60;
            const orbitSpeed = 0.5;
            currentX = Math.cos(elapsedTime * orbitSpeed) * orbitRadius;
            currentZ = Math.sin(elapsedTime * orbitSpeed) * orbitRadius;
        }

        if (toggleJitterAnimation.checked) {
            const jitterAmount = 1.5;
            currentX += (Math.random() - 0.5) * jitterAmount;
            currentZ += (Math.random() - 0.5) * jitterAmount;
        }
        
        textMesh.position.x = currentX;
        textMesh.position.z = currentZ;
    }

    // パーティクルが存在し、表示されている場合にアニメーションさせる
    if (particleSystem && particleSystem.visible) {
        const positions = particleSystem.geometry.attributes.position.array;
        const velocities = particleSystem.geometry.attributes.velocity.array;
        const boundingBoxSize = 350; // パーティクルが動き回る範囲（中心からの距離）

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];     // x
            positions[i + 1] += velocities[i+1]; // y
            positions[i + 2] += velocities[i+2]; // z

            // 境界チェックと折り返し
            if (positions[i] > boundingBoxSize || positions[i] < -boundingBoxSize) velocities[i] *= -1;
            if (positions[i+1] > boundingBoxSize || positions[i+1] < -boundingBoxSize) velocities[i+1] *= -1;
            if (positions[i+2] > boundingBoxSize || positions[i+2] < -boundingBoxSize) velocities[i+2] *= -1;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true; // ★★★非常に重要★★★
    }
}

function resetAllAnimations() { // 他の resetAnimations との競合を避けるためにリネーム
    toggleRotationAnimation.checked = false;
    toggleFloatingAnimation.checked = false;
    togglePulsingAnimation.checked = false;
    toggleSwingingAnimation.checked = false;
    toggleEmissivePulseAnimation.checked = false;
    toggleColorPulseAnimation.checked = false;
    toggleJitterAnimation.checked = false;
    toggleOrbitAnimation.checked = false;

    if (textMesh && textMesh.userData) {
        if (textMesh.userData.basePosition) {
            textMesh.position.set(textMesh.userData.basePosition.x, textMesh.userData.basePosition.y, textMesh.userData.basePosition.z);
        }
        textMesh.rotation.set(textMesh.userData.baseRotationX !== undefined ? textMesh.userData.baseRotationX : 0, 0, 0);
        if (textMesh.userData.baseScale) {
            textMesh.scale.set(textMesh.userData.baseScale.x, textMesh.userData.baseScale.y, textMesh.userData.baseScale.z);
        }
        if (textMaterial && textMaterial.isMeshStandardMaterial && textMesh.userData.baseEmissive !== undefined) {
            textMaterial.emissive.setHex(textMesh.userData.baseEmissive);
        }
        if (textMaterial && textMesh.userData.baseColor !== undefined) {
            textMaterial.color.setHex(textMesh.userData.baseColor);
        }
    }
    console.log('Animations reset.');
}