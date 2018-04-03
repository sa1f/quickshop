
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
		uint32_t nonce = 0;
		uint32_t length512;
		uint32_t i = 0;

		// poll serial for new data to hash and pre-process appropriately
		std::vector<uint8_t> message = sha256.getMessage();
		printf("Raw message size is %d\n", message.size()*8);
		message = sha256.padMessage(nonce);

		// cast to 32 bit list
		std::vector<uint32_t> message32 = convertVec8to32(message);

		// divide by (512/32 = 16) to get required number of additional hashes
		length512 = message32.size() >> 4;
		printf("message size is: %d length512 is: %d\n", message32.size()*32, length512);

		// reset hash core
		sha256.resetHash();
		std::vector<uint32_t> hash32;
		for (i = 0; i < length512; i++)
		{
			hash32 = sha256.getHash(message32, i*16);
		}

		while (hash32[0] >> 24 != 0)
		{
			nonce++;
			message = sha256.padMessage(nonce);
			message32 = convertVec8to32(message);

			// reset hash core
			sha256.resetHash();
			for (i = 0; i < length512; i++)
			{
				hash32 = sha256.getHash(message32, i*16);
			}
			printf("hash: %X %X %X %X %X %X %X %X\n", hash32[0], hash32[1], 
				hash32[2], hash32[3], hash32[4], hash32[5], hash32[6], hash32[7]);
		}

		// cast to 8 bit list
		std::vector<uint8_t> hash = convertVec32to8(hash32);
		uint8_t nonceArray[] = {
			((nonce >> 24) & 0xFF),
			((nonce >> 16) & 0xFF),
			((nonce >> 8) & 0xFF),
			(nonce& 0xFF)
		};
		std::vector<uint8_t> nonceString = (nonceArray, 
			nonceArray + sizeof(nonceArray) / sizeof(nonceArray[0]));

		// send back to server
		sha256.sendMessage(hash);
		sha256.sendMessage(nonceString);

		printf("Sent message back to server\n");
	}
}


