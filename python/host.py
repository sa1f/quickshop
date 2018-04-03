import serial
import sys
import os
import time


def main(argv):
	#msgString = "$efbweiufhi32hru230283rhef230rjsdbdeefufj237h98980806806975647cff4f923bfiy2g3yfg2$"
	#msgString = "$231faaaxaaaaefefwegfwef4k8fgefetdutdsos47ssaa29y0hinjubvtx7r6s64s653s7s4iwc56ro6rvob86rbnot78rd5bdisv5cwx54646efweg4fwrrfw83hfy38eka300023jfjsq2$"
	msg = msgString.encode()
	ser = serial.Serial('/dev/tty.usbserial', 115200)
	# ser.timeout = 5
	# ser.parity = serial.PARITY_NONE
	# ser.bytesize = serial.EIGHTBITS
	# ser.stopbits = serial.STOPBITS_ONE

	ser.flush()

	for i in range(len(msgString)):
		ser.write(msgString[i].encode())
		# wait for 1 milisecond because python is dumb
		# and sends data faster than the actual buadrate... wtf
		time.sleep(0.001)  
	ser.flush()


	time.sleep(1./120)
	data = ser.readline()
	print(data.hex())


	ser.close()


if __name__ == "__main__":
	main(sys.argv[1:])