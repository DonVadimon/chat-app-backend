FROM python:3.9.7-buster as setup

WORKDIR /

# Install cmake
RUN echo \
    && apt-get update \
    && apt-get --yes install cmake

# For OpenCV
RUN apt-get --yes install ffmpeg libsm6 libxext6


# Upgrade pip
RUN pip3 install --upgrade pip

# Install git
RUN echo \
    && apt-get update \
    && apt-get --yes install git \
    && git --version

ARG USER=nobody
RUN usermod -aG sudo $USER


FROM setup as libs

COPY requirements.txt .

RUN pip3 --no-cache-dir install -r requirements.txt
RUN pip3 --no-cache-dir install h5py
RUN pip3 --no-cache-dir install tensorflow==2.7.0 -f https://tf.kmtea.eu/whl/stable.html

# Install mrcnn from sources
RUN echo \
    && git clone https://github.com/DonVadimon/Mask_RCNN_TF2.7.0 Mask_RCNN \
    && cd Mask_RCNN \
    && pip3 install --no-cache-dir -r requirements.txt \
    && python3 setup.py install

# FIXES: ImportError: cannot allocate memory in static TLS block
ENV LD_PRELOAD='/usr/local/lib/python3.9/site-packages/scikit_image.libs/libgomp-d22c30c5.so.1.0.0'


FROM libs as app
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY . .
CMD ["/bin/bash"]
