/*
 * globals.h
 *
 *  Created on: Feb 13, 2018
 *      Author: i8b0b
 */

#ifndef GLOBALS_H_
#define GLOBALS_H_

#include <string>
#include "graphics.h"
#include "servo.h"
#include "wifi.h"
#include "gps.h"

extern Graphics graphics;
extern Servo servo;
extern Wifi wifi;

extern bool purchaseAvail;
extern std::string currentPurchase;
#endif /* GLOBALS_H_ */
