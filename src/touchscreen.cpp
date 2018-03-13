//CPEN 391 - Exercise 1.4 - touchscreen.c
#include "../include/touchscreen.h"
#include <unistd.h>

/***************************************************************************
* Public
****************************************************************************/

TouchScreen::TouchScreen(uint32_t baseAddr)
{
	// Set registers
	mTouchscreen_Status		= (uint8_t*) baseAddr;
	mTouchscreen_Control 	= (uint8_t*) baseAddr;
	mTouchscreen_TxData		= (uint8_t*) baseAddr + 0x2;
	mTouchscreen_RxData		= (uint8_t*) baseAddr + 0x2;
	mTouchscreen_Baud		= (uint8_t*) baseAddr + 0x4;

	// Program 6850 and baud rate generator to communicate with touchscreen
	// send touchscreen controller an "enable touch" command

	// Divide by 16 clock, RTS Low, 8 bits of data, no parity,
	// 1 stop bit, transmitter interrupt disabled
	*mTouchscreen_Control = 0x15;
	// 9600 BAUD
	*mTouchscreen_Baud = 0x05;

	// slight delay to process
	usleep(10000);

	// Command: TOUCH_ENABLE; Enable touch reporting [refer data sheet p.22]
	putCharTouch(0x55);
	putCharTouch(0x01);
	putCharTouch(0x12);

}

void TouchScreen::TouchLoop(){
    while(true){
        Point p = GetRelease();
        printf("x: %i\n", p.x);
        printf("y: %i\n", p.y);
    }
}

void TouchScreen::SprintOneTouchLoop(){
    while(1){
        GetPress();
        Point p = GetRelease();
//      if(p.x ){   //if is within the first half range, execute function 1
//
//      }
//      else{   //if is within the second half range, execute function 2
//
//      }
    }
}

/*****************************************************************************
** test if screen touched
*****************************************************************************/
int TouchScreen::ScreenTouched( void )
{
     // return TRUE if any data received from 6850 connected to touchscreen
     // or FALSE otherwise

    return (*mTouchscreen_RxData == 0x80);
}

/*****************************************************************************
** wait for screen to be touched
*****************************************************************************/
void TouchScreen::WaitForTouch()
{
    while(!ScreenTouched())
        ;
}

TouchScreen::Point TouchScreen::GetPen(void){
    Point p1;
    int packets[4];
    // wait for a pen down command then return the X,Y coordinates of the point
    // calibrated correctly so that it maps to a pixel on screen

    // Wait for first packet of touch
    WaitForTouch();

    int i;
    for(i = 0; i < 4; i++){
        packets[i] = getCharTouch();
    }

    // Get x11 : x7 from 2nd packet, and concatenate to x6 : x0 from 1st packet
    p1.x = (packets[1] << 7) | packets[0];
    p1.y = (packets[3] << 7) | packets[2];

    // Map from controller resolution to screen pixel
    p1.x = p1.x * 799 / 4095;   //[data sheet p14] The resulting full-scale range for reported touch coordinates is 0 to 4095
    p1.y = p1.y  * 479 / 4095;

    return p1;
}

/*****************************************************************************
* This function waits for a touch screen press event and returns X,Y coord
*****************************************************************************/
TouchScreen::Point TouchScreen::GetPress(void)
{
     // wait for a pen down command then return the X,Y coord of the point
     // calibrated correctly so that it maps to a pixel on screen

     return GetPen();
}
/*****************************************************************************
* This function waits for a touch screen release event and returns X,Y coord
*****************************************************************************/
TouchScreen::Point TouchScreen::GetRelease(void)
{
     // wait for a pen up command then return the X,Y coord of the point
     // calibrated correctly so that it maps to a pixel on screen
     return GetPen();
}

/***************************************************************************
* Private
****************************************************************************/

int TouchScreen::putCharTouch(char c){
    // Wait for TX bit in status register to turn 1 (means transmit is empty)
    while((*mTouchscreen_Status & 0x02) != 0x02);
    // Send the data to TX (reduce to 8 bits)
    return c & 0xFF;
}

int TouchScreen::getCharTouch(void)
{
    // poll Rx bit in 6850 status register. Wait for it to become '1'
    // read received character from 6850 RxData register.
    while ((*mTouchscreen_Status & 0x01) != 0x01);
    return *mTouchscreen_RxData;
}



