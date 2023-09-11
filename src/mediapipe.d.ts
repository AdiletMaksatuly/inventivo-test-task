declare module "@mediapipe/tasks-vision" {
    /*
       '*' wildcard symbol don't work here,
       app can't build due to the error: '"@mediapipe/tasks-vision" has no exported member'
       So I have to re-export all the modules manually.
     */

    export { FilesetResolver, DrawingUtils, LandmarkData, NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision/vision.d.ts";
}

declare module "*.task";
