import os

import cv2

from settings import WEIGHTS_DIR

# Each Caffe Model impose the shape of the input image also image preprocessing is required like mean
# substraction to eliminate the effect of illunination changes
MODEL_MEAN_VALUES = (78.4263377603, 87.7689143744, 114.895847746)

# The model architecture
# download from: https://drive.google.com/open?id=1kiusFljZc9QfcIYdU2s7xrtWHTraHwmW
AGE_MODEL = os.path.join(WEIGHTS_DIR, 'deploy_age.prototxt')
# The model pre-trained weights
# download from: https://drive.google.com/open?id=1kWv0AjxGSN0g31OeJa02eBGM0R_jcjIl
AGE_PROTO = os.path.join(WEIGHTS_DIR, 'age_net.caffemodel')
# Represent the 8 age classes of this CNN probability layer
AGE_INTERVALS = ['0, 2', '4, 6', '8, 12', '15, 20',
                 '25, 32', '38, 43', '48, 53', '60, 100']


# Load age prediction model
AGE_NET = cv2.dnn.readNetFromCaffe(AGE_MODEL, AGE_PROTO)


class AgeProcessor:
    def __init__(self, img: cv2.Mat, face_landmarks, face) -> None:
        self.img = img
        self.face_landmarks = face_landmarks
        self.face = face

    def get_age_predictions(self, face_img):
        blob = cv2.dnn.blobFromImage(
            image=face_img, scalefactor=1.0, size=(227, 227),
            mean=MODEL_MEAN_VALUES, swapRB=False
        )
        AGE_NET.setInput(blob)
        return AGE_NET.forward()

    def predict_age(self):
        start_x = self.face.left()  # left point
        start_y = self.face.top()  # top point
        end_x = self.face.right()  # right point
        end_y = self.face.bottom()  # bottom point

        face_img = self.img[start_y: end_y, start_x: end_x]

        age_preds = self.get_age_predictions(face_img)

        i = age_preds[0].argmax()
        age = AGE_INTERVALS[i]

        return age
