//touchscreen.h
#ifndef TOUCH_H_
#define TOUCH_H_

#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include "memory_map.h"


class TouchScreen
{
public:
	TouchScreen(uint32_t baseAddr);
	void TouchLoop();
	void SprintOneTouchLoop();

	/* a data type to hold a point/coord */
	typedef struct { int x, y; } Point ;
	
	int putCharTouch(char c);
	int getCharTouch(void);
	int ScreenTouched(void);
	void WaitForTouch();
	Point GetPen(void);
	Point GetPress(void);
	Point GetRelease(void);

private:

	volatile uint8_t* mTouchscreen_Status; 
	volatile uint8_t* mTouchscreen_Control;
	volatile uint8_t* mTouchscreen_TxData; 
	volatile uint8_t* mTouchscreen_RxData; 
	volatile uint8_t* mTouchscreen_Baud; 
};


#endif
