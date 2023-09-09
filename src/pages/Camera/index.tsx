import {useEffect, useRef, useState} from "react";
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
import {calculateAngle} from "../../utils/calculateAngle.util.ts";

let lastVideoTime = -1;

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

export default function CameraPage() {
    console.log('RENDER')
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<PoseLandmarker>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [angles, setAngles] = useState<{
        left: number;
        right: number;
    }>({ left: 0, right: 0 });

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
                minPosePresenceConfidence: 0.9,
                minTrackingConfidence: 0.9,
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

                result.landmarks.forEach((landmarks: NormalizedLandmark[]) => {
                    drawingUtils.drawLandmarks(landmarks, {
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

                    drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
                        color: (landmarkData: LandmarkData) => {
                            if (
                                BODY_LANDMARK_INDEXES.ELBOWS.includes(landmarkData.index) ||
                                BODY_LANDMARK_INDEXES.SHOULDERS.includes(landmarkData.index) ||
                                BODY_LANDMARK_INDEXES.HANDS.includes(landmarkData.index)
                            ) return BODY_CONNECTORS_COLORS.ELBOWS_SHOULDERS_HANDS

                            return BODY_CONNECTORS_COLORS.DEFAULT;
                        },
                    });

                    const defaultPoint = {
                        x: 0,
                        y: 0,
                        z: 0,
                    }

                    const leftArmIndexes = [11, 13, 15];

                    const rightArmIndexes = [12, 14, 16];

                    const leftArmPoints = {
                        [leftArmIndexes[0]]: { ...defaultPoint },
                        [leftArmIndexes[1]]: { ...defaultPoint },
                        [leftArmIndexes[2]]: { ...defaultPoint },
                    };

                    const rightArmPoints = {
                        [rightArmIndexes[0]]: { ...defaultPoint },
                        [rightArmIndexes[1]]: { ...defaultPoint },
                        [rightArmIndexes[2]]: { ...defaultPoint },
                    };

                    landmarks.forEach((landmark: NormalizedLandmark, index) => {
                       if (leftArmIndexes.includes(index)) {
                           leftArmPoints[index] = { ...landmark };
                       }

                       if (rightArmIndexes.includes(index)) {
                           rightArmPoints[index] = { ...landmark };
                       }
                    });

                    setAngles({
                        left: Math.round(calculateAngle(leftArmPoints[11], leftArmPoints[13], leftArmPoints[15])),
                        right: Math.round(calculateAngle(rightArmPoints[12], rightArmPoints[14], rightArmPoints[16])),
                    })
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

        <div>
            <h2>Угол в градусах:</h2>
            <h3>В левом локте: { angles.left }</h3>
            <h3>В правом локте: { angles.right }</h3>
        </div>
    </section>;
}
