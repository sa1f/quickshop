<p align='center'>
	<img width='300' src="server/public/images/logo.png">
</p>

## Hello!

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

### blockchain_frontend

This folder contains the server which serves the frontend view of the block chain. Quick summary:

* Reads data from /blocks endpoint, and renders a webpage in the Express Framework using the Pug View Engine. 
* The server code itself for GET requests, data parsing, and (legacy) DB connections are in block_chain_server.js
* The html code is dynamically rendered in the Views folder, in the file called blockchain.pug
* Contact.pug and Welcome.pug are the contact information and welcome html files rendered when users click the other links.
* Search_or_Reset is legacy code that is no longer called
* The CSS and JS scripts are linked to the Pug file in the scripts folder
* Uses Ngrok to forward requests from my home router to the port
* To run the server, type "node block_chain_server.js" in the terminal. The computer running the server will be listening on port 8080

### computer\_vision

This folder contains three python scripts that control the exit and entry cameras. A relay server is included to relay messages from these local scripts to the central server

### de1

This folder contains the fpga code to hash and mine blocks on the blockchain

### iOS

This folder contains the iOS app for the user that allows for Registration/Viewing Cart/Viewing past purchases


### server

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

* \_\_tests\_\_  - contains server tests
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
