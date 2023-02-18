import os
import random
import typing

import cv2
import dlib
from PIL import Image

from core.face import FaceProcessor
from settings import TEMP_DATA_DIR


class ImgProcessor:
    FACE_LANDMARKS_COUNT = 68

    # Load the detector
    detector = dlib.get_frontal_face_detector()  # type: ignore

    def __init__(self, img_path: str, NO_HAIR = False):
        temp_img = Image.open(img_path)

        if not os.path.exists(TEMP_DATA_DIR):
            os.makedirs(TEMP_DATA_DIR)

        # Save img in PNG format to have full rgb values
        temp_img_path = os.path.join(
            TEMP_DATA_DIR, f'temp_img_{random.getrandbits(32)}.png')
        temp_img.save(temp_img_path)

        # Save temp img path to delete file after work
        self.temp_img_path = temp_img_path

        img = cv2.imread(temp_img_path)
        self.img = img

        # Use detector to find landmarks
        faces = ImgProcessor.detector(
            cv2.cvtColor(src=img, code=cv2.COLOR_BGR2GRAY))

        self.face_processors: typing.List[FaceProcessor] = []

        for face in faces:
            self.face_processors.append(FaceProcessor(img=img, face=face, NO_HAIR=NO_HAIR))

    def __del__(self):
        os.remove(path=self.temp_img_path, dir_fd=None)
