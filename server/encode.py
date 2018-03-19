import face_recognition
import numpy as np
import sys

image = face_recognition.load_image_file(sys.argv[1])
image_encoding = face_recognition.face_encodings(image)[0]

if image_encoding:
    np.savetxt("./uploads/data.txt", image_encoding)
else:
    open(x, './uploads/data.txt').close()