set_global_assignment -entity "PLL30Mhz" -library "lib_PLL30Mhz" -name IP_TOOL_NAME "altera_pll"
set_global_assignment -entity "PLL30Mhz" -library "lib_PLL30Mhz" -name IP_TOOL_VERSION "15.1"
set_global_assignment -entity "PLL30Mhz" -library "lib_PLL30Mhz" -name IP_TOOL_ENV "mwpim"
set_global_assignment -library "lib_PLL30Mhz" -name SPD_FILE [file join $::quartus(sip_path) "PLL30Mhz.spd"]

set_global_assignment -library "lib_PLL30Mhz" -name MISC_FILE [file join $::quartus(sip_path) "PLL30Mhz_sim/PLL30Mhz.vho"]
