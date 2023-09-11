import {FilesetResolver, PoseLandmarker} from "@mediapipe/tasks-vision";
import poseAsset from "/src/assets/models/pose_landmarker_lite.task";

export const createPoseLandmarker = async (): Promise<PoseLandmarker> => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");

    return await PoseLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath: poseAsset,
            },
            runningMode: "VIDEO",
            minPosePresenceConfidence: 0.9,
            minTrackingConfidence: 0.9,
        });
}
