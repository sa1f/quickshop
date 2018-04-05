
#ifndef MEMORY_MAP_H_
#define MEMORY_MAP_H_

#define TIMER_SYS_CLK 	0x00002040
#define TIMER_TIMESTAMP	0x00002060
#define TIMER_HARDWARE	0x00002080

#define SHA_tx					(volatile uint32_t *)(0x80004000)
#define SHA_addr				(volatile uint32_t *)(0x80004010)
#define SHA_rx					(volatile uint32_t *)(0x80004020)
#define SHA_status	 			(volatile uint32_t *)(0x80004030)

#define RS232_Control 			(volatile unsigned char *)(0x84000200)
#define RS232_Status  			(volatile unsigned char *)(0x84000200)
#define RS232_TxData  			(volatile unsigned char *)(0x84000202)
#define RS232_RxData  			(volatile unsigned char *)(0x84000202)
#define RS232_Baud    			(volatile unsigned char *)(0x84000204)

#define GPS_Control 			(volatile unsigned char *)(0x84000210)
#define GPS_Status  			(volatile unsigned char *)(0x84000210)
#define GPS_TxData  			(volatile unsigned char *)(0x84000212)
#define GPS_RxData  			(volatile unsigned char *)(0x84000212)
#define GPS_Baud    			(volatile unsigned char *)(0x84000214)

#define Touchscreen_Status 		(volatile unsigned char *)(0x84000230)
#define Touchscreen_Control 	(volatile unsigned char *)(0x84000230)
#define Touchscreen_TxData 		(volatile unsigned char *)(0x84000232)
#define Touchscreen_RxData 		(volatile unsigned char *)(0x84000232)
#define Touchscreen_Baud    	(volatile unsigned char *)(0x84000234)

#define Wifi_Control 			(volatile unsigned char *)(0x84000210)
#define Wifi_Status  			(volatile unsigned char *)(0x84000210)
#define Wifi_TxData  			(volatile unsigned char *)(0x84000212)
#define Wifi_RxData  			(volatile unsigned char *)(0x84000212)
#define Wifi_Baud    			(volatile unsigned char *)(0x84000214)


#endif /* MEMORY_MAP_H_ */
