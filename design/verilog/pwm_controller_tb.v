
module pwm_controller_tb ();

reg clk;
reg rst;
reg [7:0] val;
wire outClk;

pwm_controller DUT(
	.rst_in (rst),
	.pwm_ctrl0 (val),
	.pwm_out0 (outClk)
);

initial begin
	force DUT.pwm_clk[0] = 0; #200ns;
	forever begin
		force DUT.pwm_clk[0] = ~DUT.pwm_clk[0]; #5ns;
	end
end

initial begin
	val = 2;
	rst = 1; # 100ns;
	rst = 0;
end
endmodule