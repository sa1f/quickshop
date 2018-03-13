
#include "../include/gps.h"
#include "../include/globals.h"

GPS::GPS(uint32_t baseAddr)
{
    baud_9600         = 0x7;
    serial_rst        = 0x3;
    serial_init       = 0x95;
    gpsDataBufferSize = 300;

	// Set registers
	mGPS_Status		= (uint8_t*)baseAddr;
	mGPS_Control 	= (uint8_t*)baseAddr;
	mGPS_TxData		= (uint8_t*)baseAddr + 0x2;
	mGPS_RxData		= (uint8_t*)baseAddr + 0x2;
	mGPS_Baud		= (uint8_t*)baseAddr + 0x4;

	// set up 6850 control register to utilize a divide by 16 clock,
	// set rts low, use 8 bits of data, no parity, 1 stop bit,
	// transmitter interrupt disabled
	*mGPS_Control = serial_rst;	// master reset first
	*mGPS_Control = serial_init;

	// program baud rate generator to use 115k baud
	*mGPS_Baud = baud_9600;
}

// the following function polls the 6850 to determine if any character
// has been received.  It doesn't wait for one, or read it, it simply tests
// to see if one is available to read
uint8_t GPS::GPSTestForReceivedData(void) {
	// test Rx bit in 6850 serial comms chip status register
	// if Rx bit is set, return TRUE, otherwise return FALSE
	return *(GPS_Status) & 1;
}

uint8_t GPS::putcharGPS(uint8_t c){
	// poll Tx bit in 6850 status register.  Wait for it to become '1'
	// write 'c' to the 6850 TxData register to output the character
	int transmit_ready = *(GPS_Status) & 2;
	while (!transmit_ready){
		transmit_ready = *(GPS_Status) & 2;
	}
	*(GPS_TxData) = c;
	//printf("%X", c);
	return c;
}

uint8_t GPS::getcharGPS(void) {
	// poll Rx bit in 6850 status register.  Wait for it to become '1'
	// read received character from 6850 RxData register
	int received_data = *(GPS_Status) & 1;
	while (!received_data){
		received_data = *(GPS_Status) & 1;
	}
	// data is ready to be read
	return *(GPS_RxData);
}

void GPS::sendPacket(std::string cmd)
{
	uint32_t i;
	for(i = 0; i < cmd.length(); i++)
	{
		putcharGPS(cmd[i]);
	}
}

std::string GPS::genChecksum(std::string cmd)
{
	uint8_t checksum = cmd[1];
	uint32_t i;
	for(i = 2; cmd[i] != '*'; i++)
	{
		checksum ^= cmd[i];
	}
	char checksumAscii[2];
	sprintf(checksumAscii, "%X", checksum);
	return std::string(checksumAscii);
}


void GPS::eraseGPSFlash()
{
	std::string cmd = "$PMTK184,1*22\r\n";
	sendPacket(cmd);
}

void GPS::setGPSConfig()
{
    std::string cmd = "$PMTK187,1*";
    cmd += genChecksum(cmd);
    cmd += "\r\n";
    sendPacket(cmd);
}

void GPS::startGPSLogging()
{
	std::string cmd = "$PMTK185,0*";
	cmd += genChecksum(cmd);
	cmd += "\r\n";
	sendPacket(cmd);
}

void GPS::stopGPSLogging()
{
	std::string cmd = "$PMTK185,1*";
	cmd += genChecksum(cmd);
	cmd += "\r\n";
	sendPacket(cmd);
}

void GPS::takeGPSSnapshot()
{
    std::string cmd = "$PMTK186,1*";
	cmd += genChecksum(cmd);
	cmd += "\r\n";
	sendPacket(cmd);
}

void GPS::dumpGPSData()
{
	std::string cmd = "$PMTK622,1*";
	cmd += genChecksum(cmd);
	cmd += "\r\n";
	sendPacket(cmd);
}

size_t GPS::copyCoords(uint32_t elementCounter, size_t position)
{
	const uint32_t latStart = 1;
	const uint32_t latDirStart = 2;
	const uint32_t longStart = 3;
	const uint32_t longDirStart = 4;
	uint32_t i;

	switch (elementCounter)
	{
		case latStart: {
			for(i = 0; GPSData[position + i] != ','; i++)
			{
				latitude[i] = GPSData[position + i];
			}
			position += i;
		} break;
		case longStart: {
			for(i = 0; GPSData[position + i] != ','; i++)
			{
				longitude[i] = GPSData[position + i];
			}
			position += i;
			} break;
		case latDirStart: {
			latitudeDir[0] = GPSData[position];
			position++;
			} break;
		case longDirStart: {
			longitudeDir[0] = GPSData[position];
			position++;
			} break;
		default:
			position++;
			break;
	}
	return position;

}

bool GPS::scanGPSData()
{
	const std::string header = "$GPGGA,";
	const uint32_t headerOffset = 7;

	uint32_t elementCounter = 0;
	size_t position = 0;
	
	uint32_t i;
	for (i = 0; i < gpsDataBufferSize; i++) 
	{
		GPSData[i] = getcharGPS();
	}

    std::string data = GPSData;
    position = data.find(header);

    printf("%s\n", GPSData);


	if (position != std::string::npos)
	{
		position += headerOffset;
		while (elementCounter < 5)
		{
			if (GPSData[position] == ',')
			{
				elementCounter++;
				position++;
			}
			else
			{
				position = copyCoords(elementCounter, position); 
			}
		}
        return true;
	}
    return false;

}

int GPS::getLat()
{
    std::string latStr = latitude;
    size_t decimalPos = latStr.find(".");
    float lat = 0;
    if (decimalPos == 5)
    {
        char upper[4] = {0};
        strncpy(upper, latitude, 3);
        lat = atoi(upper);
    }
    else
    {
        char upper[3] = {0};
        strncpy(upper, latitude, 2);
        lat = atoi(upper);
    }

    lat += atof(&latitude[decimalPos-2]) / 60;
    if (latitudeDir[0] == 'S')
    {
        lat *= -1;
    }

    printf("Lat is %f\n", lat);
    return lat;
}

int GPS::getLong()
{
    std::string longStr = longitude;
    size_t decimalPos = longStr.find(".");
    float longVal = 0;
    if (decimalPos == 5)
    {
        char upper[4] = {0};
        strncpy(upper, longitude, 3);
        longVal = atoi(upper);
    }
    else
    {
        char upper[3] = {0};
        strncpy(upper, longitude, 2);
        longVal = atoi(upper);
    }

    longVal += atof(&longitude[decimalPos-2]) / 60;
    if (longitudeDir[0] == 'W')
    {
        longVal *= -1;
    }

    printf("Long is %f\n", longVal);
    return longVal;
}

int GPS::swapEndian(char *s)
{
	register int val;

	val = strtoul(s, NULL, 16);
	val = ((val << 8) & 0xFF00FF00) | ((val >> 8) & 0xFF00FF);
	val = (val << 16) | ((val >> 16) & 0xFFFF);
	return val;
}

char* GPS::floatToLatitudeConversion(int x)
{
	static char buff[100];

	float *ptr = (float*)&x;
	float f = *ptr;
	sprintf(buff, "%2.4f", f);
	return buff;
}

char* GPS::floatToLongitudeConversion(int x)
{
	static char buff[100];

	float *ptr = (float*)&x;
	float f = *ptr;
	sprintf(buff, "%3.4f", f);
	return buff;
}

void GPS::getLogData()
{
    int checkState = 0;
    uint32_t i,j;
    for (j = 0; j < 10; j++)
    {
    	 for (i = 0; i < 250; i++)
    	 {
    	        logData[i] = getcharGPS();
    	 }
    	 if (j == 0) continue;

    	 std::string logStr = logData;
    	 char latData[9] = {0};
    	 char longData[9] = {0};

    	 size_t position = logStr.find("$PMTKLOX,1,");

    	 strncpy(latData, &logData[position + 24], 9);
    	 if (latData[7] == ',') continue;
    	 latData[6] = latData[7];
    	 latData[7] = latData[8];
    	 latData[8] = 0;

    	 strncpy(longData, &logData[position + 33], 9);
    	 if (longData[7] == ',') continue;
    	 longData[6] = longData[7];
    	 longData[7] = longData[8];
    	 longData[8] = 0;


         char* latfloat = floatToLatitudeConversion(swapEndian(latData));
         char* longfloat = floatToLongitudeConversion(swapEndian(longData));

         printf("Log Latitude: %s\n", latfloat);
         printf("Log Longitude: %s\n", longfloat);
    }


}

//int main(void){
//	printf("Initializing GPS...\n");
//	Init_GPS();
//	
//	//stopGPSLogging();
//	//eraseGPSFlash();
//	setGPSConfig();
//	startGPSLogging();
//    dumpGPSData();
//
//    getLogData();
//
//    //while (1)
//    //{
//    //	if(scanGPSData())
//    //	{
//    //		//printf("%s\n", GPSData);
//    //		getLat();
//    //		getLong();
//    //	}
//    //}
//
//    return 0;
//}
