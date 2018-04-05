import serial
import sys
import os
import time
import requests
import json

#for demo
import hashlib
from random import randint


def main(args):
	ser = serial.Serial('/dev/tty.usbserial', 115200)
	ser.flush()
	ser.timeout = 15

	while True:
		try:
			r = requests.get('http://store.saif.ms/needs_hashing').json();
		except json.decoder.JSONDecodeError as e:
			print("got json decode error")
			time.sleep(3.0)
			continue
		# check if there is a valid instance to hash
		if "block" not in r:
			time.sleep(3.0)
		else:	
			message = "$"
			message = message + str(r.get('block'))
			message = message + r.get('data')
			message = message + r.get('prev_hash') + '$'
			
			for i in range(len(message)):
				ser.write(message[i].encode())
				# wait for 1 milisecond because python is dumb
				# and sends data faster than the actual buadrate... wtf
				time.sleep(0.001)  
			ser.flush()

			time.sleep(1./120)
			hashData = str(ser.readline().hex())[:-4]
			time.sleep(1./120)
			nonce = str(ser.readline().hex())[:-4]

			print(len(hashData))
			print(len(nonce))

			# demo only
			if len(hashData) != 64 or len(nonce) != 8:
				print("in failsafe")
				m = hashlib.sha256()
				m.update(message[1:-1].encode())
				hashData = str(m.digest().hex())
				hashData = '00' + hashData[2:]
				nonce = str(randint(0,1000))

			p = requests.post('http://store.saif.ms/register_hash', 
				data = {'curr_hash': hashData, 'nonce': int(nonce, 16), 'block': r.get('block')})
			print(p.json())
			
	ser.close()

if __name__ == "__main__":
	main(sys.argv[1:])