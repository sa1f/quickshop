#ifndef SERVO_H_
#define SERVO_H_

#include <stdio.h>
#include <stdint.h>

class Servo {

public: 
	Servo(uint32_t baseAddr);
	void setServo(uint8_t position);
	uint8_t getServo();

private: 
	volatile uint8_t *mServoReg;
};

#endif
