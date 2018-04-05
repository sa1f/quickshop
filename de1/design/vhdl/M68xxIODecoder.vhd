LIBRARY ieee;
USE ieee.std_logic_1164.all;
use ieee.std_logic_arith.all; 
use ieee.std_logic_unsigned.all; 

entity M68xxIODecoder is
	Port (
		Address 				: in Std_logic_vector(15 downto 0) ;
		IOSelect_H 			: in Std_logic ;
		ByteSelect_L		: in Std_Logic ;
		WE_L					: in Std_Logic  ;
		
		RS232_Port_Enable 		 		: out std_logic;
		RS232_Baud_Enable 		 		: out std_logic;
		GPS_Port_Enable		 			: out std_logic;
		GPS_Baud_Enable 		 			: out std_logic;
		Bluetooth_Port_Enable		 	: out std_logic;
		Bluetooth_Baud_Enable		 	: out std_logic;
		TouchScreen_Port_Enable		 	: out std_logic;
		TouchScreen_Baud_Enable		 	: out std_logic
	);
end ;


architecture bhvr of M68xxIODecoder is
Begin
	process(Address, IOSelect_H, ByteSelect_L, WE_L)
	Begin
		
		-- default values for the IO chip enables (default = disabled)
		-- they are overridden below when necessary - default values for outputs avoids inferring latches in VHDL 
		-- so we must do it for all our outputs
		
		RS232_Port_Enable <= '0' ;
		RS232_Baud_Enable <= '0' ;
		
		GPS_Port_Enable <= '0' ;
		GPS_Baud_Enable <= '0' ;
		
		Bluetooth_Port_Enable <= '0' ;
		Bluetooth_Baud_Enable <= '0' ;
		
		TouchScreen_Port_Enable <= '0' ;
		TouchScreen_Baud_Enable <= '0' ;
		
-- IOSelect_H is driven logic 1 whenever the CPU outputs an address in the range A31:A0 = hex [8400_0000] to [8400_FFFF]
-- that is, IOSelect_H is drive logic for all addresses in range [8400_XXXX]. All we have to do for IO chip is decode the XXXX into 
-- a smaller  chip selects, i.e. A15:A0. All addresses for our chips should be even address as they are byte wide and connected to 
-- the upper half of the data bus (ByteSelect_L is asserted for an even byte transfer of D15-D8

-- decoder for the 1st 6850 chip (RS232 Port) - 2 registers at locations 0x8400 0200 and 0x8400 0202 so that they occupy
-- same half of data bus on D15-D8 and ByteSelect_L = 0
-- decoder for the Baud Rate generator at 00x8400_0204 on D15-D8 and ByteSelect_L = 0

		if(IOSelect_H = '1') then
			if((Address(15 downto 4) = X"020") and ByteSelect_L = '0') then		-- address = hex 0x8400_020X
			    if((Address(3 downto 0) = X"0") OR (Address(3 downto 0) = X"2")) then	-- address = hex 0x8400_0200 or 0202
					RS232_Port_Enable <= '1' ;					-- enable the serial ACIA device
				end if ;
				
				if(Address(3 downto 0) = X"4") then	-- enable baud rate generator at address = hex 8400_0204
					RS232_Baud_Enable <= '1' ;
				end if ;
			end if ;
		end if ;		
	
-- decoder for the 2nd 6850 chip (GPS)- 2 registers at locations 0x8400_0210 and 0x8400_0212 so that they occupy same half 
-- of data bus on D15-D8 and ByteSelect_L = 0
-- decoder for the Baud Rate generator at 0x8400_0214 on D15-D8 and ByteSelect_L = 0
	
		if(IOSelect_H = '1') then
			if((Address(15 downto 4) = X"021") and ByteSelect_L = '0') then		-- address = 0x8400_021X
			    if((Address(3 downto 0) = X"0") OR (Address(3 downto 0) = X"2")) then	-- address = 0x8400_0210 or 0212
					GPS_Port_Enable <= '1' ;					-- enable the serial ACIA device
				end if ;
				
				if(Address(3 downto 0) = X"4") then	-- enable baud rate generator at address = 0x8400_0214
					GPS_Baud_Enable <= '1' ;
				end if ;
			end if ;
		end if ;		

-- decoder for the 3rd 6850 chip (BlueTooth)- 2 registers at locations 0x8400_0220 and 0x8400_0222 so that they occupy 
-- same half of data bus on D15-D8 and ByteSelect_L = 0
-- decoder for the Baud Rate generator at 0x8400_0224 on D15-D8 and ByteSelect_L = 0
	
		if(IOSelect_H = '1') then
			if((Address(15 downto 4) = X"022") and ByteSelect_L = '0') then		-- address = 0x8400_022X
			    if((Address(3 downto 0) = X"0") OR (Address(3 downto 0) = X"2")) then	-- address = 0x8400_220 or 0222
					Bluetooth_Port_Enable <= '1' ;					-- enable the serial ACIA device
				end if ;
				
				if(Address(3 downto 0) = X"4") then	-- enable baud rate generator at address = hex 8400_0224
					Bluetooth_Baud_Enable <= '1' ;
				end if ;
			end if ;
		end if ;		
		
-- decoder for the 4th 6850 chip (Touch Screen)- 2 registers at locations 0x8400_0230 and 0x8400_0232 so that they occupy 
-- same half of data bus on D15-D8 and ByteSelect_L = 0
-- decoder for the Baud Rate generator at 0x8400_0234 on D15-D8 and ByteSelect_L = 0
	
		if(IOSelect_H = '1') then
			if((Address(15 downto 4) = X"023") and ByteSelect_L = '0') then		-- address = 0x8400_023X
			    if((Address(3 downto 0) = X"0") OR (Address(3 downto 0) = X"2")) then	-- address = 0x8400_0230 or 0232
					TouchScreen_Port_Enable <= '1' ;					-- enable the serial ACIA device
				end if ;
				
				if(Address(3 downto 0) = X"4") then	-- enable baud rate generator at address = 0x8400_0234
					TouchScreen_Baud_Enable <= '1' ;
				end if ;
			end if ;
		end if ;
	end process;
end ;
