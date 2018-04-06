<p  align='center'>

<img  width='300'  src="server/public/images/logo.png">

</p>

  

# Welcome to Quickshop!

  

This is a project done for CPEN 391. Group members include:

  

- Mike Yue (Blockchain front end + Web Dev)

- Justin Awrey (Object detection + facial recognition)

- Benjamin Lang (FPGA Hardware Accelerated Blockchain mining)

- Qian Rui Chow (User iOS Mobile app)

- Saif Sajid (Central server + db + facial recognition)

  
  

Quickshop is a fully automated store with a central server, facial and object recognition services and a blockchain to store transactions.

  

* You can view a video of the main store dashboard [here 📹](https://youtu.be/8BsaA3HJeXo)

* You can view a demo of the store [here 📹](https://youtu.be/WYAmqCGjMSQ)

  
  

Here's an overview of the structure of the project:

  

## blockchain_frontend

  

This folder contains the server which serves the frontend view of the block chain. Quick summary:

  

* Reads data from /blocks endpoint, and renders a webpage in the Express Framework using the Pug View Engine.

* The server code itself for GET requests, data parsing, and (legacy) DB connections are in block_chain_server.js

* The html code is dynamically rendered in the Views folder, in the file called blockchain.pug

* Contact.pug and Welcome.pug are the contact information and welcome html files rendered when users click the other links.

* Search_or_Reset is legacy code that is no longer called

* The CSS and JS scripts are linked to the Pug file in the scripts folder

* Uses Ngrok to forward requests from my home router to the port

* To run the server, install all relevant dependencies. Type the following into the terminal after navigating to the folder containing block_chain_server.js

* "npm install --save express"

* "npm install --save path"

* "npm install --save body-parser"

* "npm install --save request"

* MySQL is legacy dependency that is no longer required

* Type "node block_chain_server.js" in the terminal. The computer running the server will be listening on port 8080

  

## entry\_exit\_cams

This folder contains three python scripts that control the exit and entry cameras, as well as a simple relay server. 
* entry\_live\_reload.py
* exit\_live\_reload.py
	* The two above scripts control the exit and entry cameras for QuickShop.  Dependencies for the both scripts are the same:
		* [face_recognition](https://github.com/ageitgey/face_recognition)
		* [requests](https://github.com/requests/requests)
		* [opencv](https://github.com/opencv/opencv)
		* [numpy](https://github.com/numpy/numpy)
		* [pyttsx3](https://github.com/nateshmbhat/pyttsx3)
*	relay\_server.py
	*	The relay server requires both of:
		* [requests](https://github.com/requests/requests)
		* [flask](https://github.com/pallets/flask)
	* The relay server is included to sync data from face cams and object recognition data from the store shelf, before data is sent to the central server.  The relay server is meant to be ran on the localhost of the same machine running object detection.  When running on localhost, a working solution for sending http requests to the relay server is via acquiring a tunnel-able domain name using services such as [ngrok](https://ngrok.com/).  This is the approach taken in our demo, however the exact specifics about where/how to host the relay server can be left up to the user.

Start the entry camera with:
```
python3 entry_live_reload.py
```
and likewise, the exit camera with:
```
python3 exit_live_reload.py
```
we can start the relay server with:
```
export FLASK_APP=relay_server.py
flask run
```
this will cause the relay server to begin running on the default port 5000.
If you're like us and want to to tunnel http requests from the entry and exit cams to the relay server via ngrok, you will need to run:
```
/path/to/ngrok http 5000
```

**How fun!**


## obj\_recognition
This folder contains the C code used to live detect objects on the store shelf.
The model used is called [YoloV3](https://github.com/pjreddie/darknet), and it is entirely open source. 

The model is pretrained to the PASCAL VOC 2012 data set.  We ran it on a 3GB GTX 780 GPU, we gave us a high-fidelity livestream with live object detection and accurate bounding boxes.  In order to run the object recognition with a livestream view, as well as on a GPU, the following libraries are required:
* [opencv](https://github.com/opencv/opencv)
* [CUDA](http://docs.nvidia.com/cuda/cuda-quick-start-guide/index.html)
	* **WARNING!**  Installing CUDA for your GPU is super hard and terrifying so I won't get into it here.  Check out the link if you dare.

We have, of course, modified the original source code to fit our projects needs.  This primarily consisted of doing some json formulation on every frame, and continually POSTing this data the relay server.  In order to send POST requests in C, we initialized sockets, headers,  etc with the library [libcurl](https://curl.haxx.se/libcurl/).  This will need to be installed for communication with the relay server to function properly. 

*Lets get to the good stuff:*

To start up a the livestream demo, ensure that your webcam is (on Linux) the primary video source, i.e **/dev/video0**.

Then, ensure that 
```
OPENCV=1
GPU=1
```
are set in the Makefile.  The weights file used is **TOO BIG** to be hosted on github so get the file directly from pjreddie's website first:
```
cd obj_recognition
wget https://pjreddie.com/media/files/yolov3.weights
```

Now, run:
```
make
./darknet detector demo cfg/coco.data cfg/yolov3.cfg yolov3.weights
```

**Wow!**
  


## de1

  

This folder contains the fpga code to hash and mine blocks on the blockchain

  

## iOS

  

This folder contains the iOS app for the user that allows for Registration/Viewing Cart/Viewing past purchases

**Getting Started**
Open the file named "ImagePicker.xcworkspace" in the iOS folder using Xcode9. Connect to an iPhone5s - iOS 11.0.3 or use a iPhone 5s simulator; run and build the project.

**Files structure**
Here is a short description of the files in ImagePicker.xcworkspace:

* FaceDetector.swift: This file contains functions that detects the location of parts of the face

* MyAccountViewController.swift: This view controller manages the display of the logged in user's profile picture and username

* ViewController.swift: This view controller manages the registration user interface (face counts, picture uplaod etc.)

* CheckAVAuthorizationStatus.swift: File for Permission to use Camera in iPhone

* Main.storyboard: visual representation of the user interface of an iOS application, showing screens of content and the connections between those screens

* Assets.xcassets: Catalog to store icons and shop logo

* Info.plist: a structured text file that contains essential configuration information for the bundled app executable

* LoginViewController.swift: This view controller manages the user interface of login page

* MainMenuViewController.swift: This view controller manages the user interface of the main menu display

* BlockchainViewController.swift: This view controller manages the webview of blockchain transaction history

* AlamofireHTTPCalls.swift: Contains Get and Post call functions with Alamofire

* CartViewController.swift: Current user cart display user interface is managed by this view controller

  

## server

  

This folder contains the central NodeJs/Express server that controls the store.

  

**Getting Started**

- You'll first need to install [NodeJs](https://nodejs.org/en/)

- Navigate to the server folder of this project using the command line

- run `npm i` to install the module dependencies

- run `pip3 install numpy face_recognition requests` to install all the python dependencies

- `pip2`if you don't have pip3

- You'll need cmake to build dlib which powers face_recognition

- run `node server.js` to run the server

- run `python facerec_from_webcam_faster.py` to see the live facial recogntion

- You will need to change the url for the face\_encoding endpoints

  

If you'd like to see the database contents, open the .sqlite file using [sqlite browser](http://sqlitebrowser.org/)

  
  

**Server structure**

  

* \_\_tests\_\_ - contains server tests

* config - contains database config

* migrations - contains database migrations

* models - contains database models

* public - contains css + images

* scss - contains sass files for css

* seeders - contains db seed data

* views - contains index.pug which is the template for the dynamic store dashbaord

* app.js - the main server file

* encode.py - encodes a face which can be later used as a comparison against future face encodings to recognize faces

* facerec\_from\_webcam\_faster\_.py - [modified example](https://github.com/ageitgey/face_recognition/blob/master/examples/facerec_from_webcam_faster.py) file from the face\_recognition\_ module. Allows for live registration of new faces on the server and live face recognition. Served as the basis for the entrance and exit cameras

* gulpfile.js - Used to compile sass files

* login\_face\_.py - used to recognize a face from a picture

* server.js - This simply initiates the server on the local machine

  

\ ゜o゜)ノ
