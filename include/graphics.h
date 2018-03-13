/*
 * graphics.h
 *
 *  Created on: Feb 8, 2018
 *      Author: i8b0b
 */

#ifndef GRAPHICS_H_
#define GRAPHICS_H_

#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include <vector>
#include <algorithm>
#include <string>

// #defined constants representing values we write to the graphics 'command' register to get
// it to do something. You will add more values as you add hardware to the graphics chip
// Note DrawHLine, DrawVLine and DrawLine at the moment do nothing - you will modify these

#define DrawHLine				1
#define DrawVLine				2
#define DrawLine				3
#define PutAPixel				0xA
#define GetAPixel				0xB
#define ProgramPaletteColour   	0x10

/*******************************************************************************************
** This macro pauses until the graphics chip status register indicates that it is idle
*******************************************************************************************/

#define WAIT_FOR_GRAPHICS		while((GraphicsStatusReg & 0x0001) != 0x0001)

//Predefined Colour Values
//Use the symbolic constants below as the values to write to the Colour Register
//When you ask the graphics chip to draw something. These values are also returned
//By the read pixel command

// the header file "Colours.h" contains symbolic names for all 256 colours e.g. RED
// while the source file ColourPaletteData.c contains the 24 bit RGB data
// that is pre-programmed into each of the 256 palettes

#define	BLACK		0
#define	WHITE		1
#define	RED			2
#define	LIME		3
#define	BLUE		4
#define	YELLOW		5
#define	CYAN		6
#define	MAGENTA		7
#define SILVER		8
#define GREEN 		12
#define TEAL		14

#define SCREEN_WIDTH  800
#define SCREEN_HEIGHT 480

#define GraphicsCommandReg   			(*(volatile unsigned short int *)(0x84000000))
#define GraphicsStatusReg   			(*(volatile unsigned short int *)(0x84000000))
#define GraphicsX1Reg   				(*(volatile unsigned short int *)(0x84000002))
#define GraphicsY1Reg   				(*(volatile unsigned short int *)(0x84000004))
#define GraphicsX2Reg   				(*(volatile unsigned short int *)(0x84000006))
#define GraphicsY2Reg					(*(volatile unsigned short int *)(0x84000008))
#define GraphicsColourReg				(*(volatile unsigned short int *)(0x8400000E))
#define GraphicsBackGroundColourReg   	(*(volatile unsigned short int *)(0x84000010))

// Constants ideally put this in a header file and #include it
#define XRES 800
#define YRES 480
#define FONT2_XPIXELS	10				// width of Font2 characters in pixels (no spacing)
#define FONT2_YPIXELS	14				// height of Font2 characters in pixels (no spacing)

extern const unsigned short int Font10x14[][14];
extern const unsigned char Font5x7[][7];
extern const unsigned int ColourPalletteData[256];
typedef struct { int x,y;} XYPixel ;

void doDoor(int x, int y, int width, int height);
void doOpenDoor(int x, int y, int width, int height);
void doCloseDoor(int x, int y, int width, int height);
void doLights(int x, int y, int width, int height);
void doLightRelax(int x, int y, int width, int height);
void doLightStudy(int x, int y, int width, int height);
void doLightParty(int x, int y, int width, int height);
void doLightZero(int x, int y, int width, int height);
void doLightFifty(int x, int y, int width, int height);
void doLightHundred(int x, int y, int width, int height);

class Graphics
{
public:
	typedef struct {
		unsigned int x, y, width, height;
		void (*funcPtr)(int, int, int, int);
	} FuncButton;

	Graphics();
	void ClearScreen();
	void FrontPanel();
	void PressLockUnlockEffect(int lock);
	void DoorPanel();
	void isRainingBackgroundEffect (int isRaining);
	void pressEffectLightPanel (int themeNum, int brightNum);
	void LightPanel();
	void SquareFill(unsigned int x, unsigned int y, unsigned int height, unsigned int width, unsigned int fillColor);
	void Button(unsigned int x, unsigned int y,
				unsigned int height, unsigned int width, char text[],
				unsigned int textColor, unsigned int borderColor, void (*func)(int, int, int, int));
	void CircleButton(unsigned int x, unsigned int y,
					  unsigned int radius, char text[],
					  unsigned int textColor, unsigned int borderColor, void (*func)(int, int, int, int));
	void WriteAString(int x, int y, char str[], int color, int big);
	void DrawThemeOptions();
	void DrawBrightnessOptions();
	void DrawDoorOptions();
	std::vector<Graphics::FuncButton>& getFuncButtons();

private:
	XYPixel XYStack[1000];
	XYPixel *Next = &XYStack[0];
	std::vector<Graphics::FuncButton> funcButtons;

	void WriteAPixel (unsigned int x, unsigned int y, unsigned int Colour);
	void WriteAHorzLine (unsigned int x1, unsigned int x2, unsigned int y, unsigned int Colour);
	void WriteAVertLine (unsigned int y1, unsigned int y2, unsigned int x, unsigned int Colour);
	int ReadAPixel (unsigned int x, unsigned int y);
	void ProgramPalette(unsigned int PaletteNumber, unsigned int RGB);
	void WriteRectangle(unsigned int x, unsigned int y, unsigned int height, unsigned int width, unsigned int borderColor);
	void WriteCircle(unsigned int x0, unsigned int y0, unsigned int radius, unsigned int colour);
	void Fill(int _x, int _y, int _FillColour, int _BoundaryColour);
	int PushPixel(XYPixel p1);
	int PopPixel(XYPixel *theXYPixel);
	int IsStackEmpty();
	void OutGraphicsCharFont2(int x, int y, int colour, int backgroundcolour, int c, int Erase);
	void OutGraphicsCharFont1(int x, int y, int fontcolour, int backgroundcolour, int c, int Erase);
};

#endif /* GRAPHICS_H_ */
