-- Implements a simple Nios II system for the DE-series board.
-- Inputs: SW7-0 are parallel port inputs to the Nios II system
-- CLOCK_50 is the system clock
-- KEY0 is the active-low system reset
-- Outputs: LEDR9-0 are parallel port outputs from the Nios II system

LIBRARY ieee;
USE ieee.std_logic_1164.ALL;
USE ieee.std_logic_unsigned.ALL;

ENTITY NIOS_II_SYSTEM IS
	PORT (
		-- clock and Reset Button
		CLOCK_50 		: IN STD_LOGIC;
		KEY 				: IN STD_LOGIC_VECTOR (0 DOWNTO 0);
		
		-- RED LEDs and Switches
		SW 				: IN STD_LOGIC_VECTOR (9 DOWNTO 0);
		LEDR 				: OUT STD_LOGIC_VECTOR (9 DOWNTO 0);

		-- DRam Signals
		DRAM_ADDR						: OUT STD_LOGIC_VECTOR (12 DOWNTO 0);
		DRAM_CLK,DRAM_CKE				: OUT STD_LOGIC;
		DRAM_BA 							: BUFFER STD_LOGIC_VECTOR(1 downto 0);
		DRAM_CS_N, DRAM_CAS_N 		: OUT STD_LOGIC;
		DRAM_RAS_N, DRAM_WE_N		: OUT STD_LOGIC;
		DRAM_DQ 							: INOUT STD_LOGIC_VECTOR(15 DOWNTO 0);
		DRAM_UDQM, DRAM_LDQM 		: BUFFER STD_LOGIC;
		
		-- IO Bridge
		
		IO_acknowledge : in    std_logic;                                  		  -- acknowledge
		IO_irq         : in    std_logic;                                 		  -- irq
		IO_address     : out   std_logic_vector(15 downto 0);                     -- address
		IO_bus_enable  : out   std_logic;                                        -- bus_enable
		IO_byte_enable : out   std_logic_vector(1 downto 0);                     -- byte_enable
		IO_rw          : out   std_logic;                                        -- rw
		IO_write_data  : out   std_logic_vector(15 downto 0);                    -- write_data
		IO_read_data   : in    std_logic_vector(15 downto 0);							  -- read_dat	
		
		
		lcd_RS         : out   std_logic;                                        -- RS
      lcd_RW         : out   std_logic;                                        -- RW
      lcd_data       : inout std_logic_vector(7 downto 0)  := (others => 'X'); -- data
      lcd_EN          : out   std_logic;                                        -- E
		lcd_ON         : out   std_logic;                                        -- ON
      lcd_BLON       : out   std_logic;   												 -- Backlight ON

			
		-- 3 push buttons
		Push_Buttons   : in    std_logic_vector(2 downto 0)  := (others => 'X');  -- export
		
		-- Hex Display
		Hex0_1			: out   std_logic_vector(7 downto 0) ;
		Hex2_3			: out   std_logic_vector(7 downto 0) ;
		Hex4_5			: out   std_logic_vector(7 downto 0) 
	);
END NIOS_II_SYSTEM;

ARCHITECTURE NIOS_II_SYSTEM_rtl OF NIOS_II_SYSTEM IS
	-- declaration of the NIOS II SoC component
	COMPONENT nios_system
	PORT (
		clk_clk						: IN STD_LOGIC;
		reset_reset_n 				: IN STD_LOGIC;
		switches_export 			: IN STD_LOGIC_VECTOR (9 DOWNTO 0);
		leds_export 				: OUT STD_LOGIC_VECTOR (9 DOWNTO 0);
		
		sdram_addr        		: out   std_logic_vector(12 downto 0);                    -- addr
		sdram_ba          		: out   std_logic_vector(1 downto 0);                     -- ba
		sdram_cas_n       		: out   std_logic;                                        -- cas_n
		sdram_cke         		: out   std_logic;                                        -- cke
		sdram_cs_n        		: out   std_logic;                                        -- cs_n
		sdram_dq          		: inout std_logic_vector(15 downto 0) := (others => 'X'); -- dq
		sdram_dqm        			: out   std_logic_vector(1 downto 0);                     -- dqm
		sdram_ras_n      			: out   std_logic;                                        -- ras_n
		sdram_we_n       			: out   std_logic;                                        -- we_n
		sdram_clk_clk    			: out   std_logic;													 	 -- skew corrected clock for sdram

		
		-- Bridge Signals
		io_acknowledge         : in    std_logic                     := 'X';             -- acknowledge
		io_irq                 : in    std_logic                     := 'X';             -- irq
		io_address             : out   std_logic_vector(15 downto 0);                    -- address
		io_bus_enable          : out   std_logic;                                        -- bus_enable
		io_byte_enable         : out   std_logic_vector(1 downto 0);                     -- byte_enable
		io_rw                  : out   std_logic;                                        -- rw
		io_write_data          : out   std_logic_vector(15 downto 0);                    -- write_data
		io_read_data           : in    std_logic_vector(15 downto 0) := (others => 'X'); -- read_data
		
		lcd_data_RS         : out   std_logic;                                        -- RS
      lcd_data_RW         : out   std_logic;                                        -- RW
      lcd_data_DATA       : inout std_logic_vector(7 downto 0)  := (others => 'X'); -- data
      lcd_data_EN         : out   std_logic;                                        -- E
		lcd_data_ON         : out   std_logic;                                        -- ON
      lcd_data_BLON       : out   std_logic;   		 										   -- Backlight ON



		-- Push button signals
		push_buttons_export 	  : in    std_logic_vector(2 downto 0)  := (others => 'X'); -- export

		-- Hex display signals
		hex0_1_export          : out   std_logic_vector(7 downto 0);                     -- export
		hex2_3_export          : out   std_logic_vector(7 downto 0);                     -- export
		hex4_5_export          : out   std_logic_vector(7 downto 0)                    	-- export
	);
	END COMPONENT;
	
	SIGNAL DQM 	: STD_LOGIC_VECTOR(1 DOWNTO 0);
	SIGNAL BA 	: STD_LOGIC_VECTOR(1 DOWNTO 0);

BEGIN
	DRAM_BA(0) <= BA(0);
	DRAM_BA(1) <= BA(1);
	DRAM_UDQM <= DQM(1);
	DRAM_LDQM <= DQM(0);
	
	NiosII: nios_system		-- create NIOSII as an instance of nios_system
	PORT MAP(
		clk_clk 					=> CLOCK_50,
		reset_reset_n 			=> KEY(0),
		switches_export 		=> SW(9 DOWNTO 0),
		leds_export 			=> LEDR(9 DOWNTO 0),
		
		sdram_addr 				=> DRAM_ADDR,
		sdram_ba 				=> BA,
		sdram_cas_n 			=> DRAM_CAS_N,
		sdram_cke 				=> DRAM_CKE,
		sdram_cs_n 				=> DRAM_CS_N,
		sdram_dq 				=> DRAM_DQ,
		sdram_dqm 				=> DQM,
		sdram_ras_n 			=> DRAM_RAS_N,
		sdram_we_n 				=> DRAM_WE_N,
		sdram_clk_clk 			=> DRAM_CLK,
		
		io_acknowledge 		=> IO_acknowledge,
		io_irq 					=> IO_irq,
		io_address 				=> IO_address,
		io_bus_enable 			=> IO_bus_enable,
		io_byte_enable 		=> IO_byte_enable,
		io_rw 					=> IO_rw,
		io_write_data 			=> IO_write_data,
		io_read_data 			=> IO_read_data,
		
		lcd_data_RS => lcd_RS,
      lcd_data_RW => lcd_RW,
      lcd_data_DATA => lcd_data,
      lcd_data_EN => lcd_EN,
		lcd_data_ON => lcd_ON,
      lcd_data_BLON => lcd_BLON,
		
		push_buttons_export 	=> Push_Buttons,
		
		hex0_1_export 			=> Hex0_1,
		hex2_3_export 			=> Hex2_3,
		hex4_5_export 			=> Hex4_5
	);
END NIOS_II_SYSTEM_rtl;