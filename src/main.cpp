
#include <stdlib.h>
#include <stdio.h>
#include <string>
#include <iostream>
#include <vector>

#include "../include/memory_map.h"
#include "../include/globals.h"
#include "../include/sha256.h"

SHA256 sha256(0x84000210);

// Assumption that vector a is 32 bit aligned
// Note, it will be because we pad to align to 512
std::vector<uint32_t> convertVec8to32(std::vector<uint8_t> a)
{
	std::vector<uint32_t> b;
	int i = 0;
	for (i = 0; i < a.size(); i+=4)
	{
		uint32_t data = (uint32_t)((a[i] << 24) | (a[i+1] << 16) | (a[i+2] << 8) | a[i+3]);
		b.push_back(data);
	}
	return b;
}

// Assumption that vector a is 8 bit aligned
// Note, it will be because SHA256 is 256 bits
std::vector<uint8_t> convertVec32to8(std::vector<uint32_t> a)
{
	std::vector<uint8_t> b;
	int i = 0;
	for (i = 0; i < a.size(); i++)
	{
		b.push_back((a[i] >> 24) & 0xFF);
		b.push_back((a[i] >> 16) & 0xFF);
		b.push_back((a[i] >> 8) & 0xFF);
		b.push_back(a[i] & 0xFF);
	}
	return b;
}

int main(void)
{
	while (1) {
		// poll for incoming data to hash
		std::vector<uint8_t> message = sha256.getMessage();

		// cast to 32 bit list
		std::vector<uint32_t> message32 = convertVec8to32(message);
		// run SHA256
		std::vector<uint32_t> hash32 = sha256.getHash(message32);
		// cast to 8 bit list
		std::vector<uint8_t> hash = convertVec32to8(hash32);

		// send back to server
		sha256.sendMessage(hash);
	}
}


