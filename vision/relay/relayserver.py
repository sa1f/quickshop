from flask import Flask, request
import json
import os

app = Flask(__name__)

# single source of truth for who is in the store
user_status = {"justin": "not-in-store"}
store_status = {"keyboard": "in-stock", "scissors": "in-stock", "bottle": "in-stock"}

@app.route("/updatedoorcam", methods=["POST"])
def updatedoorcam():
    req_data = request.get_json()

    name = req_data["name"]
    status = req_data["store-status"]
    user_status[name] = status

    dump_local_mem()

    return '', 200

@app.route("/updateshelf", methods=["POST"])
def updateshelf():
    req_data = request.get_json()
    
    if "keyboard" in req_data:
        store_status["keyboard"] = "in stock"
    else:
        store_status["keyboard"] = "not-in-stock"

    if "scissors" in req_data:
        store_status["scissors"] = "in stock"
    else:
        store_status["scissors"] = "not-in-stock"

    if "bottle" in req_data:
        store_status["bottle"] = "in stock"
    else:
        store_status["bottle"] = "not-in-stock"

    dump_local_mem()

    return '', 200

def dump_local_mem():
    print("")
    print(user_status)
    print(store_status)
    print("")

def run_subprocs():
    os.system("./darknet detector demo cfg/coco.data cfg/yolo.cfg yolo.weights &")
    os.system("~/ngrok http 5000 &")

def run_relay_server():
    app.run()
