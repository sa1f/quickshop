
#include "../include/servo.h"

Servo::Servo(uint32_t baseAddr)
{
	mServoReg = (uint8_t*)baseAddr;
}

void Servo::setServo(uint8_t position)
{
	if (position > 8 || position < 0)
	{
		printf("Invalid position range, must be in range [0,8]\n");
	}
	else
	{
		*mServoReg = position;
	}
}

uint8_t Servo::getServo()
{
	return *mServoReg;
}