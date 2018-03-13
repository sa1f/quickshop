#ifndef GPS_H_
#define GPS_H_

#include <string>

#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#include "memory_map.h"

class GPS
{
public:
    GPS(uint32_t baseAddr);
    void eraseGPSFlash();
    void setGPSConfig();
    void startGPSLogging();
    void stopGPSLogging();
    void takeGPSSnapshot();
    void dumpGPSData();
    bool scanGPSData();
    int getLat();
    int getLong();

private:    

    char GPSData[300];
    char latitude[10];
    char latitudeDir[2];
    char longitude[10];
    char longitudeDir[2];
    
    // log Data
    // Probably wont use this in project
    char logLat[8][10];
    char logLong[8][10];
    char logData[300];

    uint32_t baud_9600;
    uint32_t serial_rst;
    uint32_t serial_init;
    uint32_t gpsDataBufferSize;

    volatile uint8_t* mGPS_Control; 
    volatile uint8_t* mGPS_Status; 
    volatile uint8_t* mGPS_TxData; 
    volatile uint8_t* mGPS_RxData; 
    volatile uint8_t* mGPS_Baud; 


    uint8_t GPSTestForReceivedData(void);
    uint8_t putcharGPS(uint8_t c);
    uint8_t getcharGPS(void);
    void sendPacket(std::string cmd);
    std::string genChecksum(std::string cmd);
    size_t copyCoords(uint32_t elementCounter, size_t position);
    int swapEndian(char *s);
    char *floatToLatitudeConversion(int x);
    char *floatToLongitudeConversion(int x);
    void getLogData();


};


#endif
