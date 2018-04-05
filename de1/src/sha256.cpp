#include "../include/sha256.h"

SHA256::SHA256(uint32_t baseAddr){
	// Set registers
	mSHA256_Status		= (uint8_t*)baseAddr;
	mSHA256_Control 	= (uint8_t*)baseAddr;
	mSHA256_TxData		= (uint8_t*)baseAddr + 0x2;
	mSHA256_RxData		= (uint8_t*)baseAddr + 0x2;
	mSHA256_Baud		= (uint8_t*)baseAddr + 0x4;

	// set up 6850 control register to utilize a divide by 16 clock,
	// set rts low, use 8 bits of data, no parity, 1 stop bit,
	// transmitter interrupt disabled
	*(mSHA256_Control) = 0x95;

	// program baud rate generator to use 115k baud
	*(mSHA256_Baud) = 0x1;
	mMessageLength = 0;
}

uint8_t SHA256::putChar(uint8_t c) {

	// poll Tx bit in 6850 status register. Wait for it to become '1'
	while( *(mSHA256_Status) & 0x2 != 0x2){
	}
	// write 'c' to the 6850 TxData register to output the character
	*(mSHA256_TxData) = c;
 	return c ; // return c
}

uint8_t SHA256::getChar() {
    // poll Rx bit in 6850 status register. Wait for it to become '1'
    // read received character from 6850 RxData register.
    while ((*mSHA256_Status & 0x01) != 0x01);
    return *mSHA256_RxData;
}

// sends message over serial back to Python module
void SHA256::sendMessage(std::vector<uint8_t> message)
{
	uint32_t i;
	for(i = 0; i <  message.size(); i++) {
		putChar(message[i]);
		usleep(1000);
	}
	putChar((uint8_t)'\r');
	usleep(1000);
	putChar((uint8_t)'\n');

}

std::vector<uint8_t> SHA256::padMessage(uint32_t nonce)
{
	// XOR nonce with first 32 bits
	std::vector<uint8_t> message(mRxData.begin(), mRxData.end());
	message[0] = message[0] ^ ((nonce >> 24) & 0xFF);
	message[1] = message[1] ^ ((nonce >> 16) & 0xFF);
	message[2] = message[2] ^ ((nonce >> 8) & 0xFF);
	message[3] = message[3] ^ (nonce& 0xFF);

	// pad message with ending bit and 0s
	message.push_back((0x80 & 0xFF));
	while ((message.size()*8) % 512 != 448)
	{
		message.push_back(0);
	}

	// put message length at the end
	int i;
	for (i = 7; i >= 0; i--)
	{
		message.push_back((uint8_t)((mMessageLength >> i*8)) & 0xFF);
	}

	return message;
}

std::vector<uint8_t> SHA256::getMessage()
{
	mRxData = {};
	mMessageLength = 0;
	// check for $ character to signal start of data transfer
	char data = getChar();
	while (data != '$') {
		data = getChar();
	}

	// start recording Data
	// $ to signal end of data transfer
	data = getChar();
	while(data != '$') {
		mRxData.push_back(data);
		mMessageLength+=8;
		data = getChar();
	}
	return mRxData;
}

uint64_t SHA256::getMessageLength()
{
	return mMessageLength;
}

void SHA256::resetHash()
{
	 // wipe current hash
	 *SHA_addr = 0xE0000000;
	 // init hash
	 *SHA_addr = 0x20000000;
}

std::vector<uint32_t> SHA256::getHash(std::vector<uint32_t> message, uint32_t start)
{
	 std::vector<uint32_t> hash;
	 uint32_t data;
	 uint32_t i;

	 // start write sequence
	 *SHA_addr = 0x40000000;
	 for (i = start; i < start + 16; i++)
	 {
	 	*SHA_addr = i;
	 	*SHA_tx = message[i];
	 }

	 // start hash sequence and block
	 // until completion
	 *SHA_addr = 0x80000000;
	 while (*SHA_status != 1)
	 {
		 // do nothing
	 }

	 // start read sequence
	 *SHA_addr = 0x60000000;
	 for (i = 0; i < 8; i++)
	 {
	 	*SHA_addr = 0x60000000 + i;
	 	uint32_t data = *SHA_rx;
	 	hash.push_back(data);
	 }
	 // put SHA core back in idle state
	 *SHA_addr = 0x00000000;
	 return hash;
}


