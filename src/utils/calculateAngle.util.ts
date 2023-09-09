interface Point {
    x: number;
    y: number;
    z: number;
}
export const calculateAngle = (a: Point, b: Point, c: Point): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    const angle = Math.abs(radians * (180 / Math.PI));

    return angle > 180 ? 360 - angle : angle;
}
