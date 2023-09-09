import {useEffect, useRef} from "react";
import {
    DrawingUtils,
    FilesetResolver,
    LandmarkData, NormalizedLandmark,
    PoseLandmarker,
    PoseLandmarkerResult
} from "@mediapipe/tasks-vision";
import styles from "./CameraPage.module.css";
import {assertExist} from "../../utils/exist.assertion.ts";
import {hasGetUserMedia} from "../../utils/hasGetUserMedia.util.ts";
import {BODY_LANDMARK_INDEXES} from "../../consts/body-landmark-indexes.const.ts";
import {BODY_CONNECTORS_COLORS, BODY_LANDMARK_COLORS} from "../../consts/drawing-colors.const.ts";

let lastVideoTime = -1;

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

export default function CameraPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<PoseLandmarker>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
            const canvasCtx = canvasRef.current?.getContext("2d");
            const drawingUtils = new DrawingUtils(canvasCtx);

            assertExist(canvasCtx, "canvasCtx");
            assertExist(videoRef.current, "videoRef.current");

            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener("loadeddata", () => predictWebcam(canvasCtx, drawingUtils))
        });
    }

    const predictWebcam = (canvasCtx: CanvasRenderingContext2D, drawingUtils: DrawingUtils) => {
        assertExist(videoRef.current, "videoRef.current");

        const startTimeMs = performance.now();

        if (lastVideoTime !== videoRef.current.currentTime) {
            lastVideoTime = videoRef.current.currentTime;

            landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs, (result: PoseLandmarkerResult) => {
                assertExist(canvasCtx, "canvasCtx");
                assertExist(canvasRef.current, "canvasRef.current")

                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                result.landmarks.forEach((landmark: NormalizedLandmark) => {
                    drawingUtils.drawLandmarks(landmark, {
                        radius: (landmarkData: LandmarkData) => DrawingUtils.lerp(landmarkData.from.z, -0.15, 0.1, 5, 1),
                        color: (landmarkData: LandmarkData) => {
                            if (BODY_LANDMARK_INDEXES.ELBOWS.includes(landmarkData.index)) return BODY_LANDMARK_COLORS.ELBOWS;
                            if (
                                BODY_LANDMARK_INDEXES.SHOULDERS.includes(landmarkData.index) ||
                                BODY_LANDMARK_INDEXES.HANDS.includes(landmarkData.index)
                            ) return BODY_LANDMARK_COLORS.SHOULDERS_HANDS;

                            return BODY_LANDMARK_COLORS.DEFAULT;
                        },
                    });

                    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
                        color: (landmarkData: LandmarkData) => {
                            if (
                                BODY_LANDMARK_INDEXES.ELBOWS.includes(landmarkData.index) ||
                                BODY_LANDMARK_INDEXES.SHOULDERS.includes(landmarkData.index) ||
                                BODY_LANDMARK_INDEXES.HANDS.includes(landmarkData.index)
                            ) return BODY_CONNECTORS_COLORS.ELBOWS_SHOULDERS_HANDS

                            return BODY_CONNECTORS_COLORS.DEFAULT;
                        },
                    });
                });

                canvasCtx.restore();
            });
        }

        window.requestAnimationFrame(() => predictWebcam(canvasCtx, drawingUtils));
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
