import os

import cv2

from settings import WEIGHTS_DIR

# The gender model architecture
# https://drive.google.com/open?id=1W_moLzMlGiELyPxWiYQJ9KFaXroQ_NFQ
GENDER_MODEL = os.path.join(WEIGHTS_DIR, 'deploy_gender.prototxt')
# The gender model pre-trained weights
# https://drive.google.com/open?id=1AW3WduLk1haTVAxHOkVS_BEzel1WXQHP
GENDER_PROTO = os.path.join(WEIGHTS_DIR, 'gender_net.caffemodel')
# Each Caffe Model impose the shape of the input image also image preprocessing is required like mean
# substraction to eliminate the effect of illunination changes
MODEL_MEAN_VALUES = (78.4263377603, 87.7689143744, 114.895847746)
# Represent the gender classes
GENDER_LIST = ['Male', 'Female']

# Load gender prediction model
GENDER_NET = cv2.dnn.readNetFromCaffe(GENDER_MODEL, GENDER_PROTO)


class GenderProcessor:
    def __init__(self, img: cv2.Mat, face_landmarks, face) -> None:
        self.img = img
        self.face_landmarks = face_landmarks
        self.face = face

    def get_gender_predictions(self, face_img):
        blob = cv2.dnn.blobFromImage(
            image=face_img, scalefactor=1.0, size=(227, 227),
            mean=MODEL_MEAN_VALUES, swapRB=False, crop=False
        )
        GENDER_NET.setInput(blob)
        return GENDER_NET.forward()

    def predict_gender(self):
        start_x = self.face.left()  # left point
        start_y = self.face.top()  # top point
        end_x = self.face.right()  # right point
        end_y = self.face.bottom()  # bottom point

        face_img = self.img[start_y: end_y, start_x: end_x]

        gender_preds = self.get_gender_predictions(face_img)

        i = gender_preds[0].argmax()
        gender = GENDER_LIST[i]

        return gender
