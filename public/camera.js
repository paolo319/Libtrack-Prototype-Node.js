async function openCamera() {
    try {
        result.textContent = "Opening camera...";
        scanBtn.disabled = true;

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });

        camera.srcObject = cameraStream;
        await camera.play();

        result.textContent = "Camera is live!";
        scanBtn.disabled = false;

        console.log(
            "Camera resolution:",
            camera.videoWidth,
            "x",
            camera.videoHeight
        );

    } catch (error) {
        console.error(error);
        result.textContent = error.name + ": " + error.message;
    }
}

// Open the camera automatically when the page loads
openCamera();
