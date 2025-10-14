console.log("✅ JS file loaded");

async function startCamera() {
  const video = document.getElementById("webcam");

  try {
    // Ask for webcam permission
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });

    // Send the video stream to the <video> element
    video.srcObject = stream;

    console.log("🎥 Webcam feed started");
  } catch (err) {
    console.error("❌ Error accessing webcam:", err);
    alert("Could not access webcam. Please allow camera permissions.");
  }
}

// Start as soon as the page loads
startCamera();
