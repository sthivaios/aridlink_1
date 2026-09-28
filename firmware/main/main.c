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
#include "esp_sntp.h"
#include "fetch_task.h"
#include "lte.h"
#include "memlog.h"
#include "nvs_flash.h"
#include "portmacro.h"
#include "scheduler.h"
#include "valve_control.h"

#include <time.h>

static const char *TAG = "main_task_pro_max_ultra";
static TaskHandle_t fetch_task_handle = nullptr;
static TaskHandle_t scheduler_task_handle = nullptr;

void app_main(void) {
  // set modem gpio direction
  gpio_set_direction(GPIO_NUM_4, GPIO_MODE_OUTPUT);
  gpio_set_direction(GPIO_NUM_17, GPIO_MODE_OUTPUT);
  gpio_set_level(GPIO_NUM_4, 0);
  gpio_set_level(GPIO_NUM_17, 0);

  valve_control_init();

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

  // init schedule mutex
  schedule_mutex_init();

  // init network interface stuff
  ESP_LOGI(TAG, "Attempting to init network interface shit");
  esp_netif_init();
  esp_event_loop_create_default();
  lte_init();

#ifdef CONFIG_MEMLOG_TASK_ENABLED
  init_telemetry_uart();
  xTaskCreate(telemetry_task, "telemetry", 2048, NULL, 5, NULL);
#endif

  // create fetch task
  BaseType_t const fetch_task_returned =
      xTaskCreate(fetch_task, "INTERNET_STUFF_FETCH_TASK", 12288, NULL, 1,
                  &fetch_task_handle);

  // explode completely if task couldnt be created
  if (fetch_task_returned != pdPASS) {
    // TODO: Fix error handling: dont abort but fall back to local schedule if fetch task cant be created after 4 abort() calls
    ESP_LOGE(TAG, "FATAL: FAILED TO CREATE FETCH TASK - HARD RESETTING...");
    abort();
  } else {
    ESP_LOGI(TAG, "Fetch RTOS task created successfully!");
  }

  // create scheduler task
  BaseType_t const scheduler_task_returned =
      xTaskCreate(irrigation_scheduler, "IRRIGATION_SCHEDULER_TASK", 8192, NULL, 20,
                  &scheduler_task_handle);

  // explode completely if task couldnt be created
  if (scheduler_task_returned != pdPASS) {
    ESP_LOGE(TAG, "FATAL: FAILED TO CREATE SCHEDULER TASK - HARD RESETTING...");
    abort();
  } else {
    ESP_LOGI(TAG, "Scheduler RTOS task created successfully!");
  }
}
