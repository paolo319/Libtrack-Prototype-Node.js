
const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const result = document.getElementById("result");
const scanBtn = document.getElementById("scanBtn");

const context = canvas.getContext("2d");

let worker = null;

// Expected format: 00-0000-000000
const id_pattern = /\d{2}-\d{4}-\d{6}/;

scanBtn.addEventListener("click", async () => {
    try {
        if (!camera.srcObject || !camera.videoWidth) {
            result.textContent = "Please open the camera first.";
            return;
        }

        scanBtn.disabled = true;
        result.textContent = "Preparing image...";

        // Enlarge the image to help Tesseract read small text
        canvas.width = camera.videoWidth * 2;
        canvas.height = camera.videoHeight * 2;

        context.filter = "grayscale(1) contrast(2)";
        context.drawImage(
            camera,
            0,
            0,
            canvas.width,
            canvas.height
        );
        context.filter = "none";

        // Initialize Tesseract once
        if (!worker) {
            result.textContent = "Loading text reader...";

            worker = await Tesseract.createWorker("eng");

            await worker.setParameters({
                tessedit_char_whitelist: "0123456789-",
                tessedit_pageseg_mode: "11"
            });
        }

        result.textContent = "Reading printed student ID...";

        const output = await worker.recognize(canvas);
        const text = output.data.text;

        console.log("Text recognized:", text);

        // Remove spaces and line breaks from OCR output
        const cleanedText = text.replace(/\s/g, "");
        const match = cleanedText.match(id_pattern);

        if (!match) {
            result.textContent =
                "ID not recognized. Hold the printed card closer and try again.";
            return;
        }

        const student_id = match[0];

        result.textContent = "ID detected: " + student_id;

        // Send the recognized ID to your existing Express route
        const response = await fetch("/scanner-visit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                school_id: student_id
            })
        });

        const data = await response.json();

        if (!response.ok) {
            result.textContent = data.message;
            return;
        }

        result.textContent =
            `${data.student.fullname} — ${data.message}`;

        // Reload the dashboard to show the new visit
        window.location.reload();

    } catch (error) {
        console.error("Scanner error:", error);
        result.textContent =
            "Scanning failed. Check the browser console.";
    } finally {
        scanBtn.disabled = false;
    }
});
