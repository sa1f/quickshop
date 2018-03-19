import face_recognition
import numpy as np
import sys

image = face_recognition.load_image_file(sys.argv[1])
face_encodings = face_recognition.face_encodings(image)

if len(face_encodings) > 0:
    first_encoding = face_encodings[0]
    np.savetxt("./uploads/data.txt", first_encoding)
else:
    open('./uploads/data.txt', 'a').close()