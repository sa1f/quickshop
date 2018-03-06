/****
Created by Benjamin Lang
09/02/2018
**
*/

`default_nettype none
module PWM_controller 
(
    input wire          clk_in,
    input wire          rst_in,
    input wire [7:0]    pwm_ctrl0,    
    input wire [7:0]    pwm_ctrl1,
    input wire [7:0]    pwm_ctrl2,
    output wire         pwm_out0,
    output wire         pwm_out1,
    output wire         pwm_out2
);

localparam PWM_COUNT = 3;

wire         pwm_clk         [PWM_COUNT-1:0];
reg [31:0]   pwm_counter     [PWM_COUNT-1:0];
reg          pwm_value       [PWM_COUNT-1:0];
wire [7:0]   pwm_ctrl_val     [PWM_COUNT-1:0];
reg [31:0]   pwm_threshhold [PWM_COUNT-1:0];

assign pwm_ctrl_val[0] = pwm_ctrl0;
assign pwm_ctrl_val[1] = pwm_ctrl1;
assign pwm_ctrl_val[2] = pwm_ctrl2;

assign pwm_out0 = pwm_value[0];
assign pwm_out1 = pwm_value[1];
assign pwm_out2 = pwm_value[2];

pwm_pll u_pwm_pll(
    .clk_in_clk     (clk_in),
    .pwm_clk0_clk   (pwm_clk[0]),
    .pwm_clk1_clk   (pwm_clk[1]),
    .pwm_clk2_clk   (pwm_clk[2]),
    .rst_in_reset   (rst_in)
);

genvar i;
generate
    for (i = 0; i < PWM_COUNT; i=i+1) begin : PWM_CTRL

        always @(posedge clk_in or negedge rst_in) begin
            case (pwm_ctrl_val[i])
                // 9 states of servo control
                8: pwm_threshhold[i] <= 100000;
                7: pwm_threshhold[i] <= 88888;
                6: pwm_threshhold[i] <= 80000;
                5: pwm_threshhold[i] <= 72727;
                4: pwm_threshhold[i] <= 66666;
                3: pwm_threshhold[i] <= 61538;
                2: pwm_threshhold[i] <= 57143;
                1: pwm_threshhold[i] <= 53333;
                0: pwm_threshhold[i] <= 50000;
                default: pwm_threshhold[i] <= 50000;
            endcase
        end
        
        always @(posedge clk_in or negedge rst_in) begin
            if (~rst_in) begin
                pwm_counter[i] <= 0;
            end
            else begin
                if (pwm_counter[i] == 1000000)
                    pwm_counter[i] <= 0;
                else 
                    pwm_counter[i] <= pwm_counter[i] + 1;
            end
        end

        always @(posedge clk_in or negedge rst_in) begin
            if (~rst_in) begin
                pwm_value[i] <= 1;
            end
            else begin
                if (pwm_counter[i] <= pwm_threshhold[i]) 
                    pwm_value[i] <= 1;
                else 
                    pwm_value[i] <= 0;
            end
        end
    end
endgenerate

endmodule // PWM_controller
`default_nettype wire