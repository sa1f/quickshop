import ntpath
import face_recognition
import numpy as np
import sys

imageFilename = ntpath.basename(sys.argv[1])
imageLocation = sys.argv[1][:len(sys.argv[1]) - len(imageFilename)]
# Get file path of image
image = face_recognition.load_image_file(sys.argv[1])

# Generate encodings for all faces in image
face_encodings = face_recognition.face_encodings(image)

# If there is any encoding, put it into a file
if len(face_encodings) > 0:
    first_encoding = face_encodings[0]
    np.savetxt(imageLocation + imageFilename + "_encoding.txt", first_encoding)
