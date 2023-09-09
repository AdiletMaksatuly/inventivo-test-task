export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const connectToCamera = async () => {
    return navigator.mediaDevices.getUserMedia({
        video: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
        audio: false,
    })
}
