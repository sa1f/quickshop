import sys
import os

from vision.doorcam.entry import run_entry_cam
from vision.doorcam.exit import run_exit_cam
from vision.relay.relayserver import run_subprocs, run_relay_server

def usage():
    return "usage: python3 -m vision (entry | exit | store)"

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(usage())
    else:
        arg = sys.argv[1]
        print(arg)
        if arg == "entry":
            print(os.getcwd())
            run_entry_cam()

        elif arg == "exit":
            run_exit_cam()
        
        elif arg == "store":
            run_subprocs()
            run_relay_server()

        else:
            print(usage())