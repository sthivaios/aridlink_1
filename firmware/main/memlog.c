#include "memlog.h"

#include "driver/uart.h"
#include "esp_system.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include <time.h>
#include <string.h>

#define TELEMETRY_TX_PIN CONFIG_MEMLOG_TASK_UART_PIN
#define TELEMETRY_RX_PIN UART_PIN_NO_CHANGE
#define TELEMETRY_UART_NUM UART_NUM_2

void init_telemetry_uart() {
  const uart_config_t uart_config = {
    .baud_rate = 115200,
    .data_bits = UART_DATA_8_BITS,
    .parity = UART_PARITY_DISABLE,
    .stop_bits = UART_STOP_BITS_1,
    .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
    .source_clk = UART_SCLK_DEFAULT,
};

  // Install UART driver (no RX buffer needed since we only transmit)
  uart_driver_install(TELEMETRY_UART_NUM, 256, 0, 0, NULL, 0);
  uart_param_config(TELEMETRY_UART_NUM, &uart_config);
  uart_set_pin(TELEMETRY_UART_NUM, TELEMETRY_TX_PIN, TELEMETRY_RX_PIN, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);
}

void telemetry_task(void *pvParameter) {
  char buffer[64];

  // Print the CSV header
  const char* header = "unix_timestamp,free_heap,min_free_heap_ever_available\n";
  uart_write_bytes(TELEMETRY_UART_NUM, header, strlen(header));

  while(1) {
    time_t now = time(NULL);

    // Only log if NTP has synced (Unix time > year 2001)
    // This prevents logging 1970 dates during boot-up
    if (now > 1000000000) {
      int len = snprintf(buffer, sizeof(buffer), "%lld,%lu,%lu\n",
                         (long long)now,
                         esp_get_free_heap_size(),
                         esp_get_minimum_free_heap_size());

      uart_write_bytes(TELEMETRY_UART_NUM, buffer, len);
    }

    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}