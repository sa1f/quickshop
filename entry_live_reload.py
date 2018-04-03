import face_recognition
import cv2
import requests
import numpy as np
from io import StringIO
from threading import Thread, Event
import time

just_entered = {}
video_capture = cv2.VideoCapture(0)

class UpdateThread(Thread):
	def __init__(self, event):
		Thread.__init__(self)
		self.stopped = event

	def run(self):
		while not self.stopped.wait(2):
			update()

updateStopFlag = Event()
thread = UpdateThread(updateStopFlag)
thread.start()

r = requests.get('http://saif.ms:3000/encodings')

# Create arrays of known face encodings and their names
#known_face_encodings = [entry['faceEncoding'] for entry in r.json()]
string_IOs_from_encodings = [StringIO(entry['faceEncoding']) for entry in r.json()]
known_face_encodings = [np.loadtxt(encoding_string_io) for encoding_string_io in  string_IOs_from_encodings]
known_face_names = [entry['name'] for entry in r.json()]

def update():
    global r
    global string_IOs_from_encodings
    global known_face_encodings
    global known_face_names
    r = requests.get('http://saif.ms:3000/encodings')
    string_IOs_from_encodings = [StringIO(entry['faceEncoding']) for entry in r.json()]
    known_face_encodings = [np.loadtxt(encoding_string_io) for encoding_string_io in  string_IOs_from_encodings]
    known_face_names = [entry['name'] for entry in r.json()]


# Initialize some variables
face_locations = []
face_encodings = []
face_names = []
process_this_frame = True

while True:
    # Grab a single frame of video
    ret, frame = video_capture.read()

    # Resize frame of video to 1/4 size for faster face recognition processing
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

    # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
    rgb_small_frame = small_frame[:, :, ::-1]

    # Only process every other frame of video to save time
    if process_this_frame:
        # Find all the faces and face encodings in the current frame of video
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        face_names = []
        for face_encoding in face_encodings:
            # See if the face is a match for the known face(s)
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
            name = "Unknown"

            # If a match was found in known_face_encodings, just use the first one.
            if True in matches:
                first_match_index = matches.index(True)
                name = known_face_names[first_match_index]

            face_names.append(name)

    process_this_frame = not process_this_frame


    # Display the results
    for (top, right, bottom, left), name in zip(face_locations, face_names):
        # Scale back up face locations since the frame we detected in was scaled to 1/4 size
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        # Draw a box around the face
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

        # Draw a label with a name below the face
        cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)

        if name != "Unknown" and name not in just_entered:
            payload = {"name": name, "store-status": "in-store"}
            _ = requests.post("http://ef9f2360.ngrok.io/updatedoorcam", json=payload)
            just_entered[name] = time.time() + 4

    curr_time = time.time()
    not_expired = {key: val for key, val in just_entered.items() if curr_time < val}

    # Display the resulting image
    cv2.imshow('Video', frame)

    # Hit 'q' on the keyboard to quit!
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release handle to the webcam
video_capture.release()
cv2.destroyAllWindows()
