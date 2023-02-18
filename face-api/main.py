import os
import random
import typing
import argparse
from concurrent.futures import ThreadPoolExecutor, Future

from flask import Flask, jsonify, request
from flask_restful import Api, Resource, abort

from settings import DEBUG, API_PORT, FILE_UPLOAD_DIR, ALLOWED_EXTENSIONS

parser = argparse.ArgumentParser(description='Running options.')
parser.add_argument('--no-hair', dest='NO_HAIR', action='store_true', default=False,
                    help='should analyzer process hair color (need 1.4GB of RAM)')

parser.add_argument('--no-face', dest='NO_FACE', action='store_true', default=False,
                    help='should mock analyzer with static response. Useful if you want to have api as lightweight as possible')

args = parser.parse_args()
NO_HAIR = args.NO_HAIR
NO_FACE = args.NO_FACE


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_mock_face_info():
    from __mocks__.face import MockFaceInfo

    return MockFaceInfo(
        skin_color='rgb(255, 224, 189)',
        eye_color={
            'left_color_name': 'Blue',
            'right_color_name': 'Blue',
        },
        age='25, 32',
        gender='Male',
        hair_color='rgb(158, 128, 102)',
    )


def get_real_face_info(file_path: str):
    from core.image import ImgProcessor

    processor = ImgProcessor(file_path, NO_HAIR=NO_HAIR)

    result = processor.face_processors[0].get_face_info()

    del processor

    return result


def get_face_info(file_path: str):
    if NO_FACE:
        return get_mock_face_info()
    return get_real_face_info(file_path)


app = Flask(__name__)
api = Api(app)

executor = ThreadPoolExecutor(max_workers=2)
jobs: typing.Dict[str, Future] = {}


class FaceInfoResource(Resource):
    # ? check and return if done
    def get(self, job_id: str):
        if job_id not in jobs:
            abort(404, message=f'Job with id {job_id} was not found')

        job = jobs[job_id]

        if job.running():
            return jsonify({'status': 'pending'})
        if job.cancelled():
            return jsonify({'status': 'cancelled'})
        if job.done():
            del jobs[job_id]
            return jsonify({'status': 'done', 'result': job.result().__dict__})


class FaceSchedulerResource(Resource):
    # ? ask to process
    def post(self):

        # check if the post request has the file part
        if 'file' not in request.files:
            resp = jsonify({'message': 'No file part in the request'})
            resp.status_code = 400
            return resp
        file = request.files['file']

        # check filename
        if file.filename == '':
            resp = jsonify({'message': 'No file selected for uploading'})
            resp.status_code = 400
            return resp

        # check file type
        if not file or not allowed_file(file.filename):
            resp = jsonify(
                {'message': 'Allowed file types are png, jpg, jpeg'})
            resp.status_code = 400
            return resp

        job_id = f'{random.getrandbits(64)}'

        _, file_extension = os.path.splitext(file.filename)
        file_name = f'{job_id}{file_extension}'
        file_path = os.path.join(FILE_UPLOAD_DIR, file_name)
        file.save(file_path)

        def binded_get_face_info():
            return get_face_info(file_path)

        job = executor.submit(binded_get_face_info)

        jobs[job_id] = job

        resp = jsonify({'job_id': job_id})
        resp.status_code = 201
        return resp


api.add_resource(FaceSchedulerResource, '/schedule')
api.add_resource(FaceInfoResource, '/status/<string:job_id>')


if __name__ == '__main__':
    if not os.path.exists(FILE_UPLOAD_DIR):
        os.makedirs(FILE_UPLOAD_DIR)

    app.run(debug=DEBUG, port=API_PORT, host='0.0.0.0')
