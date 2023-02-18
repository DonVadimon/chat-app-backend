import math

import cv2
import numpy as np

from core.color import ColorProcessor
from core.point import Point


class SkinColorProcessor:
    SKIN_COLOR_POINTS = {
        'LEFT_SIDE': {'a': 48, 'b': 4},
        'RIGHT_SIDE': {'a': 54, 'b': 12},
    }

    def __init__(self, img: cv2.Mat, face_landmarks):
        self.img = img
        self.face_landmarks = face_landmarks

    def get_face_part_midpoint(self, part: str):
        a = self.face_landmarks.part(
            SkinColorProcessor.SKIN_COLOR_POINTS[part]['a'])
        b = self.face_landmarks.part(
            SkinColorProcessor.SKIN_COLOR_POINTS[part]['b'])

        return Point.to_int(Point.get_midpoint(a, b)), Point.get_distance_between(a, b)

    def get_face_part_dominant_color(self, part: str) -> list:
        mid_point, distance = self.get_face_part_midpoint(part)
        distance = distance * 0.8

        roi = self.img[
            mid_point.y - math.floor(distance / 2):
            mid_point.y + math.floor(distance / 2),
            mid_point.x - math.floor(distance / 2):
            mid_point.x + math.floor(distance / 2),
        ]

        dominant, _, _, _ = ColorProcessor.extract_dominant_color(roi=roi)

        return dominant

    def get_skin_mean_color(self):
        color_left = self.get_face_part_dominant_color('LEFT_SIDE')
        color_right = self.get_face_part_dominant_color('RIGHT_SIDE')

        # BGR mean skin color value
        mean_color = np.mean(np.array([color_left, color_right]), axis=0)

        # Flip array to get RGB value
        return np.flip(mean_color, axis=0)
