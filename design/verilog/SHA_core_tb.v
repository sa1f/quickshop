module SHA_core_tb();

reg clk;
reg rst;
reg [31:0] din;
reg [31:0] addr;
wire [31:0] dout;
wire [31:0] status;

SHA256_core DUT (
    .clk_in (clk),
    .rst_in (rst),
    .d_in 	(din),   
    .a_in 	(addr),   
    .d_out 	(dout),
    .status (status)
);

initial begin
	clk = 0; #200;
	forever begin
		clk = ~clk; #5;
	end
end

initial begin
	// set initial conditio
	rst = 1;
	din = 32'b0;
	addr = 32'b0;
	#250;
	
	// trigger active low reset
	rst = 0; #200;
	rst = 1; #200;

	addr = 32'h20000000; #20;
	addr = 32'h40000000; #20;

	addr = 32'h0; #20;
	din  = 32'h61626380; #20;

	addr = 32'h1; #20;
	din  = 32'h00000000; #20;

	addr = 32'h2; #20;
	din  = 32'h0; #20;

	addr = 32'h3; #20;
	din  = 32'h0; #20; 

	addr = 32'h4; #20;
	din  = 32'h0; #20; 

	addr = 32'h5; #20;
	din  = 32'h0; #20; 

	addr = 32'h6; #20;
	din  = 32'h0; #20; 

	addr = 32'h7; #20;
	din  = 32'h0; #20; 

	addr = 32'h8; #20;
	din  = 32'h0; #20; 

	addr = 32'h9; #20;
	din  = 32'h0; #20; 

	addr = 32'hA; #20;
	din  = 32'h0; #20;

	addr = 32'hB; #20;
	din  = 32'h0; #20;

	addr = 32'hC; #20;
	din  = 32'h0; #20;

	addr = 32'hD; #20;
	din  = 32'h0; #20;

	addr = 32'hE; #20;
	din  = 32'h0; #20;

	addr = 32'hF; #20;
	din  = 32'h00000018; #20;

	addr = 32'h80000000;
	#5000;
	$finish();


end

endmodule