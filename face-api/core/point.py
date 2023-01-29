import math


class Point:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    @staticmethod
    def get_midpoint(a, b):
        return Point((a.x + b.x) / 2, (a.y + b.y) / 2)

    @staticmethod
    def to_int(p):
        return Point(int(p.x), int(p.y))

    @staticmethod
    def get_distance_between(a, b):
        return math.sqrt((a.x - b.x) ** 2 - (a.y - b.y) ** 2)
