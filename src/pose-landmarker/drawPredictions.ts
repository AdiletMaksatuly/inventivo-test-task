import {DrawingUtils, LandmarkData, NormalizedLandmark, PoseLandmarker} from "@mediapipe/tasks-vision";
import {BODY_LANDMARK_INDEXES} from "../consts/body-landmark-indexes.const.ts";
import {BODY_CONNECTORS_COLORS, BODY_LANDMARK_COLORS} from "../consts/drawing-colors.const.ts";

export const drawPredictions = (landmarks: NormalizedLandmark[], drawingUtils: DrawingUtils) => {
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
}
