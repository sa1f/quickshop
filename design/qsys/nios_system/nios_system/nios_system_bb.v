
module nios_system (
	clk_clk,
	hex0_1_export,
	hex2_3_export,
	hex4_5_export,
	io_acknowledge,
	io_irq,
	io_address,
	io_bus_enable,
	io_byte_enable,
	io_rw,
	io_write_data,
	io_read_data,
	lcd_data_DATA,
	lcd_data_ON,
	lcd_data_BLON,
	lcd_data_EN,
	lcd_data_RS,
	lcd_data_RW,
	leds_export,
	push_buttons_export,
	reset_reset_n,
	sdram_addr,
	sdram_ba,
	sdram_cas_n,
	sdram_cke,
	sdram_cs_n,
	sdram_dq,
	sdram_dqm,
	sdram_ras_n,
	sdram_we_n,
	sdram_clk_clk,
	switches_export,
	sha_dout_export,
	sha_addr_export,
	sha_din_export,
	sha_status_export);	

	input		clk_clk;
	output	[7:0]	hex0_1_export;
	output	[7:0]	hex2_3_export;
	output	[7:0]	hex4_5_export;
	input		io_acknowledge;
	input		io_irq;
	output	[15:0]	io_address;
	output		io_bus_enable;
	output	[1:0]	io_byte_enable;
	output		io_rw;
	output	[15:0]	io_write_data;
	input	[15:0]	io_read_data;
	inout	[7:0]	lcd_data_DATA;
	output		lcd_data_ON;
	output		lcd_data_BLON;
	output		lcd_data_EN;
	output		lcd_data_RS;
	output		lcd_data_RW;
	output	[9:0]	leds_export;
	input	[2:0]	push_buttons_export;
	input		reset_reset_n;
	output	[12:0]	sdram_addr;
	output	[1:0]	sdram_ba;
	output		sdram_cas_n;
	output		sdram_cke;
	output		sdram_cs_n;
	inout	[15:0]	sdram_dq;
	output	[1:0]	sdram_dqm;
	output		sdram_ras_n;
	output		sdram_we_n;
	output		sdram_clk_clk;
	input	[9:0]	switches_export;
	output	[31:0]	sha_dout_export;
	output	[31:0]	sha_addr_export;
	input	[31:0]	sha_din_export;
	input	[31:0]	sha_status_export;
endmodule
