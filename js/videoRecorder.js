// js/videoRecorder.js
let mediaRecorder;
let recordedChunks = [];
let canvasToRecord;
let canvasStream;

let recordButton;
let videoFormatSelect;
let recordingStatus;
let downloadLink;

const FRAME_RATE = 30; // Desired frame rate for recording

export function initVideoRecorder(canvasElement, btnId, formatSelectId, statusId, downloadLinkId) {
    if (!canvasElement || typeof canvasElement.captureStream !== 'function') {
        console.warn("Video recording (canvas.captureStream) is not supported in this browser or canvas is invalid.");
        const button = document.getElementById(btnId);
        if (button) {
            button.disabled = true;
            button.textContent = "録画非対応";
        }
        const controlsContainer = document.getElementById('videoRecordControlsContainer');
        if (controlsContainer) controlsContainer.style.display = 'none'; // Hide all controls
        return false;
    }

    canvasToRecord = canvasElement;
    recordButton = document.getElementById(btnId);
    videoFormatSelect = document.getElementById(formatSelectId);
    recordingStatus = document.getElementById(statusId);
    downloadLink = document.getElementById(downloadLinkId);

    if (!recordButton || !videoFormatSelect || !recordingStatus || !downloadLink) {
        console.error("One or more UI elements for video recording not found.");
        return false;
    }

    recordButton.addEventListener('click', toggleRecording);

    // Check MP4 support (basic check)
    if (!MediaRecorder.isTypeSupported('video/mp4')) {
        const mp4Option = videoFormatSelect.querySelector('option[value="video/mp4"]');
        if (mp4Option) {
            mp4Option.disabled = true;
            mp4Option.textContent += " (非対応)";
        }
    }
    return true;
}

function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    if (!canvasToRecord) {
        console.error("Canvas element not available for recording.");
        alert("録画用のCanvas要素が見つかりません。");
        resetRecordingUI();
        return;
    }

    const selectedMimeType = videoFormatSelect.value || 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(selectedMimeType)) {
        alert(`選択された形式 (${selectedMimeType}) はこのブラウザではサポートされていません。WebM (VP9) を試してください。`);
        console.warn(`MIME type ${selectedMimeType} not supported.`);
        // Fallback or error out
        if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            alert('WebM (VP9) もサポートされていません。録画機能は利用できません。');
            resetRecordingUI(); // Ensure UI is reset
            return;
        }
        // Optionally, force a fallback:
        // videoFormatSelect.value = 'video/webm;codecs=vp9';
        // selectedMimeType = 'video/webm;codecs=vp9';
        return; // For now, just alert and return if selected is not supported
    }

    recordedChunks = [];
    try {
        canvasStream = canvasToRecord.captureStream(FRAME_RATE);
        if (!canvasStream || canvasStream.getTracks().length === 0) {
            throw new Error("Failed to capture stream from canvas. No tracks found.");
        }
        mediaRecorder = new MediaRecorder(canvasStream, { mimeType: selectedMimeType });
    } catch (e) {
        console.error("Error creating MediaRecorder or capturing stream:", e);
        alert(`MediaRecorderの初期化またはストリームキャプチャに失敗しました: ${e.message}`);
        if (canvasStream) {
            canvasStream.getTracks().forEach(track => track.stop());
            canvasStream = null;
        }
        resetRecordingUI();
        return;
    }

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blobMimeType = mediaRecorder.mimeType.split(';')[0]; // e.g. video/webm
        const blob = new Blob(recordedChunks, { type: blobMimeType });
        const videoURL = URL.createObjectURL(blob);

        downloadLink.href = videoURL;
        const fileExtension = blobMimeType === 'video/mp4' ? 'mp4' : 'webm';
        downloadLink.download = `logo_animation.${fileExtension}`;
        downloadLink.click();

        URL.revokeObjectURL(videoURL);
        recordedChunks = [];

        if (canvasStream) {
            canvasStream.getTracks().forEach(track => track.stop());
            canvasStream = null;
        }
        resetRecordingUI();
        mediaRecorder = null; // Fully reset
    };

    mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        alert(`録画エラーが発生しました: ${event.error.name} - ${event.error.message}`);
        if (canvasStream) {
            canvasStream.getTracks().forEach(track => track.stop());
            canvasStream = null;
        }
        resetRecordingUI();
        mediaRecorder = null;
        recordedChunks = [];
    };

    mediaRecorder.start();
    recordButton.textContent = "録画停止";
    recordButton.disabled = false;
    recordingStatus.style.display = "inline";
    videoFormatSelect.disabled = true;
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        recordButton.textContent = "処理中...";
        recordButton.disabled = true;
    } else {
        resetRecordingUI(); // If not recording, ensure UI is consistent
    }
}

function resetRecordingUI() {
    recordButton.textContent = "動画を録画開始";
    recordButton.disabled = false;
    recordingStatus.style.display = "none";
    videoFormatSelect.disabled = false;
}