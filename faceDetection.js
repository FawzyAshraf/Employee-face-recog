import * as faceapi from '@vladmandic/face-api';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as canvas from 'canvas';

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image })


const _dirname = path.dirname(fileURLToPath(import.meta.url))
let data = [];

export const faceDetectionNet = faceapi.nets.ssdMobilenetv1
// export const faceDetectionNet = tinyFaceDetector

// SsdMobilenetv1Options
const minConfidence = 0.5

// TinyFaceDetectorOptions
const inputSize = 408
const scoreThreshold = 0.5

function getFaceDetectorOptions(net) {
    return net === faceapi.nets.ssdMobilenetv1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}

export const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet)

const baseDir = path.resolve(_dirname, '../out')

export function saveFile(fileName, buf) {
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir)
    }

    fs.writeFileSync(path.resolve(baseDir, fileName), buf)
}

export const loadModels = async () => {
    return Promise.all([faceDetectionNet.loadFromDisk('./public/models'),
    faceapi.nets.faceLandmark68Net.loadFromDisk('./public/models'),
    faceapi.nets.faceRecognitionNet.loadFromDisk('./public/models')]
    )
}

await loadModels();

export const registerNewFace = async (name, imageData) => {
    const image = await canvas.loadImage(imageData);
    const result = await faceapi.detectSingleFace(image, faceDetectionOptions).withFaceLandmarks()
        .withFaceDescriptor();
    data.push(new faceapi.LabeledFaceDescriptors(
        name,
        [result.descriptor]
    ))
}

export const checkLogin = async (imageData) => {
    const image = await canvas.loadImage(imageData);
    const result = await faceapi.detectSingleFace(image, faceDetectionOptions).withFaceLandmarks()
        .withFaceDescriptor();

    const faceMatcher = new faceapi.FaceMatcher(data)
    try {
        const bestMatch = faceMatcher.findBestMatch(result.descriptor)
        return bestMatch.toString()
    }
    catch (err) {
        return 'ERROR';
    }
}