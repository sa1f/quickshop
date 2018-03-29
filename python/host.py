import serial
import sys
import os


def main(argv):
	ser = serial.Serial()
	ser.baudrate = 115200
	ser.port = 'COM4'
	ser.parity = serial.PARITY_NONE
	ser.bytesize = serial.EIGHTBITS
	ser.stopbits = serial.STOPBITS_ONE

	ser.open()

	ser.flush()
	ser.write("$abc$".encode())
	ser.flush()
	#data = ser.readline()
	#print(hex(data))


if __name__ == "__main__":
	main(sys.argv[1:])