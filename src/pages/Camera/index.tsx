import {useEffect, useRef} from "react";
import {DrawingUtils, FilesetResolver, PoseLandmarker} from "@mediapipe/tasks-vision";
import styles from "./CameraPage.module.css";
import {assertExist} from "../../utils/exist.assertion.ts";
import {hasGetUserMedia} from "../../utils/hasGetUserMedia.util.ts";

let lastVideoTime = -1;

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

export default function CameraPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<PoseLandmarker>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canvasCtx = canvasRef.current?.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx);

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
            video: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
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
                assertExist(canvasCtx, "canvasCtx");
                assertExist(canvasRef.current, "canvasRef.current")

                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                for (const landmark of result.landmarks) {
                    drawingUtils.drawLandmarks(landmark, {
                        radius: (data: any) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1)
                    });
                    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
                }
                canvasCtx.restore();
            });
        }

        window.requestAnimationFrame(predictWebcam);
    }


    useEffect(() => {
        init();
        }, []);

    return <section>
        <h1>Camera page</h1>

        <div className={styles.area}>
            <video className={styles.video} autoPlay ref={videoRef} />
            <canvas ref={canvasRef} className={styles.canvas} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
        </div>
    </section>;
}
