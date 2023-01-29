import os

import cv2
import numpy as np
from mrcnn import model as modellib
from mrcnn.config import Config

from core.color import ColorProcessor
from settings import ROOT_DIR, WEIGHTS_DIR

# Hair segmentation model weight path
# https://drive.google.com/file/d/1ZbWTqWLi7w-lVvf7TQ59Gqil_SJnofbE/view?usp=sharing
HAIR_MODEL_WEIGHTS = os.path.join(WEIGHTS_DIR, 'mask_rcnn_hair_0200.h5')

# Directory to save logs and model checkpoints
DEFAULT_LOGS_DIR = os.path.join(ROOT_DIR, "logs")


class CustomMRCNNConfig(Config):
    """
    Configuration for training on the Hair dataset.
    Derives from the base Config class and overrides some values.
    """
    # Give the configuration a recognizable name
    NAME = "Hair"

    # Number of classes (including background)
    NUM_CLASSES = 1 + 1  # Background + Hair

    # Number of training steps per epoch
    STEPS_PER_EPOCH = 10

    # Skip detections with < 90% confidence
    DETECTION_MIN_CONFIDENCE = 0.9

    # Set batch size to 1 since we'll be running inference on
    # one image at a time. Batch size = GPU_COUNT * IMAGES_PER_GPU
    GPU_COUNT = 1
    IMAGES_PER_GPU = 1


# Create model
HAIR_SEG_MODEL = modellib.MaskRCNN(mode="inference", config=CustomMRCNNConfig(),
                                   model_dir=DEFAULT_LOGS_DIR)
HAIR_SEG_MODEL.load_weights(HAIR_MODEL_WEIGHTS, by_name=True)


class HairColorProcessor():
    def __init__(self, img: cv2.Mat) -> None:
        self.img = img

    def apply_mask(self, mask: np.ndarray):
        """Apply color splash effect.
        image: RGB image [height, width, 3]
        mask: instance segmentation mask [height, width, instance count]
        Returns result image.
        """

        # Make a grayscale copy of the image. The grayscale copy still
        # has 3 RGB channels, though.
        blank = np.zeros(self.img.shape, dtype=np.uint8)
        # Copy color pixels from the original color image where mask is set
        if mask.shape[-1] > 0:
            # We're treating all instances as one, so collapse the mask into one layer
            mask = (np.sum(mask, -1, keepdims=True) >= 1)
            crop = np.where(mask, self.img, blank).astype(np.uint8)
        else:
            crop = blank.astype(np.uint8)
        return crop

    def get_hair_color(self):
        # Detect objects
        result = HAIR_SEG_MODEL.detect([self.img], verbose=1)[0]
        # Mask
        crop = self.apply_mask(result['masks'])

        dominant, _, _, _ = ColorProcessor.extract_dominant_color(
            roi=crop)

        return np.flip(dominant, axis=0)
