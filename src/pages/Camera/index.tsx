import {useEffect, useRef, useState} from "react";
import {
    DrawingUtils,
    NormalizedLandmark,
    PoseLandmarker,
} from "@mediapipe/tasks-vision";
import styles from "./CameraPage.module.css";
import {assertExist} from "../../utils/exist.assertion.ts";
import {hasGetUserMedia} from "../../utils/hasGetUserMedia.util.ts";
import {Link} from "react-router-dom";
import {createPoseLandmarker} from "../../pose-landmarker/createPoseLandmarker.ts";
import {CANVAS_HEIGHT, CANVAS_WIDTH, connectToCamera} from "../../pose-landmarker/connectToCamera.ts";
import {drawPredictions} from "../../pose-landmarker/drawPredictions.ts";
import {ElbowAngles} from "../../models/elbow-angles.model.ts";
import {calculateElbowAngles} from "../../pose-landmarker/calculateElbowAngles.ts";
import {stopAllStreams} from "../../utils/stopAllStreams.util.ts";

let animationFrameID = 0;
let lastVideoTime = -1;

export default function CameraPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<PoseLandmarker | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isPermissionDeniedError, setIsPermissionDeniedError] = useState<boolean>(false);

    const [angles, setAngles] = useState<ElbowAngles>({ left: 0, right: 0 });

    const init = async (): Promise<MediaStream | undefined> => {
        assertExist(canvasRef.current, "canvasRef.current");
        assertExist(videoRef.current, "videoRef.current");

        if (!hasGetUserMedia()) {
            alert("Ваш браузер не поддерживает доступ к камере");
            return;
        }

        landmarkerRef.current = await createPoseLandmarker();

        try {
            const videoStream = await connectToCamera()

            const canvasCtx = canvasRef.current.getContext("2d");
            assertExist(canvasCtx, "canvasCtx");
            const drawingUtils = new DrawingUtils(canvasCtx);

            videoRef.current.srcObject = videoStream;
            videoRef.current.addEventListener("loadeddata", () => predictWebcam(canvasCtx, drawingUtils))

            return videoStream;
        } catch (e) {
            if (e instanceof DOMException && e.name === "NotAllowedError") {
                setIsPermissionDeniedError(true)
            }
            throw e;
        }
    }

    const predictWebcam = (canvasCtx: CanvasRenderingContext2D, drawingUtils: DrawingUtils) => {
        assertExist(videoRef.current, "videoRef.current");
        assertExist(landmarkerRef.current, "landmarkerRef.current");

        const startTimeMs = performance.now();

        if (lastVideoTime !== videoRef.current.currentTime) {
            lastVideoTime = videoRef.current.currentTime;

            const result = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

            assertExist(canvasCtx, "canvasCtx");
            assertExist(canvasRef.current, "canvasRef.current")

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            result.landmarks.forEach((landmarks: NormalizedLandmark[]) => {
                drawPredictions(landmarks, drawingUtils);
                setAngles(calculateElbowAngles(landmarks))
            });

            canvasCtx.restore();
        }

        animationFrameID = requestAnimationFrame(() => predictWebcam(canvasCtx, drawingUtils));
    }

    useEffect(() => {
        const videoStream = init();

        return () => {
            cancelAnimationFrame(animationFrameID);
            videoStream.then((stream) => stopAllStreams(stream));
        }
    }, []);

    if (isPermissionDeniedError) {
        return <h1>Ошибка доступа к камере</h1>
    }

    return <section>
        <h1>Camera page</h1>

        <div className={styles.area}>
            <video className={styles.video} autoPlay ref={videoRef} />
            <canvas ref={canvasRef} className={styles.canvas} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
        </div>

        <footer className={styles.footer}>
            <div>
                <h2>Угол в градусах:</h2>
                <h3>В левом локте: {angles.left}</h3>
                <h3>В правом локте: {angles.right}</h3>
            </div>
            <Link to={'/'} className={'btn'}>Стоп</Link>
        </footer>
    </section>;
}
