/*
 * Copyright (C) 2026 Stratos Thivaios <me@sthivaios.dev>
 *
 * This file is part of the AridLink 1 Firmware.
 *
 * AridLink 1 Firmware is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * AridLink 1 Firmware is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with AridLink 1 Firmware. If not, see <https://www.gnu.org/licenses/>.
 */

#include "fetch_task.h"

#include "alim.h"
#include "esp_netif_sntp.h"
#include "esp_task_wdt.h"
#include "lte.h"
#include "mqtt.h"
#include "mqtt_client.h"
#include "scheduler.h"

static const char *TAG = "RTOS_FETCH_TASK";

// updates the local time on the system by fetching from ntp
static void update_time(void) {
  esp_sntp_config_t config = ESP_NETIF_SNTP_DEFAULT_CONFIG("gr.pool.ntp.org");
  esp_netif_sntp_init(&config);
  if (esp_netif_sntp_sync_wait(pdMS_TO_TICKS(10000)) != ESP_OK) {
    ESP_LOGE(TAG, "Failed to update system time within 10s timeout");
  } else {
    ESP_LOGI(TAG, "System time updated from gr.pool.ntp.org!");
  }
  esp_netif_sntp_deinit();
}

void fetch_task(void *pvParameters) {

  ESP_LOGI(TAG, "Setting up watchdog");
  const esp_task_wdt_config_t wdt_config = {
      .timeout_ms = 300000,
      .idle_core_mask = 0,
  };
  esp_task_wdt_reconfigure(&wdt_config);

  // ReSharper disable once CppDFAEndlessLoop
  for (;;) {
    esp_task_wdt_add(nullptr);
    uint64_t next_delay_ms = SECONDS(10);

    char *json_from_alim_buffer = NULL;
    size_t json_from_alim_buffer_size = 8192;

    json_from_alim_buffer = malloc(json_from_alim_buffer_size);
    if (json_from_alim_buffer == NULL) {
      ESP_LOGE(TAG, "Failed to allocate memory for json_from_alim_buffer");
      next_delay_ms = SECONDS(20);
      goto cleanup_no_client;
    }

    ESP_LOGW(TAG, "Hello from the fetch task... (free heap: %lu)",
             esp_get_free_heap_size());

    // wake modem up
    modem_wakeup_or_sleep(true);

    // begin by connecting to lte
    ESP_LOGI(TAG, "Calling lte_connect()");
    if (lte_connect() != LTE_CONNECTED_SUCCESSFULLY) {
      ESP_LOGW(TAG, "Skipping this fetch attempt. Retrying in 20 seconds.");
      next_delay_ms = SECONDS(20);
      goto cleanup_no_client;
    }

    // update the local time
    ESP_LOGI(TAG, "Calling update_time()");
    update_time();

    // actually fetch the shadow
    ESP_LOGI(TAG, "Calling fetch_schedule_from_alim()");
    fetch_schedule_from_alim(ALIM_AUTHORIZATION_HEADER_DEV, json_from_alim_buffer, json_from_alim_buffer_size);

    ESP_LOGI(TAG, "Pulled JSON from ALIM. The raw response follows:");

    printf("%s\n", json_from_alim_buffer);

    scheduler_unload_nvs_into_ram();

  cleanup_no_client:
    // make modem sleepy sleep
    esp_modem_set_mode(get_dce(), ESP_MODEM_MODE_COMMAND);
    modem_wakeup_or_sleep(false);

    // rerun later
    esp_task_wdt_delete(nullptr);
    ESP_LOGI(TAG, "Task standing by for %llu seconds",
             (unsigned long long)(next_delay_ms / 1000));
    vTaskDelay(pdMS_TO_TICKS(next_delay_ms));
  }
}