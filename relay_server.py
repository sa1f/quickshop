from flask import Flask, request
import json

app = Flask(__name__)

# single source of truth for who is in the store
user_status =   {}
store_status =  {"keyboard": "in-stock", "cell phone": "in-stock"}

@app.route("/updatedoorcam", methods=["POST"])
def updatedoorcam():
    req_data = request.get_json()

    name = req_data["name"]
    status = req_data["store-status"]

    # user entered store
    if status == "in-store":
        # take a snapshot of what was in the store when user entered
        user_status[name] = {"status": status, "on-entry": [key for key, val in store_status.items() if val == "in-stock"]}
        print(user_status)

    # user exited
    else:
        # compare snapshot with store contents now, in order to determine what the user bought
        user_status[name]["status"] = status
        snapshot = user_status[name]["on-entry"]
        bought_items = [item for item in snapshot if store_status[item] == "not-in-stock"]
        if bought_items:
            post_data = {name: bought_items}
            # requests.post("saif.ms:3000/removeFromShelf", json=post_data)
            print(name, "bought", post_data)

    # dump_local_mem()

    return '', 200

@app.route("/updateshelf", methods=["POST"])
def updateshelf():
    req_data = request.get_json()

    in_stock = [key for key, val in store_status.items() if val == "in-stock"]

    if "keyboard" in req_data:
        store_status["keyboard"] = "in-stock"
    else:
        store_status["keyboard"] = "not-in-stock"

    if "cell phone" in req_data:
        store_status["cell phone"] = "in-stock"
    else:
        store_status["cell phone"] = "not-in-stock"

    after_additions = [key for key, val in store_status.items() if val == "in-stock"]
    if len(after_additions) > len(in_stock):
        added_to_shelf = list(set(after_additions) - set(in_stock))
        print(added_to_shelf, "added to shelf")
        # requests.post("saif.ms:3000/putOnShelf", json=added_to_shelf)

    # dump_local_mem()

    return '', 200

def dump_local_mem():
    print("")
    print(user_status)
    print(store_status)
    print("")

if __name__ == "__main__":
    app.run()
