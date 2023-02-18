# Face Analyzer API

<p align="center">
  <a href="https://flask.palletsprojects.com/en/2.2.x/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Flask_logo.svg" width="320" alt="Flask Logo" /></a>
</p>

## Requirements

Download weights from <a this="https://drive.google.com/drive/folders/1FwiRTeY5_8x1smFizQ4h7PCTx8shcF_l?usp=sharing">this link</a> and place them in directory

```bash
<root>/face-api/weights
```

Don't modify file names

## Overview

You can get info like this:

```json
{
    "age": "25, 32",                    // age diaposon
    "eye_color": {                      // colors for both eyes
        "left_color_name": "Blue",
        "right_color_name": "Blue"
    },
    "gender": "Female",                 // gender (Male/Female)
    "hair_color": "rgb(54, 51, 52)",    // rgb hair color
    "skin_color": "rgb(189, 163, 156)"  // rgb skin color
}
```

## Running params

```bash
--no-hair # run app without hair color analyxing module. This module uses heavy libraries that requires 1.2Gb of free RAM
```
