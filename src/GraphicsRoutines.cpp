#include "../include/graphics.h"
#include "../include/globals.h"

void doDoor(int x, int y, int width, int height) {
	graphics.ClearScreen();
	graphics.DoorPanel();
}

void doOpenDoor(int x, int y, int width, int height) {
	graphics.DrawDoorOptions();
	graphics.SquareFill(x, y, width, height, BLUE);
	char lock[] = {'l', 'o', 'c', 'k', '\0'};
	graphics.WriteAString(x + width / 2 - 4 * 11 / 2, y + height / 2, lock, BLACK, 1);

	servo.setServo(0);
}

void doCloseDoor(int x, int y, int width, int height) {
	graphics.DrawDoorOptions();
	graphics.SquareFill(x, y, width, height, BLUE);
	char unlock[] = {'u', 'n', 'l', 'o', 'c', 'k', '\0'};
	graphics.WriteAString(x + width / 2 - 6 * 11 / 2, y + height / 2, unlock, BLACK, 1);

	servo.setServo(6);
}

void doLight(int x, int y, int width, int height) {
	graphics.ClearScreen();
	graphics.LightPanel();
}

void doBack(int x, int y, int width, int height) {
	graphics.ClearScreen();
	graphics.FrontPanel();
}

void doLightRelax(int x, int y, int width, int height) {
	graphics.DrawThemeOptions();
	graphics.SquareFill(x, y, width, height, BLUE);
	char relax[] = {'r', 'e', 'l', 'a', 'x', '\0'};
	graphics.WriteAString(x + width / 2 - 25, y + height / 2, relax, BLACK, 1);

	// send lua
	wifi.send_message_nowait("set_light(\"theme\", \"relax\")\r\n");
}

void doLightStudy(int x, int y, int width, int height) {
	graphics.DrawThemeOptions();
	graphics.SquareFill(x, y, width, height, BLUE);
	char study[] = {'s', 't', 'u', 'd', 'y', '\0'};
	graphics.WriteAString(x + width / 2 - 25, y + height / 2, study, BLACK, 1);

	// send lua
	wifi.send_message_nowait("set_light(\"theme\", \"study\")\r\n");
}

void doLightParty(int x, int y, int width, int height) {
	graphics.DrawThemeOptions();
	graphics.SquareFill(x, y, width, height, BLUE);
	char party[] = {'p', 'a', 'r', 't', 'y', '\0'};
	graphics.WriteAString(x + width / 2 - 5 * 11 / 2, y + height / 2, party, BLACK, 1);

	// send lua
	wifi.send_message_nowait("set_light(\"theme\", \"party\")\r\n");
}

void doLightZero(int x, int y, int width, int height) {
	graphics.DrawBrightnessOptions();
	graphics.SquareFill(x, y, width, height, BLUE);
	char zero[] = {'10', '\0'};
	graphics.WriteAString(x + width / 2 - 1 * 11 / 2, y + height / 2, zero, BLACK, 1);

	// send lua
	//wifi.send_message_nowait("set_light(\"power\", \"off\")\r\n");
	wifi.send_message_nowait("set_light(\"brightness\", \"0.1\")\r\n");
}

void doLightFifty(int x, int y, int width, int height) {
	graphics.DrawBrightnessOptions();
	graphics.SquareFill(x, y, width, height, BLUE);
	char fifty[] = {'5', '0', '\0'};
	graphics.WriteAString(x + width / 2 - 2 * 11 / 2, y + height / 2, fifty, BLACK, 1);

	// send lua
	//wifi.send_message_nowait("set_light(\"power\", \"on\")\r\n");
	wifi.send_message_nowait("set_light(\"brightness\", \"0.5\")\r\n");
}

void doLightHundred(int x, int y, int width, int height) {
	graphics.DrawBrightnessOptions();
	graphics.SquareFill(x, y, width, height, BLUE);
	char hundred[] = {'1', '0', '0', '\0'};
	graphics.WriteAString(x + width / 2 - 3 * 11 / 2, y + height / 2, hundred, BLACK, 1);

	// send lua
	//wifi.send_message_nowait("set_light(\"power\", \"on\")\r\n");
	wifi.send_message_nowait("set_light(\"brightness\", \"1\")\r\n");
}

/**
 * Initializes screen by programming colour palette and clearing screen.
 */
Graphics::Graphics(){
	int i;
	for (i = 0; i < 10; i++){
		ProgramPalette(i, ColourPalletteData[i]);
	}
	printf("Programming colours into the colour palette.. Done\n");
	ClearScreen();
	printf("Clearing screen... Done\n");
}

/**********************************************************************
* This function writes a single pixel to the x,y coords specified in the specified colour
* Note colour is a palette number (0-255) not a 24 bit RGB value
**********************************************************************/
void Graphics::WriteAPixel (unsigned int x, unsigned int y, unsigned int Colour)
{
	WAIT_FOR_GRAPHICS;			// is graphics ready for new command

	GraphicsX1Reg = x;			// write coords to x1, y1
	GraphicsY1Reg = y;
	GraphicsColourReg = Colour;		// set pixel colour with a palette number
	GraphicsCommandReg = PutAPixel;		// give graphics a "write pixel" command
}

/**********************************************************************
* This function writes a single pixel to the x,y coords specified in the specified colour
* Note colour is a palette number (0-255) not a 24 bit RGB value
* precondition: x2 > x1
**********************************************************************/
void Graphics::WriteAHorzLine (unsigned int x1, unsigned int x2, unsigned int y, unsigned int Colour)
{
	if (x2 <= x1) return;               // assert precondition

	WAIT_FOR_GRAPHICS;			        // is graphics ready for new command

	GraphicsY1Reg = y;
	GraphicsX1Reg = x1;
	GraphicsX2Reg = x2;
	GraphicsColourReg = Colour;		    // set pixel colour with a palette number
	GraphicsCommandReg = DrawHLine;		// give graphics a "write pixel" command
}

/**********************************************************************
* This function writes a single pixel to the x,y coords specified in the specified colour
* Note colour is a palette number (0-255) not a 24 bit RGB value
* precondition: y2 > y1
**********************************************************************/
void Graphics::WriteAVertLine (unsigned int y1, unsigned int y2, unsigned int x, unsigned int Colour)
{
	if (y2 <= y1) return;               // assert precondition

	WAIT_FOR_GRAPHICS;			   	    // is graphics ready for new command

	GraphicsX1Reg = x;
	GraphicsY1Reg = y1;
	GraphicsY2Reg = y2;
	GraphicsColourReg = Colour;		    // set pixel colour with a palette number
	GraphicsCommandReg = DrawVLine;		// give graphics a "write pixel" command
}

/*****************************************************************************************
* This function read a single pixel from x,y coords specified and returns its colour
* Note returned colour is a palette number (0-255) not a 24 bit RGB value
******************************************************************************************/
int Graphics::ReadAPixel (unsigned int x, unsigned int y)
{
	WAIT_FOR_GRAPHICS;			// is graphics ready for new command

	GraphicsX1Reg = x;			// write coords to x1, y1
	GraphicsY1Reg = y;
	GraphicsCommandReg = GetAPixel;		// give graphics a "get pixel" command

	WAIT_FOR_GRAPHICS;			// is graphics done reading pixel
	return (int)(GraphicsColourReg) ;		// return the palette number (colour)
}

/****************************************************************************************************
** subroutine to program a hardware (graphics chip) palette number with an RGB value
** e.g. ProgramPalette(RED, 0x00FF0000) ;
****************************************************************************************************/

void Graphics::ProgramPalette(unsigned int PaletteNumber, unsigned int RGB)
{
    WAIT_FOR_GRAPHICS;
    GraphicsColourReg = PaletteNumber;
    GraphicsX1Reg = RGB >> 16;          // program red value in ls.8 bit of X1 reg
    GraphicsY1Reg = RGB;                	 // program green and blue into 16 bit of Y1 reg
    GraphicsCommandReg = ProgramPaletteColour;	// issue command
}

int Graphics::PushPixel(XYPixel p1)
{
    if(Next <= &XYStack[1000]) {
        *Next++ = p1;
        return 0 ;
    }
    else
        return -1;
}

int Graphics::PopPixel(XYPixel *theXYPixel)
{
    if(Next >= XYStack) {
        *theXYPixel = *(--Next);
        return 0;
    }
    else
        return -1;
}

int Graphics::IsStackEmpty()
{
    if(Next == XYStack)
        return 1;
    else
        return 0;
}
/*
void Graphics::Fill(int _x, int _y, int _FillColour, int _BoundaryColour)
{
    register int     x, y;
    register int     BoundaryColour = _BoundaryColour;
    register int 	 PixelColour, FillColour = _FillColour;

    int     XRight, XLeft;
    int     SaveX, SaveY;      		// temp variable
    XYPixel aPoint, aPoint1;           // temp var

    Next = XYStack ;                    // initialise to start of stack
    aPoint.x = _x ;
    aPoint.y = _y ;

    PushPixel(aPoint) ;                   // push the seed

    while(!IsStackEmpty())                 // keep going until no more items on the stack
    {
        PopPixel(&aPoint) ;                 // get a point from the stack
        x = aPoint.x ;
        y = aPoint.y ;
        WriteAPixel(x, y, FillColour);     // fill the point in the fill colour

        // fill the span to the right of the seed value
        SaveX = x++ ;                  // save the x coord of the the point we just filled and move one pixel right

        while((char)(ReadAPixel(x,y)) != (char)(BoundaryColour))							// if new pixel is not the boundary colour
            WriteAPixel(x++, y, FillColour);     											// fill it and keep moving right along a horizontal line

        // must have found the boundary colour when moving right
        XRight = x - 1 ;		// save X coord of the last filled pixel on this line when moving right
        x = SaveX ;				// get the original starting x back

        // now fill the span to the left of the seed value

        --x ;

        while((char)(ReadAPixel(x,y)) != (char)(BoundaryColour))						// if new pixel is not the boundary colour
            WriteAPixel(x--, y, FillColour);    											// fill it and keep moving left along a horizontal line

        XLeft = x + 1 ;			// save X coord of the last filled pixel on this line when moving left
        x = SaveX ; 			// get original x coord for the seed back

		///////////////////////////////////////////////////////////////////////////////////////////////////
        // check that the scan line below is neither a polygon boundary nor
        // has been previously completely filled
        //////////////////////////////////////////////////////////////////////////////////////////////////

        SaveY = y ;			// save the current y coordinate of the line we have just drawn
        x = XLeft ;			// starting at the left x
        ++y ;				// move down one line

		// starting from the left keep moving right looking at the pixel
        // until we find something that is neither filled nor boundary colour as it represents something on the line that may be a pixel to fill

        do {
        	PixelColour = ReadAPixel(x++,y) ;
        } while(((char)(PixelColour) == (char)(BoundaryColour)) || ((char)(PixelColour) == (char)(FillColour)) );

         x-- ;

        // to get here we must have found something that needs filling i.e. the above loop found that the line below was not a complete boundary edge or filled
		// if we are still less than the previous right most X coord then it would be a new point that we need to seed
        while(x <= XRight)
        {
            // seed the scan line below
        	// if the pixel at x,y is not a boundary colour and less than extreme right

        	// skip over any pixels already filled
            while(((char)(ReadAPixel(x,y)) != (char)(BoundaryColour)) && (x <= XRight))
               ++x ;

            // push the  extreme right pixel onto the stack
            aPoint1.x = x - 1 ;
            aPoint1.y = y ;
            PushPixel(aPoint1) ;

            // continue checking in case the span is interrupted by another shape inside the one we are trying to fill

            ++x ;

            // skip over anything that is filled or boundary (i.e. other shape) inside the one we are trying to fill
            do {
            	PixelColour = ReadAPixel(x++,y) ;
            } while(((char)(PixelColour) == (char)(BoundaryColour)) || ((char)(PixelColour) == (char)(FillColour)) );

             x-- ;
        }
      	x = SaveX ;
       	y = SaveY ;

	 ///////////////////////////////////////////////////////////////////////////////////////////////////
    // check that the scan line above is neither a polygon boundary nor
    // has been previously completely filled

        y = SaveY;
        x = XLeft ;
        --y ;

        do {
        	PixelColour = ReadAPixel(x++,y) ;
        } while(((char)(PixelColour) == (char)(BoundaryColour)) || ((char)(PixelColour) == (char)(FillColour)) );

         x-- ;

        while(x <= XRight)		// if we have not reached the boundary
        {
            // seed the scan line below
            while(((char)(ReadAPixel(x,y)) != (char)(BoundaryColour)) && (x <= XRight))
               ++x ;		// look for right most x inside the boudan

            // push the  extreme right pixel onto the stack
            aPoint1.x = x - 1 ;
            aPoint1.y = y ;
            PushPixel(aPoint1) ;

            // continue checking in case the span is interrupted
            ++x ;

            do {
            	PixelColour = ReadAPixel(x++,y) ;
            } while(((char)(PixelColour) == (char)(BoundaryColour)) || ((char)(PixelColour) == (char)(FillColour)) );

             x-- ;
        }
       	x = SaveX ;
       	y = SaveY ;
    }
}
*/
void Graphics::SquareFill(unsigned int x, unsigned int y, unsigned int width, unsigned int height, unsigned int fillColor) {
	for (unsigned int row = y + 1; row < y + height; row++) {
		WriteAHorzLine(x + 1, x + width - 1, row, fillColor);
	}
}

/***************************************************************************
 * FUNCTIONS FOR DRAWING HIGHER ORDER SHAPES LIKE RECTANGLES AND CIRCLES
 ***************************************************************************/

/**
 * Clears the screen by fully writing black pixels.
 */
void Graphics::ClearScreen(){
	int i;
	for(i = 0; i < 479; i++){
		WriteAHorzLine(0, 799, i, WHITE);
	}
	funcButtons.clear();
}

/*
 * Function for drawing a rectangle to the screen.
 */
void Graphics::WriteRectangle(unsigned int x, unsigned int y, unsigned int height, unsigned int width, unsigned int borderColor){
	WriteAHorzLine(x, x + width, y, borderColor);                  // top line
	WriteAHorzLine(x, x + width, y + height, borderColor);         // bottom line
	WriteAVertLine(y + 1, y + height - 1, x, borderColor);         // left line
	WriteAVertLine(y + 1, y + height - 1, x + width, borderColor); // right line
}

/**
 * Function for drawing a circle to the screen.
 * Taken from https://en.wikipedia.org/wiki/Midpoint_circle_algorithm.
 */
void Graphics::WriteCircle(unsigned int x0, unsigned int y0, unsigned int radius, unsigned int colour){
    int x = radius - 1;
    int y = 0;
    int dx = 1;
    int dy = 1;
    int err = dx - (radius << 1);

    while (x >= y){
        WriteAPixel(x0 + x, y0 + y, colour);
        WriteAPixel(x0 + y, y0 + x, colour);
        WriteAPixel(x0 - y, y0 + x, colour);
        WriteAPixel(x0 - x, y0 + y, colour);
        WriteAPixel(x0 - x, y0 - y, colour);
        WriteAPixel(x0 - y, y0 - x, colour);
        WriteAPixel(x0 + y, y0 - x, colour);
        WriteAPixel(x0 + x, y0 - y, colour);

        if (err <= 0){
            y++;
            err += dy;
            dy += 2;
        }else{
            x--;
            dx += 2;
            err += dx - (radius << 1);
        }
    }
}

void Graphics::WriteAString(int x, int y, char str[], int color, int big){
	int i = 0;
	while(str[i] != '\0'){
		if(big){
			OutGraphicsCharFont2(x + (i * 11), y, color, BLACK, str[i], 0);
		} else {
			OutGraphicsCharFont1(x + (i * 10), y, color, BLACK, str[i], 0);
		}
		i++;
	}
}

/******************************************************************************************************************************
** This function draws a single ASCII character at the coord specified using the colour specified
** OutGraphicsCharFont2(100,100, RED, 'A', TRUE, FALSE, 1, 1) ;	// display upper case 'A' in RED at coords 100,100, erase background
** no scroll, scale x,y= 1,1
**
******************************************************************************************************************************/
void Graphics::OutGraphicsCharFont2(int x, int y, int colour, int backgroundcolour, int c, int Erase)
{
	register int 	row,
					column,
					theX = x,
					theY = y ;
	register int 	pixels ;
	register char 	theColour = colour  ;
	register int 	BitMask,
					theCharacter = c,
					j,
					theRow, theColumn;


    if(((short)(x) > (short)(XRES-1)) || ((short)(y) > (short)(YRES-1)))  // if start off edge of screen don't bother
        return ;

	if(((short)(theCharacter) >= (short)(' ')) && ((short)(theCharacter) <= (short)('~'))) {			// if printable character
		theCharacter -= 0x20 ;																			// subtract hex 20 to get index of first printable character (the space character)
		theRow = FONT2_YPIXELS;
		theColumn = FONT2_XPIXELS;

		for(row = 0; row < theRow ; row ++)	{
			pixels = Font10x14[theCharacter][row] ;		     								// get the pixels for row 0 of the character to be displayed
			BitMask = 512 ;							   											// set of hex 200 i.e. bit 7-0 = 0010 0000 0000
			for(column = 0; column < theColumn;   )  	{
				if((pixels & BitMask))														// if valid pixel, then write it
					WriteAPixel(theX+column, theY+row, theColour) ;
				else {																		// if not a valid pixel, do we erase or leave it along (no erase)
					if(Erase)
						WriteAPixel(theX+column, theY+row, backgroundcolour) ;
					// else leave it alone
				}
					column ++ ;
				BitMask = BitMask >> 1 ;
			}
		}
	}
}

void Graphics::OutGraphicsCharFont1(int x, int y, int fontcolour, int backgroundcolour, int c, int Erase)
{
// using register variables (as opposed to stack based ones) may make execution faster
// depends on compiler and CPU

	register int row, column, theX = x, theY = y ;
	register int pixels ;
	register char theColour = fontcolour  ;
	register int BitMask, theC = c ;

// if x,y coord off edge of screen don't bother

    if(((short)(x) > (short)(XRES-1)) || ((short)(y) > (short)(YRES-1)))
        return ;


// if printable character subtract hex 20
	if(((short)(theC) >= (short)(' ')) && ((short)(theC) <= (short)('~'))) {
		theC = theC - 0x20 ;
		for(row = 0; (char)(row) < (char)(7); row ++)	{

// get the bit pattern for row 0 of the character from the software font
			pixels = Font5x7[theC][row] ;
			BitMask = 16 ;

			for(column = 0; (char)(column) < (char)(5); column ++)	{

// if a pixel in the character display it
				if((pixels & BitMask))
					WriteAPixel(theX+column, theY+row, theColour) ;

				else {
					if(Erase)

// if pixel is part of background (not part of character)
// erase the background to value of variable BackGroundColour

						WriteAPixel(theX+column, theY+row, backgroundcolour) ;
				}
				BitMask = BitMask >> 1 ;
			}
		}
	}
}

/*
 * Displays title and three boxes with function header in each boxes
 */


void Graphics::Button(unsigned int x, unsigned int y,
					  unsigned int height, unsigned int width,
					  char text[], unsigned int textColor,
					  unsigned int borderColor, void (*func)(int, int, int, int)){

	int strlen = 0;
	while (text[strlen] != '\0') {
		strlen++;
	}

	WriteRectangle(x, y, height, width, borderColor);
	SquareFill(x , y, width, height, CYAN);
	WriteAString(x + width / 2 - strlen * 11 / 2, y + height / 2, text, textColor, 1);
	FuncButton b = {x, y, width, height, func};
	funcButtons.push_back(b);
}

void Graphics::CircleButton(unsigned int x, unsigned int y,
					  unsigned int radius, char text[], unsigned int textColor,
					  unsigned int borderColor, void (*func)(int, int, int, int)){

	int strlen = 0;
	while (text[strlen] != '\0') {
		strlen++;
	}

	WriteCircle(x, y, radius, borderColor);
	WriteAString(x - strlen * 11 / 2, y, text, textColor, 1);
	FuncButton b = {x - radius, y - radius, radius * 2, radius * 2, func};
	funcButtons.push_back(b);
}

void Graphics::FrontPanel (){
	//Display the title at the top center of display
	char title[] = "Quickshop";
	WriteAString(370,120,title,BLACK,10);

    if (purchaseAvail)
    {
        std::string purchaseMessage = "You just purchased: " 
                                    + currentPurchase;

        WriteAString(200, 200, (char*)purchaseMessage.c_str(), BLACK, 10);
        purchaseAvail = false;
    }
	//CircleButton(600, 300, 90, light, BLACK, BLACK, &doLight);
}

void Graphics::DoorPanel(){
	char door[] = {'D','o','o','r', ' ', 'C', 'o', 'n', 't', 'r', 'o', 'l', '\0'};
	DrawDoorOptions();
	//Display the title at the top center of display
	WriteAString(268, 120, door, BLACK, 20);

	char back[] = {'B', 'a', 'c', 'k', '\0'};
	CircleButton(125, 85, 50, back, BLACK, BLACK, &doBack);

	//PressLockUnlockEffect(int lock);	TODO TAKES IN IF USER PRESS LOCK OR NOT
}

void Graphics::DrawDoorOptions() {
	char lock[] = {'l','o','c','k','\0'};
	char unlock[] = {'u','n','l','o','c','k','\0'};
	Button(200, 180, 200, 200, unlock, BLACK, BLACK, &doCloseDoor);
	Button(400, 180, 200, 200, lock, BLACK, BLACK, &doOpenDoor);
}


void Graphics::DrawThemeOptions() {
	char theme[] = {'T','h','e','m','e','\0'};
	char study[] = {'s','t','u','d','y','\0'};
	char relax[] = {'r','e','l','a','x','\0'};
	char party[] = {'p','a','r','t','y','\0'};
	WriteAString(170, 250, theme, BLACK, 10);
	Button(250, 200, 100, 100, relax, BLACK, BLACK, &doLightRelax);
	Button(350, 200, 100, 100, study, BLACK, BLACK, &doLightStudy);
	Button(450, 200, 100, 100, party, BLACK, BLACK, &doLightParty);
}

void Graphics::DrawBrightnessOptions() {
	char brightness[] = {'B','r','i','g','h','t','n','e','s','s','\0'};
	char zeroNum[] = {'0','\0'};
	char fiftyNum[] = {'5','0','\0'};
	char hundredNum[] = {'1','0','0','\0'};
	WriteAString(110, 390, brightness, BLACK, 10);
	Button(250, 340, 100, 100, zeroNum, BLACK, BLACK, &doLightZero);
	Button(350, 340, 100, 100, fiftyNum, BLACK, BLACK, &doLightFifty);
	Button(450, 340, 100, 100, hundredNum, BLACK, BLACK, &doLightHundred);
}

void Graphics::LightPanel(){

	char light[] = {'L','i','g','h','t','\0'};
	WriteAString(370 ,120, light, BLACK, 20);

	DrawThemeOptions();
	DrawBrightnessOptions();

	//pressEffectLightPanel (1,2);	//TODO input user preference here
	char back[] = {'B', 'a', 'c', 'k', '\0'};
	CircleButton(125, 85, 50, back, BLACK, BLACK, &doBack);

}

std::vector<Graphics::FuncButton>& Graphics::getFuncButtons() {
	return funcButtons;
}
