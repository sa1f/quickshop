import serial
import sys
import os
import time
import requests



def main(args):
	ser = serial.Serial('/dev/tty.usbserial', 115200)
	ser.flush()

	while True:
		r = requests.get('http://saif.ms:3000/needs_hashing').json();
		# check if there is a valid instance to hash
		if "block" not in r:
			time.sleep(0.5)
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

			p = requests.post('http://saif.ms:3000/register_hash', 
				data = {'curr_hash': hashData, 'nonce': int(nonce, 16)})
			print(p.json())
			break
			
	ser.close()

if __name__ == "__main__":
	main(sys.argv[1:])