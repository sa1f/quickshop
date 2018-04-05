#ifndef SHA256_H_
#define SHA256_H_

#include <string>
#include <vector>

#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <stdint.h>

#include "memory_map.h"

class SHA256
{
private:
	volatile uint8_t* mSHA256_Status;
	volatile uint8_t* mSHA256_Control;
	volatile uint8_t* mSHA256_TxData;
	volatile uint8_t* mSHA256_RxData;
	volatile uint8_t* mSHA256_Baud;

	uint64_t mMessageLength;
	std::vector<uint8_t> mRxData;

public:
    SHA256(uint32_t baseAddr);
    std::vector<uint8_t> getMessage();
    std::vector<uint8_t> padMessage(uint32_t nonce);
    uint64_t getMessageLength();
    void sendMessage(std::vector<uint8_t> message);
    std::vector<uint32_t> getHash(std::vector<uint32_t> message, uint32_t start);
    void resetHash();
    uint8_t getChar();
    uint8_t putChar(uint8_t c);
};

#endif // SHA256_H_
