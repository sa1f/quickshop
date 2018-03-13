#include "../include/wifi.h"

Wifi::Wifi(uint32_t baseAddr){
	// Set registers
	mWifi_Status		= (uint8_t*)baseAddr;
	mWifi_Control 		= (uint8_t*)baseAddr;
	mWifi_TxData		= (uint8_t*)baseAddr + 0x2;
	mWifi_RxData		= (uint8_t*)baseAddr + 0x2;
	mWifi_Baud			= (uint8_t*)baseAddr + 0x4;

	// set up 6850 control register to utilize a divide by 16 clock,
	// set rts low, use 8 bits of data, no parity, 1 stop bit,
	// transmitter interrupt disabled
	*(mWifi_Control) = 0x95;

	// program baud rate generator to use 115k baud
	*(mWifi_Baud) = 0x1;

	send_message_nowait("dofile(\"module.lua\")\r\n");
}

int Wifi::putchar_wifi(char c) {

	// poll Tx bit in 6850 status register. Wait for it to become '1'
	while( *(mWifi_Status) & 0x2 != 0x2){
	}
	// write 'c' to the 6850 TxData register to output the character
	*(mWifi_TxData) = c;
 	return c ; // return c
}

int Wifi::getchar_wifi() {
    // poll Rx bit in 6850 status register. Wait for it to become '1'
    // read received character from 6850 RxData register.
    while ((*mWifi_Status & 0x01) != 0x01);
    return *mWifi_RxData;
}

void Wifi::send_message_nowait(std::string message)
{
	int i;
	//printf("Printing: %s", message.c_str());
	for(i = 0; i <  message.length(); i++) {
		putchar_wifi(message[i]);
		usleep(500);
		//printf("%c\n", message[i]);
	}
}

std::vector<std::string> Wifi::get_weather_data(int longitude, int lat){

	char msgString[100];
	sprintf(msgString, "get_weather(%i, %i)\r\n", longitude, lat);
	printf("%s\n", msgString);

	send_message_nowait(msgString);
	std::string weather_type;
	std::string temperature;

	char data = getchar_wifi();
	printf("%c\n", data);
	while (data != '$') {
		data = getchar_wifi();
	}
	data = getchar_wifi();
	while(data != '|') {
		weather_type.push_back(data);
		data = getchar_wifi();
	}
	data = getchar_wifi();
	while(data != '$') {
		temperature.push_back(data);
		data = getchar_wifi();
	}

	std::vector<std::string> v;
	v.push_back(weather_type);
	v.push_back(temperature);
	return v;
}

