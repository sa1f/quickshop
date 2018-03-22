/****
Created by Benjamin Lang
09/02/2018
**
*/

`default_nettype none
module SHA256_core 
(
    input wire          clk_in,
    input wire          rst_in,
    input wire  [31:0]  d_in,   // 0x00000000
    input wire  [31:0]  a_in,   // 
    output reg [31:0]   d_out,
    output reg [31:0]   status
);

localparam H0 = 32'h6a09e667;
localparam H1 = 32'hbb67ae85;
localparam H2 = 32'h3c6ef372;
localparam H3 = 32'ha54ff53a;
localparam H4 = 32'h510e527f;
localparam H5 = 32'h9b05688c;
localparam H6 = 32'h1f83d9ab;
localparam H7 = 32'h5be0cd19;

localparam WAIT     = 0;
localparam IDLE     = 1;
localparam READ     = 2;
localparam PREPARE  = 3;
localparam CALC1    = 4;
localparam CALC2    = 5;
localparam COMPLETE = 6;
localparam WRITE    = 7;


reg [7:0]  state;
reg [31:0] hash  [7:0];
reg [31:0] schedule [63:0];
reg [31:0] tempWords [1:0];
reg [31:0] rxCount;
reg [31:0] index;

reg [31:0] a;
reg [31:0] b;
reg [31:0] c;
reg [31:0] d;
reg [31:0] e;
reg [31:0] f;
reg [31:0] g;
reg [31:0] h;

reg [31:0] hashConstants [63:0];

initial begin
    // init hash constants
    hashConstants[0] = 32'h428a2f98; hashConstants[1] = 32'h71374491; hashConstants[2] = 32'hb5c0fbcf; hashConstants[3] = 32'he9b5dba5; hashConstants[4] = 32'h3956c25b; hashConstants[5] = 32'h59f111f1; hashConstants[6] = 32'h923f82a4; hashConstants[7] = 32'hab1c5ed5; 
    hashConstants[8] = 32'hd807aa98; hashConstants[9] = 32'h12835b01; hashConstants[10] = 32'h243185be; hashConstants[11] = 32'h550c7dc3; hashConstants[12] = 32'h72be5d74; hashConstants[13] = 32'h80deb1fe; hashConstants[14] = 32'h9bdc06a7; hashConstants[15] = 32'hc19bf174; 
    hashConstants[16] = 32'he49b69c1; hashConstants[17] = 32'hefbe4786; hashConstants[18] = 32'h0fc19dc6; hashConstants[19] = 32'h240ca1cc; hashConstants[20] = 32'h2de92c6f; hashConstants[21] = 32'h4a7484aa; hashConstants[22] = 32'h5cb0a9dc; hashConstants[23] = 32'h76f988da; 
    hashConstants[24] = 32'h983e5152; hashConstants[25] = 32'ha831c66d; hashConstants[26] = 32'hb00327c8; hashConstants[27] = 32'hbf597fc7; hashConstants[28] = 32'hc6e00bf3; hashConstants[29] = 32'hd5a79147; hashConstants[30] = 32'h06ca6351; hashConstants[31] = 32'h14292967; 
    hashConstants[32] = 32'h27b70a85; hashConstants[33] = 32'h2e1b2138; hashConstants[34] = 32'h4d2c6dfc; hashConstants[35] = 32'h53380d13; hashConstants[36] = 32'h650a7354; hashConstants[37] = 32'h766a0abb; hashConstants[38] = 32'h81c2c92e; hashConstants[39] = 32'h92722c85; 
    hashConstants[40] = 32'ha2bfe8a1; hashConstants[41] = 32'ha81a664b; hashConstants[42] = 32'hc24b8b70; hashConstants[43] = 32'hc76c51a3; hashConstants[44] = 32'hd192e819; hashConstants[45] = 32'hd6990624; hashConstants[46] = 32'hf40e3585; hashConstants[47] = 32'h106aa070; 
    hashConstants[48] = 32'h19a4c116; hashConstants[49] = 32'h1e376c08; hashConstants[50] = 32'h2748774c; hashConstants[51] = 32'h34b0bcb5; hashConstants[52] = 32'h391c0cb3; hashConstants[53] = 32'h4ed8aa4a; hashConstants[54] = 32'h5b9cca4f; hashConstants[55] = 32'h682e6ff3; 
    hashConstants[56] = 32'h748f82ee; hashConstants[57] = 32'h78a5636f; hashConstants[58] = 32'h84c87814; hashConstants[59] = 32'h8cc70208; hashConstants[60] = 32'h90befffa; hashConstants[61] = 32'ha4506ceb; hashConstants[62] = 32'hbef9a3f7; hashConstants[63] = 32'hc67178f2;
end

always @(posedge clk_in or negedge rst_in) begin
    if (~rst_in) begin
        state <= WAIT;
        status <= 32'b0;
    end

    else begin
        case (state)
            WAIT: begin
                if (a_in[31:29] == 3'b001) begin
                    state <= IDLE;
                end
                hash[0] <= H0;
                hash[1] <= H1;
                hash[2] <= H2;
                hash[3] <= H3;
                hash[4] <= H4;
                hash[5] <= H5;
                hash[6] <= H6;
                hash[7] <= H7;
            end

            IDLE: begin
                // init READ sequence from CPU
                if (a_in[31:29] == 3'b010) begin
                    state <= READ;
                    status <= 32'b0;
                end
                
                // write hash values to CPU
                else if (a_in[31:29] == 3'b011) begin
                    state <= WRITE;
                end

                // wipe hash and restart
                else if (a_in[31:29] == 3'b111) begin
                    state <= WAIT;
                end
                rxCount <= 0;
            end

            READ: begin
                if (a_in[31:29] == 3'b100) begin
                    state <= PREPARE;
                    index <= 16;
                end
                else begin
                    schedule[a_in[5:0]] <= d_in;
                end
            end

            PREPARE: begin
                if (index >= 64) begin
                    a <= hash[0];
                    b <= hash[1];
                    c <= hash[2];
                    d <= hash[3];
                    e <= hash[4];
                    f <= hash[5];
                    g <= hash[6];
                    h <= hash[7];
                    index = 0;
                    state <= CALC1;
                end
                else begin
                    schedule[index] <=  ((schedule[index-2] >> 17) | (schedule[index-2] << (32-17))) +
                                        ((schedule[index-2] >> 19) | (schedule[index-2] << (32-19))) +
                                        (schedule[index-2] >> 10) + schedule[index-7] +

                                        ((schedule[index-15] >> 7) | (schedule[index-15] << (32-7))) +
                                        ((schedule[index-15] >> 18) | (schedule[index-15] << (32-18))) +
                                        (schedule[index-15] >> 3) + schedule[index-16];
                    index <= index + 1;
                end
            end

            CALC1: begin
                if (index >= 64) begin
                    state <= COMPLETE;
                end
                else begin
                    tempWords[0] <= ((e >> 6) | e << (32 - 6)) + 
                                    ((e >> 11) | e << (32 - 11)) + 
                                    ((e >> 25) | e << (32 - 25)) +
                                    (e & f) + (~e & g) + h + hashConstants[index] +
                                    schedule[index];

                    tempWords[1] <= ((a >> 2) | a << (32 - 2)) + 
                                    ((a >> 13) | a << (32 - 13)) + 
                                    ((a >> 22) | a << (32 - 22)) + 
                                    (a & b) + (a & c) + (b & c);
                    state <= CALC2;
                end
            end

            CALC2: begin
                h <= g;
                g <= f;
                f <= e;
                e <= d + tempWords[0];
                d <= c;
                c <= b;
                b <= a;
                a <= tempWords[0] + tempWords[1];
                state <= CALC1;
                index <= index + 1;
            end

            COMPLETE: begin
                hash[0] <= a + hash[0];
                hash[1] <= b + hash[1];
                hash[2] <= c + hash[2];
                hash[3] <= d + hash[3];
                hash[4] <= e + hash[4];
                hash[5] <= f + hash[5];
                hash[6] <= g + hash[6];
                hash[7] <= h + hash[7];
                status <= 32'b1;
                state <= IDLE;
            end

            WRITE: begin
                if (a_in[31:29] == 3'b000) begin
                    state <= IDLE;
                end
                else begin
                    d_out <= hash[a_in[2:0]];
                end
            end

            default: begin
                state <= WAIT;
            end
        endcase

    end


end

endmodule // SHA256_core
`default_nettype wire