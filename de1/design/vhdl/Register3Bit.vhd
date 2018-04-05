LIBRARY ieee;
USE ieee.std_logic_1164.all;
use ieee.std_logic_arith.all; 
use ieee.std_logic_unsigned.all; 
 
----------------------------------------------------------------------------------------------
-- 3 bit register: On rising edge of clock store 3 bit data on DataIn bus to Q output
-- On reset clear all 3 bits
---------------------------------------------------------------------------------------------
entity Register3Bit is
	Port (
		DataIn 		: in Std_logic_vector(2 downto 0) ;
		Enable		: in Std_logic ;
		Clk 			: in Std_logic ;
		Reset 		: in Std_logic ;
  
		Q 				: out Std_Logic_vector(2 downto 0)
 );
end ;
 
architecture bhvr of Register3Bit is
Begin
	process(Clk, RESET)
	Begin
		if(Reset = '0') then
			Q <= "000" ;
		elsif(rising_edge(Clk)) then
			if(Enable = '1') then
				Q <= DataIn(2 downto 0) ;
			end if ;
		end if ;
	end process ;
end ;
