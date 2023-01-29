import colorsys

import cv2
import numpy as np

# define HSV color ranges for eyes colors
EYE_COLOR_CLASSES = ("Blue", "Blue Gray", "Brown", "Brown Gray",
                     "Brown Black", "Green", "Green Gray", "Other")

EyeColors = {
    EYE_COLOR_CLASSES[0]: ((166, 21, 50), (240, 100, 85)),
    EYE_COLOR_CLASSES[1]: ((166, 2, 25), (300, 20, 75)),
    EYE_COLOR_CLASSES[2]: ((2, 20, 20), (40, 100, 60)),
    EYE_COLOR_CLASSES[3]: ((20, 3, 30), (65, 60, 60)),
    EYE_COLOR_CLASSES[4]: ((0, 10, 5), (40, 40, 25)),
    EYE_COLOR_CLASSES[5]: ((60, 21, 50), (165, 100, 85)),
    EYE_COLOR_CLASSES[6]: ((60, 2, 25), (165, 20, 65))
}


class EyesColorProcessor:
    EYES_POINTS = {
        'LEFT': {'a': 36, 'b': 42},
        'RIGHT': {'a': 43, 'b': 49},
    }

    def __init__(self, img: cv2.Mat, face_landmarks):
        self.img = img
        self.face_landmarks = face_landmarks

        self.left_eye_landmarks = face_landmarks.parts(
        )[EyesColorProcessor.EYES_POINTS['LEFT']['a']:EyesColorProcessor.EYES_POINTS['LEFT']['b']]

        self.right_eye_landmarks = face_landmarks.parts(
        )[EyesColorProcessor.EYES_POINTS['RIGHT']['a']:EyesColorProcessor.EYES_POINTS['RIGHT']['b']]

    def create_eye_mask(self, eye_landmarks):
        np_landmarks = list(map(lambda land: [land.x, land.y], eye_landmarks))

        eye_mask = np.zeros_like(self.img)
        cv2.fillConvexPoly(eye_mask, np.int32(
            np.array(np_landmarks)), (255, 255, 255))
        eye_mask = np.uint8(eye_mask)
        return eye_mask

    def find_iris(self, eye_mask, thresh):
        r = self.img[:, :, 2]
        _, binary_img = cv2.threshold(r, thresh, 255, cv2.THRESH_BINARY_INV)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (4, 4))
        morph = cv2.dilate(binary_img, kernel, 1)
        morph = cv2.merge((morph, morph, morph))
        morph = morph.astype(float)/255
        eye_mask = eye_mask.astype(float)/255
        iris = cv2.multiply(eye_mask, morph)
        return iris

    def find_centroid(self, iris):
        M = cv2.moments(iris[:, :, 0])
        c_x = int(M["m10"] / M["m00"])
        c_y = int(M["m01"] / M["m00"])
        centroid = (c_x, c_y)
        return centroid

    def create_iris_mask(self, iris, centroid):
        counturs, _ = cv2.findContours(
            np.uint8(iris[:, :, 0]), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        flag = 10000
        final_cnt = None
        for cnt in counturs:
            (x, y), radius = cv2.minEnclosingCircle(cnt)
            distance = abs(centroid[0]-x)+abs(centroid[1]-y)
            if distance < flag:
                flag = distance
                final_cnt = cnt
            else:
                continue
        (x, y), radius = cv2.minEnclosingCircle(final_cnt)
        center = (int(x), int(y))
        radius = int(radius) - 2

        iris_mask = np.zeros_like(iris)
        cv2.circle(iris_mask, center, radius, (255, 255, 255), -1)

        inverse_irisMask = np.ones_like(iris) * 255
        cv2.circle(inverse_irisMask, center, radius, (0, 0, 0), -1)

        return iris_mask, inverse_irisMask, center, radius

    def get_dominant_eye_color(self, part):
        eye_landmarks = self.left_eye_landmarks if part == 'LEFT' else self.right_eye_landmarks

        # Create eye mask using eye landmarks from facial landmark detection
        eye_mask = self.create_eye_mask(eye_landmarks)

        # Find the iris by thresholding the red channel of the image within the boundaries of the eye mask
        iris = self.find_iris(eye_mask=eye_mask, thresh=50)

        # Find the centroid of the binary image of the eye
        iris_centroid = self.find_centroid(iris)

        # Generate the iris mask and its inverse mask
        iris_mask, _, left_center, left_radius = self.create_iris_mask(
            iris, iris_centroid)

        int_img = self.img
        int_left_iris_mask = iris_mask.astype(np.uint8)

        left_eye = cv2.bitwise_and(src1=int_img, src2=int_left_iris_mask)

        center_x, center_y = left_center

        roi = left_eye[
            (center_y - left_radius):
            (center_y + left_radius),
            (center_x - left_radius):
            (center_x + left_radius),
        ]

        h, w = roi.shape[0:2]
        eye_class = np.zeros(len(EYE_COLOR_CLASSES), np.float64)
        for y in range(0, h):
            for x in range(0, w):
                pixel = roi[y, x]
                if pixel.all():
                    eye_class[EyesColorProcessor.find_class(colorsys.rgb_to_hsv(
                        b=pixel[0], g=pixel[1], r=pixel[2]))] += 1

        main_color_index = np.argmax(eye_class[:len(eye_class)-1])
        dominant_color_name = EYE_COLOR_CLASSES[main_color_index]

        return dominant_color_name

    def get_dominant_eyes_color(self):
        left_color_name = self.get_dominant_eye_color('LEFT')
        right_color_name = self.get_dominant_eye_color(
            'RIGHT')

        return {
            'left_color_name': left_color_name,
            'right_color_name': right_color_name,
        }

    @staticmethod
    def check_color(hsv, color):
        return (hsv[0] >= color[0][0]) and (hsv[0] <= color[1][0]) and (hsv[1] >= color[0][1]) and hsv[1] <= color[1][1] and (hsv[2] >= color[0][2]) and (hsv[2] <= color[1][2])

    @staticmethod
    def find_class(hsv):
        color_id = 7
        for i in range(len(EYE_COLOR_CLASSES)-1):
            if EyesColorProcessor.check_color(hsv, EyeColors[EYE_COLOR_CLASSES[i]]):
                color_id = i

        return color_id
