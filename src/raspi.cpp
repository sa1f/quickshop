#include "../include/globals.h"
#include "../include/raspi.h"

Raspi::Raspi(uint32_t baseAddr){
	// Set registers
	mRaspi_Status		= (uint8_t*)baseAddr;
	mRaspi_Control 		= (uint8_t*)baseAddr;
	mRaspi_TxData		= (uint8_t*)baseAddr + 0x2;
	mRaspi_RxData		= (uint8_t*)baseAddr + 0x2;
	mRaspi_Baud			= (uint8_t*)baseAddr + 0x4;

	// set up 6850 control register to utilize a divide by 16 clock,
	// set rts low, use 8 bits of data, no parity, 1 stop bit,
	// transmitter interrupt disabled
	*(mRaspi_Control) = 0x95;

	// program baud rate generator to use 115k baud
	*(mRaspi_Baud) = 0x1;

	send_message_nowait("dofile(\"module.lua\")\r\n");
}

int Raspi::putCharRaspi(char c) {

	// poll Tx bit in 6850 status register. Wait for it to become '1'
	while( *(mRaspi_Status) & 0x2 != 0x2){
	}
	// write 'c' to the 6850 TxData register to output the character
	*(mRaspi_TxData) = c;
 	return c ; // return c
}

int Raspi::getCharRaspi() {
    // poll Rx bit in 6850 status register. Wait for it to become '1'
    // read received character from 6850 RxData register.
    while ((*mRaspi_Status & 0x01) != 0x01);
    return *mRaspi_RxData;
}

void Raspi::sendMessageNowait(std::string message)
{
	int i;
	for(i = 0; i <  message.length(); i++) {
		putchar_Raspi(message[i]);
		//usleep(500);
	}
}

void Raspi::updatePurchases()
{
	std::string msg = getPiMessage();
	if (msg == "")
		purchaseAvail = false;
	else
	{
		purchaseAvail = true;
		currentPurchase = msg;
	}
}

std::string Raspi::getPiMessage() {
	char request[] = "getPurchase";
	sendMessageNowait(msgString);
	std::string purchase;

	char data = getCharRaspi();
	printf("%c\n", data);
	while (data != '$') {
		data = getCharRaspi();
	}
	data = getCharRaspi();
	while(data != '$') {
		purchase.push_back(data);
		data = getCharRaspi();
	}

	return purchase;
}

