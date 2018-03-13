
#include <stdlib.h>
#include <stdio.h>
#include <iostream>

#include "../include/memory_map.h"
#include "../include/touchscreen.h"
#include "../include/wifi.h"
#include "../include/graphics.h"
#include "../include/servo.h"
#include "../include/globals.h"
#include "../include/raspi.h"

Graphics graphics;
Servo servo(0x80002030);
Wifi wifi(0x84000220);
//GPS gps(0x84000210);
Raspi raspi(0x84000210);


bool purchaseAvail = false;
std::string currentPurchase = "0";

int main(void)
{
    TouchScreen touchScreen(0x84000230);
    graphics.FrontPanel();

    while(true) {
        raspi.updatePurchases();
        if (purchaseAvail)
            graphcis.FrontPanel();

    	touchScreen.GetPress();
    	TouchScreen::Point p = touchScreen.GetRelease();
    	std::vector<Graphics::FuncButton> buttons = graphics.getFuncButtons();
    	for(std::vector<Graphics::FuncButton>::iterator it = buttons.begin(); it != buttons.end(); ++it)
    		if (p.x >= it->x && p.x <= it->x + it->width &&
    			p.y >= it->y && p.y <= it->y + it->height) {
    			it->funcPtr(it->x, it->y, it->width, it->height);
    			break;
    	}
    }
    return 0;
}
