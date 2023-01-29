import math
import typing

import cv2
import numpy as np


class ColorProcessor:
    @staticmethod
    def extract_dominant_color(roi: np.ndarray[typing.Any, np.dtype], N_COLORS=5, include_zeros=False):
        img = roi
        if not include_zeros:
            img = roi[roi != [0., 0., 0.]]
            new_len = int(len(img)/3)
            img = img[:new_len * 3].reshape(new_len, 3)

        pixels = np.float32(img.reshape(-1, 3))

        criteria = (cv2.TERM_CRITERIA_EPS +
                    cv2.TERM_CRITERIA_MAX_ITER, 200, .1)
        flags = cv2.KMEANS_RANDOM_CENTERS

        _, labels, palette = cv2.kmeans(
            pixels, N_COLORS, None, criteria, 10, flags)
        _, counts = np.unique(labels, return_counts=True)

        dominant = palette[np.argmax(counts)]

        return dominant, palette, labels, counts

    @staticmethod
    def create_bar(height, width, color):
        bar = np.zeros((height, width, 3), np.uint8)
        bar[:] = color
        red, green, blue = int(color[2]), int(color[1]), int(color[0])
        return bar, (red, green, blue)

    @staticmethod
    def display_palette(palette, win_name='Dominant colors'):
        font = cv2.FONT_HERSHEY_SIMPLEX
        bars = []
        rgb_values = []

        for index, row in enumerate(palette):
            bar, rgb = ColorProcessor. create_bar(200, 200, row)
            bars.append(bar)
            rgb_values.append(rgb)

        img_bar = np.hstack(bars)

        for index, row in enumerate(rgb_values):
            cv2.putText(img_bar, f'{index + 1}. RGB: {row}', (5 + 200 * index, 200 - 10),
                        font, 0.5, (255, 0, 0), 1, cv2.LINE_AA)
            print(f'{index + 1}. RGB{row}')

        cv2.imshow(win_name, img_bar)

    @staticmethod
    def rgb_array_to_hex(rgb):
        r = math.ceil(float(rgb[0]))
        g = math.ceil(float(rgb[1]))
        b = math.ceil(float(rgb[2]))

        return f'rgb({r}, {g}, {b})'
