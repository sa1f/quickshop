import face_recognition
import requests
import ntpath
import sys
import numpy as np
from io import StringIO

r = requests.get('http://localhost:3000/face_encodings')

# Create arrays of known face encodings and their names
string_IOs_from_encodings = [StringIO(entry['faceEncoding']) for entry in r.json()]
known_face_encodings = [np.loadtxt(encoding_string_io) for encoding_string_io in  string_IOs_from_encodings]
known_face_names = [entry['name'] for entry in r.json()]

# Get file path of image
imageFilename = ntpath.basename(sys.argv[1])
imageLocation = sys.argv[1][:len(sys.argv[1]) - len(imageFilename)]
# Generate encodings for all faces in image
image = face_recognition.load_image_file(sys.argv[1])
face_encodings = face_recognition.face_encodings(image)

# If there is any encoding, put it into a file
if len(face_encodings) > 0:
    matches = face_recognition.compare_faces(known_face_encodings, face_encodings[0])
    if True in matches:
        first_match_index = matches.index(True)
        print(known_face_names[first_match_index])