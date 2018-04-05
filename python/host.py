import serial
import sys
import os
import time
import requests
import json


def main(args):
	# init serial connection
	ser = serial.Serial('/dev/tty.usbserial', 115200)
	ser.flush()
	ser.timeout = 15

	while True:
		try:
			# check for valid hash requests
			r = requests.get('http://store.saif.ms/needs_hashing').json();
		except json.decoder.JSONDecodeError as e:
			# otherwise skip request
			print("got json decode error")
			time.sleep(3.0)
			continue
		# check if there is a valid block instance to hash
		if "block" not in r:
			time.sleep(3.0)
		else:	
			# formulate message for DE1 based on request info
			message = "$"
			message = message + str(r.get('block'))
			if 'data' in r and r.get('data') is not None:
				message = message + r.get('data')
			if 'prev_hash' in r and r.get('prev_hash') is not None:
				message = message + r.get('prev_hash')
			message = message + '$'
			
			# write to DE1 over serial
			for i in range(len(message)):
				ser.write(message[i].encode())
				time.sleep(0.001)  
			ser.flush()

			# get data from DE1 over serial
			time.sleep(1./120)
			hashData = str(ser.readline().hex())[:-4]
			time.sleep(1./120)
			nonce = str(ser.readline().hex())[:-4]

			# send response back to server
			p = requests.post('http://store.saif.ms/register_hash', 
				data = {'curr_hash': hashData, 'nonce': int(nonce, 16), 'block': r.get('block')})
			print(p.json())
			
	ser.close()

if __name__ == "__main__":
	main(sys.argv[1:])