from flask import Flask, request
import json
import requests

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
        requests.post("http://saif.ms:3000/login", json={"name": name, "password": "1"})
        print(name, "entered store")

    # user exited
    else:
        # compare snapshot with store contents now, in order to determine what the user bought
        user_status[name]["status"] = status
        snapshot = user_status[name]["on-entry"]
        bought_items = [item for item in snapshot if store_status[item] == "not-in-stock"]
        if bought_items:
            post_data = {item: item for item in bought_items}
            print(name, "bought", post_data)
            requests.post("http://saif.ms:3000/users/" + name + "/checkout")

        requests.post("http://saif.ms:3000/logout", json={"name": name, "password": "1"})
        print(name, "exited store")

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

    # figure out who is in the store
    if user_status:
        users_in_store = [user for user, status in user_status.items() if status["status"] == "in-store"] 
        last_user = users_in_store[-1]

        if len(after_additions) > len(in_stock):
            added_to_shelf = list(set(after_additions) - set(in_stock))
            print(added_to_shelf, "added to shelf")

            # added to shelf means user removed from cart
            for item in added_to_shelf:
                requests.post("http://saif.ms:3000/users/" + last_user + "/cart/remove", json={"product_name": item})
                print(last_user, "removed", item, "from cart")


        elif len(after_additions) < len(in_stock):
            removed_from_shelf = list(set(in_stock) - set(after_additions))
            print(removed_from_shelf, "removed from shelf")

            # removed from shelf means user added to cart
            for item in removed_from_shelf:
                requests.post("http://saif.ms:3000/users/" + last_user + "/cart/add", json={"product_name": item})
                print(last_user, "added", item, "to cart")                

    return '', 200

def dump_local_mem():
    print("")
    print(user_status)
    print(store_status)
    print("")

if __name__ == "__main__":
    app.run()
