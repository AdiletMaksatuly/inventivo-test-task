import {useEffect, useRef} from "react";
import {FilesetResolver, PoseLandmarker} from "@mediapipe/tasks-vision";
import styles from "./CameraPage.module.css";
import {assertExist} from "../../utils/exist.assertion.ts";
import {hasGetUserMedia} from "../../utils/hasGetUserMedia.util.ts";

let lastVideoTime = -1;

export default function CameraPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<PoseLandmarker>(null);

    const init = async  () => {
        if(!hasGetUserMedia()) {
            alert("Ваш браузер не поддерживает доступ к камере");
            return;
        }

        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");

        landmarkerRef.current = await PoseLandmarker.createFromOptions(
            vision,
            {
                baseOptions: {
                    modelAssetPath: "/src/assets/models/pose_landmarker_lite.task"
                },
                runningMode: "VIDEO",
            });

        navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: false,
        }).then((stream) => {
            assertExist(videoRef.current, "videoRef.current");

            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener("loadeddata", predictWebcam)
        });
    }

    const predictWebcam = () => {
        assertExist(videoRef.current, "videoRef.current");

        const startTimeMs = performance.now();

        if (lastVideoTime !== videoRef.current.currentTime) {
            lastVideoTime = videoRef.current.currentTime;

            landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs, (result: any) => {
                console.log(result);
            });
        }

        window.requestAnimationFrame(predictWebcam);
    }


    useEffect(() => {
        init();
        }, []);

    return <section>
        <h1>Camera page</h1>

        <video className={styles.video} autoPlay ref={videoRef}></video>
    </section>;
}
