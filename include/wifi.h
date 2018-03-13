
#ifndef WIFI_H_
#define WIFI_H_

#include <stdio.h>
#include <string>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <stdint.h>
#include <vector>

class Wifi
{
private:
	volatile uint8_t* mWifi_Status;
	volatile uint8_t* mWifi_Control;
	volatile uint8_t* mWifi_TxData;
	volatile uint8_t* mWifi_RxData;
	volatile uint8_t* mWifi_Baud;

    int putchar_wifi(char c);

public:
    Wifi(uint32_t baseAddr);
    void send_message_nowait(std::string message);
    void test_wifi();
    int getchar_wifi();
    std::vector<std::string> get_weather_data(int longitude, int lat);
    //void Wifi::set_light(std::string attribute, std::string value);
};

#endif
