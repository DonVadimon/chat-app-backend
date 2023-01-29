import enum
import typing

import os
import json
import cv2
import dlib
import numpy as np

from core.color import ColorProcessor
from core.eyes import EyesColorProcessor
from core.skin import SkinColorProcessor
from core.age import AgeProcessor
from core.gender import GenderProcessor
from settings import WEIGHTS_DIR

# Load the predictor
PREDICTOR_PATH = os.path.join(
    WEIGHTS_DIR, 'shape_predictor_68_face_landmarks.dat')


class FacePartsRanges(enum.Enum):
    FACE_SHAPE = slice(0, 17)
    LEFT_BROW = slice(17, 22)
    RIGHT_BROW = slice(22, 27)
    NOSE = slice(27, 36)
    LEFT_EYE = slice(36, 42)
    RIGHT_EYE = slice(42, 48)
    LIPS = slice(48, 69)


class FaceInfo:
    def __init__(self, skin_color: np.ndarray, eye_color: typing.Dict, hair_color: np.ndarray, age: str, gender: str):
        self.skin_color = ColorProcessor.rgb_array_to_hex(skin_color)
        self.hair_color = ColorProcessor.rgb_array_to_hex(hair_color)
        self.eye_color = eye_color
        self.age = age
        self.gender = gender

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,
                          sort_keys=True, indent=4)


class FaceProcessor:
    # Load the predictor
    PREDICTOR = dlib.shape_predictor(PREDICTOR_PATH)  # type: ignore

    def __init__(self, img: cv2.Mat, face, NO_HAIR: bool):
        self.img = img
        self.face = face
        self.NO_HAIR = NO_HAIR

        # Convert image into grayscale
        self.img_gray = cv2.cvtColor(src=self.img, code=cv2.COLOR_BGR2GRAY)

        self.landmarks = FaceProcessor.PREDICTOR(image=self.img_gray, box=face)

        self.skin_color_processor = SkinColorProcessor(
            img=self.img, face_landmarks=self.landmarks)

        self.eye_color_processor = EyesColorProcessor(
            img=self.img, face_landmarks=self.landmarks)

        self.age_processor = AgeProcessor(
            img=self.img, face_landmarks=self.landmarks, face=face)

        self.gender_processor = GenderProcessor(
            img=self.img, face_landmarks=self.landmarks, face=face)

        if not NO_HAIR:
            from core.hair import HairColorProcessor

            self.hair_color_processor = HairColorProcessor(img=self.img)

    def get_face_info(self):
        hair_color = [158,128,102] if self.NO_HAIR else self.hair_color_processor.get_hair_color()

        return FaceInfo(
            skin_color=self.skin_color_processor.get_skin_mean_color(),
            eye_color=self.eye_color_processor.get_dominant_eyes_color(),
            age=self.age_processor.predict_age(),
            gender=self.gender_processor.predict_gender(),
            hair_color=hair_color,
        )
