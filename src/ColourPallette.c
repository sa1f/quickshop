/*
 * ColourPalletteData.c
 *
 *  Created on0xApr 12, 2015
 *      Author0xPaul
 */

// see --http://www.rapidtables.com/web/color/RGB_Color.htm for example colours
//
// Constants for each pallette number using the name for the colour can be found in the header file "Colours.h"
//
// this data represents the 24 bit RGB values of 256 colours. DE2 can display all 256 simultaneously, but DE1 can only display 64 at any one time.
// It should be setup in hardware in a ROM file in Quartus
// but the software ('C' code) version of the data is also given below and can be used as a reference to the original data in graphics chip ROM
//
// You should program the colour pallette (DE2 = 256, DE1 = 64) at the start, i.e in main() by calling ProgramPallette(BLACK, ColourPalletteData[0])
// for each colour and programming the colour(s) you want, 1 RGB value per pallette. BLACK is enumerated as 0 in Colours.h header file
//
// You should include this as part of the project so it gets compiled, but if you want to reference it in multiple source file
// you should put an "extern" declaration in those source files e.g. extern const unsigned int ColourPalletteData[256]

const unsigned int ColourPalletteData[256] = {
0x00000000, // Black
0x00daf5ff, // White
0x00FF0000, // Red
0x0000FF00, // Green/Lime
0x0044ffd2, // Blue
0x00FFFF00, // Yellow
0x0087f6ff, // Cyan
0x00FF00FF, // Magenta
0x00C0C0C0, // Silver
0x00808080, // Gray
0x00800000, // Maroon
0x00808000, // Olive
0x00008000, // DarkGreen
0x00800080, // Purple
0x00008080, // Teal
0x00000080, // Navy
0x008B0000, // Dark Red
0x00A52A2A, // Brown
0x00B22222, // FireBrick
0x00DC143C, // Crimson
0x00FF6347, // Tomato
0x00FF7F50, // Coral
0x00Cd5C5C, // Indian Red
0x00F08080, // Light Coral
0x00E9967A, // Dark Salmon
0x00FA8072, // Salmon
0x00FFA07A, // Light Salmon
0x00FF4500, // Orange Red
0x00FF8C00, // Dark Orange
0x00FFA500, // Orange
0x00FFD700, // Gold
0x00B8860B, // Dark Golden Rod
0x00DAA520, // Golden Rod
0x00EEE8AA, // Pale Golden Rod
0x00BDB76B, // Dark Kharki
0x00F0E68C, // Khaki
0x00808000, // Olive
0x00FFFF00, // Yellow
0x009ACD32, // Yellow Green
0x00556B2F, // Dark Olive Green
0x006B8E23, // Olive Drab
0x007CFC00, // Lawn Green
0x007FFF00, // Chart Reuse
0x00ADFF2F, // Green Yellow
0x00006400, // Dark Green
0x00008000, // Green
0x00228B22, // Forest Green
0x0000FF00, // Green/Lime
0x0032CD32, // Lime Green
0x0090EE90, // Light Green
0x0098FB98, // Pale Green
0x008FBC8F, // Dark See Green
0x0000FA9A, // Medium Spring Green
0x0000FF7F, // Spring Green
0x002E8B57, // Sea Green
0x0066CDAA, // Medium Aqua Marine
0x003CB371, // Medium Sea Green
0x0020B2AA, // Light Sea Green
0x002F4F4F, // Dark Slate Gray
0x00008080, // Teal
0x00008B8B, // Dark Cyan
0x0000FFFF, // Aqua/Cyan
0x00E0FFFF, // Light Cyan
0x0000CED1, // Dark Turquise
0x0040E0D0, // Turquoise
0x0048D1CC, // Medium Turquoise
0x00AFEEEE, // Pale Turquoise
0x007FFFD4, // Aqua Marine
0x00B0E0E6, // Powder Blue
0x005F9EA0, // Cadet Blue
0x004682B4, // Steel Blue
0x006495ED, // Corn Flower Blue
0x0000BFFF, // Deep Sky Blue
0x001E90FF, // Dodger Blue
0x00ADD8E6, // Light Blue
0x0087CEEB, // Sky Blue
0x0087CEFA, // Light Sky Blue
0x00191970, // Midnight Blue
0x00000080, // Navy
0x0000008B, // Bark Blue
0x000000CD, // Medium Blue
0x000000FF, // Blue
0x004169E1, // Royal Blue
0x008A2BE2, // Blue Violet
0x004B0082, // Indigo
0x00483D8B, // Dark Slate Blue
0x006A5ACD, // Slate Blue
0x007B68EE, // Medium Slate Blue
0x009370DB, // Medium Purple
0x008B008B, // Dark Magenta
0x009400D3, // Dark Violet
0x009932CC, // Dark Orchid"
0x00BA55D3, // Medium Orchid
0x00800080, // Purple
0x00D8BFD8, // Thistle
0x00DDA0DD, // Plum
0x00EE82EE, // Violet
0x00FF00FF, // Magenta/Fuchia
0x00DA70D6, // Orchid
0x00C71585, // Medium Violet Red
0x00DB7093, // Pale Violet Red
0x00FF1493, // Deep Pink
0x00FF69B4, // Hot Pink
0x00ffB6C1, // Light Pink
0x00FFC0CB, // Pink
0x00FAEBD7, // Antique White
0x00F5F5DC, // Beige
0x00FFE4C4, // Bisque
0x00FFEBCD, // Blanched Almond
0x00F5DEB3, // Wheat
0x00FFF8DC, // Corn Silk
0x00FFFACD, // Lemon Chiffon
0x00FAFAD2, // Light Golden Rod Yellow
0x00FFFFE0, // Light Yellow
0x008B4513, // Saddle Brown
0x00A0522D, // Sienna
0x00D2691E, // Chocolate
0x00CD853F, // Peru
0x00F4A460, // Sandy Brown
0x00DEB887, // Burley Wood
0x00D2B48C, // Tan
0x00BC8F8F, // Rosy Tan
0x00FFE4B5, // Moccasin
0x00FFDEAD, // Navajo White
0x00FFDAB9, // Peach Puff
0x00FFE4E1, // Misty Rose
0x00FFF0F5, // Lavendar Blush
0x00FAF0E6, // Linen
0x00FDF5E6, // Old Lace
0x00FFEFD5, // Papaya Whip
0x00FFF5EE, // Sea Shell
0x00F5FFFA, // Mint Cream
0x00708090, // Slate Gray
0x00778899, // Light Slate Gray
0x00B0C4DE, // Light Steel Blue
0x00E6E6FA, // Lavender
0x00FFFAF0, // Floral White
0x00F0F8FF, // Alice Blue
0x00F8F8FF, // Ghost White
0x00F0FFF0, // Honey Dew
0x00FFFFF0, // Ivory
0x00F0FFFF, // Azure
0x00FFFAFA, // Snow
0x00000000, // Black
0x00696969, // Dim Gray
0x00808080, // Gray
0x00A9A9A9, // Dark Gray
0x00D3D3D3, // Light Gray
0x00DCDCDC, // GainsBoro
0x00F5F5F5, // White Smoke
0x00FFFFFF, // White

// Repeating colour - change these if you like
0x00000000, // Black
0x00FFFFFF, // White
0x00FF0000, // Red
0x0000FF00, // Green/Lime
0x000000FF, // Blue
0x00FFFF00, // Yellow
0x0000FFFF, // Cyan
0x00FF00FF, // Magenta
0x00C0C0C0, // Silver
0x00808080, // Gray
0x00800000, // Maroon
0x00808000, // Olive
0x00008000, // DarkGreen
0x00800080, // Purple
0x00008080, // Teal
0x00000080, // Navy
0x008B0000, // Dark Red
0x00A52A2A, // Brown
0x00B22222, // FireBrick
0x00DC143C, // Crimson
0x00FF6347, // Tomato
0x00FF7F50, // Coral
0x00Cd5C5C, // Indian Red
0x00F08080, // Light Coral
0x00E9967A, // Dark Salmon
0x00FA8072, // Salmon
0x00FFA07A, // Light Salmon
0x00FF4500, // Orange Red
0x00FF8C00, // Dark Orange
0x00FFA500, // Orange
0x00FFD700, // Gold
0x00B8860B, // Dark Golden Rod
0x00DAA520, // Golden Rod
0x00EEE8AA, // Pale Golden Rod
0x00BDB76B, // Dark Kharki
0x00F0E68C, // Khaki
0x00808000, // Olive
0x00FFFF00, // Yellow
0x009ACD32, // Yellow Green
0x00556B2F, // Dark Olive Green
0x006B8E23, // Olive Drab
0x007CFC00, // Lawn Green
0x007FFF00, // Chart Reuse
0x00ADFF2F, // Green Yellow
0x00006400, // Dark Green
0x00008000, // Green
0x00228B22, // Forest Green
0x0000FF00, // Green/Lime
0x0032CD32, // Lime Green
0x0090EE90, // Light Green
0x0098FB98, // Pale Green
0x008FBC8F, // Dark See Green
0x0000FA9A, // Medium Spring Green
0x0000FF7F, // Spring Green
0x002E8B57, // Sea Green
0x0066CDAA, // Medium Aqua Marine
0x003CB371, // Medium Sea Green
0x0020B2AA, // Light Sea Green
0x002F4F4F, // Dark Slate Gray
0x00008080, // Teal
0x00008B8B, // Dark Cyan
0x0000FFFF, // Aqua/Cyan
0x00E0FFFF, // Light Cyan
0x0000CED1, // Dark Turquise
0x0040E0D0, // Turquoise
0x0048D1CC, // Medium Turquoise
0x00AFEEEE, // Pale Turquoise
0x007FFFD4, // Aqua Marine
0x00B0E0E6, // Powder Blue
0x005F9EA0, // Cadet Blue
0x004682B4, // Steel Blue
0x006495ED, // Corn Flower Blue
0x0000BFFF, // Deep Sky Blue
0x001E90FF, // Dodger Blue
0x00ADD8E6, // Light Blue
0x0087CEEB, // Sky Blue
0x0087CEFA, // Light Sky Blue
0x00191970, // Midnight Blue
0x00000080, // Navy
0x0000008B, // Bark Blue
0x000000CD, // Medium Blue
0x000000FF, // Blue
0x004169E1, // Royal Blue
0x008A2BE2, // Blue Violet
0x004B0082, // Indigo
0x00483D8B, // Dark Slate Blue
0x006A5ACD, // Slate Blue
0x007B68EE, // Medium Slate Blue
0x009370DB, // Medium Purple
0x008B008B, // Dark Magenta
0x009400D3, // Dark Violet
0x009932CC, // Dark Orchid
0x00BA55D3, // Medium Orchid
0x00800080, // Purple
0x00D8BFD8, // Thistle
0x00DDA0DD, // Plum
0x00EE82EE, // Violet
0x00FF00FF, // Magenta/Fuchia
0x00DA70D6, // Orchid
0x00C71585, // Medium Violet Red
0x00DB7093, // Pale Violet Red
0x00FF1493, // Deep Pink
0x00FF69B4, // Hot Pink
0x00ffB6C1, // Light Pink
0x00FFC0CB // Pink
};
