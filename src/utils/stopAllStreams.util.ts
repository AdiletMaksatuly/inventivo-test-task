export const stopAllStreams = (stream: MediaStream | undefined) => stream?.getTracks().forEach((track) => track.stop());
