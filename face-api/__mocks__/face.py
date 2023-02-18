import typing
import json


class MockFaceInfo:
    def __init__(self, skin_color: str, eye_color: typing.Dict, hair_color: str, age: str, gender: str):
        self.skin_color = skin_color
        self.hair_color = hair_color
        self.eye_color = eye_color
        self.age = age
        self.gender = gender

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,
                          sort_keys=True, indent=4)
