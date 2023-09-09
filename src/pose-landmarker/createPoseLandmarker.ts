import {FilesetResolver, PoseLandmarker} from "@mediapipe/tasks-vision";

export const createPoseLandmarker = async (): Promise<PoseLandmarker> => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");

    return await PoseLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath: "/src/assets/models/pose_landmarker_lite.task"
            },
            runningMode: "VIDEO",
            minPosePresenceConfidence: 0.9,
            minTrackingConfidence: 0.9,
        });
}
