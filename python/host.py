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
			message.append(r.get('block'))
			message.append(r.get('data'))
			message.append(r.get('prev_hash' + '$'))
		
			for i in range(len(msgString)):
				ser.write(msgString[i].encode())
				# wait for 1 milisecond because python is dumb
				# and sends data faster than the actual buadrate... wtf
				time.sleep(0.001)  
			ser.flush()

			time.sleep(1./120)
			hashData = str(ser.readline().hex())
			nonce = str(ser.readline().hex())

			p = requests.post('http://saif.ms:3000/register_hash', data = {'curr_hash': hashData, 'nonce': nonce})
			print(p.json())
			break
			
	ser.close()
	
	

	


if __name__ == "__main__":
	main(sys.argv[1:])