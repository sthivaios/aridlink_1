/*
 * Copyright (C) 2026 Stratos Thivaios <me@sthivaios.dev>
 *
 * This file is part of the AridLink 1 Firmware.
 *
 * AridLink 1 Firmware is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published
 * by the Free  Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * AridLink 1 Firmware is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with AridLink 1 Firmware. If not, see <https://www.gnu.org/licenses/>.f
 */

#include "driver/gpio.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_netif.h"
#include "esp_task_wdt.h"
#include "fetch_task.h"
#include "lte.h"
#include "nvs_flash.h"
#include "portmacro.h"
#include <time.h>

#define VALVE_GPIO 17

static const char *TAG = "main_task_pro_max_ultra";
TaskHandle_t fetch_task_handle = NULL;

void app_main(void) {
  // set the stupid fucking log levels
  esp_log_level_set("*", ESP_LOG_INFO);
  esp_log_level_set("esp-tls", ESP_LOG_VERBOSE);
  esp_log_level_set("mqtt_client", ESP_LOG_VERBOSE);
  esp_log_level_set("mqtt_example", ESP_LOG_VERBOSE);
  esp_log_level_set("transport_base", ESP_LOG_VERBOSE);
  esp_log_level_set("transport", ESP_LOG_VERBOSE);
  esp_log_level_set("outbox", ESP_LOG_VERBOSE);

  // configure watchdog for this task
  ESP_LOGI(TAG, "Setting up watchdog");
  const esp_task_wdt_config_t wdt_config = {
      .timeout_ms = 45000, // 15 seconds
      .idle_core_mask = 0,
      .trigger_panic = true,
  };
  esp_task_wdt_reconfigure(&wdt_config);
  esp_task_wdt_add(nullptr);

  // set valve gpio direction
  gpio_set_direction(VALVE_GPIO, GPIO_MODE_OUTPUT);
  gpio_set_level(VALVE_GPIO, 0);

  // Initialize NVS stuff
  ESP_LOGI(TAG, "Attempting to initialise NVS shit");
  esp_err_t ret = nvs_flash_init();
  if (ret == ESP_ERR_NVS_NO_FREE_PAGES ||
      ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
    ESP_ERROR_CHECK(nvs_flash_erase());
    ret = nvs_flash_init();
  }
  ESP_ERROR_CHECK(ret);

  // set timezone to utc
  setenv("TZ", "UTC", 1);
  tzset();

  // init network interface stuff
  ESP_LOGI(TAG, "Attempting to init network interface shit");
  esp_netif_init();
  esp_event_loop_create_default();
  lte_init();

  // create fetch task
  BaseType_t const fetch_task_returned =
      xTaskCreate(fetch_task, "INTERNET_STUFF_FETCH_TASK", 8192, NULL, 0, &fetch_task_handle);

  // explode completely if task couldnt be created
  if (fetch_task_returned != pdPASS) {
    ESP_LOGE(TAG, "Failed to create fetch task");
    abort();
  }
}
