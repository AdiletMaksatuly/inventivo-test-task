import {LEFT_ARM_INDEXES, RIGHT_ARM_INDEXES} from "../consts/body-landmark-indexes.const.ts";
import {NormalizedLandmark} from "@mediapipe/tasks-vision";
import {calculateAngle} from "../utils/calculateAngle.util.ts";
import {ElbowAngles} from "../model/elbow-angles.model.ts";

export const calculateElbowAngles = (landmarks: NormalizedLandmark[]): ElbowAngles => {

    const defaultPoint = {
        x: 0,
        y: 0,
        z: 0,
    }

    const leftArmPoints = {
        [LEFT_ARM_INDEXES[0]]: { ...defaultPoint },
        [LEFT_ARM_INDEXES[1]]: { ...defaultPoint },
        [LEFT_ARM_INDEXES[2]]: { ...defaultPoint },
    };

    const rightArmPoints = {
        [RIGHT_ARM_INDEXES[0]]: { ...defaultPoint },
        [RIGHT_ARM_INDEXES[1]]: { ...defaultPoint },
        [RIGHT_ARM_INDEXES[2]]: { ...defaultPoint },
    };

    landmarks.forEach((landmark: NormalizedLandmark, index) => {
        if (LEFT_ARM_INDEXES.includes(index)) {
            leftArmPoints[index] = { ...landmark };
        }

        if (RIGHT_ARM_INDEXES.includes(index)) {
            rightArmPoints[index] = { ...landmark };
        }
    });

    return {
        left: Math.round(calculateAngle(leftArmPoints[11], leftArmPoints[13], leftArmPoints[15])),
        right: Math.round(calculateAngle(rightArmPoints[12], rightArmPoints[14], rightArmPoints[16])),
    }
}
