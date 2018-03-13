
#ifndef RASPI_H_
#define RASPI_H_

#include <stdio.h>
#include <string>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <stdint.h>

class Raspi
{
private:
	volatile uint8_t* mRaspi_Status;
	volatile uint8_t* mRaspi_Control;
	volatile uint8_t* mRaspi_TxData;
	volatile uint8_t* mRaspi_RxData;
	volatile uint8_t* mRaspi_Baud;

    int putCharWifi(char c);

public:
    Raspi(uint32_t baseAddr);
    void sendMessageNowait(std::string message);
    int getCharRaspi();
    std::string Raspi::getPiMessage();
};

#endif
