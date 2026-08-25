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
#include "esp_heap_trace.h"
#include "esp_netif_sntp.h"
#include "esp_task_wdt.h"
#include "lte.h"
#include "scheduler.h"

static const char *TAG = "fetch_task";

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

  // setup the watchdog to timeout after 30s
  ESP_LOGI(TAG, "Setting up watchdog");
  const esp_task_wdt_config_t wdt_config = {
      .timeout_ms = 300000,
      .idle_core_mask = 0,
  };
  esp_task_wdt_reconfigure(&wdt_config);

  // buffer for the JSON from the server
  static char json_from_alim_buffer[CONFIG_ALIM_RESPONSE_BUFFER_SIZE];

  // ReSharper disable once CppDFAEndlessLoop <-- this is just to get the ide (CLion) to shut up about the endless loop lol
  for (;;) {
    ESP_LOGW(TAG, "Starting fetch task. Free heap: %d bytes", esp_get_free_heap_size());

    // enable the wdt
    esp_task_wdt_add(nullptr);

    // default delay till the next fetch is 10s
    uint64_t next_delay_ms = SECONDS(2);

    // wake the modem up
    modem_wakeup_or_sleep(true);

    // connect to lte
    ESP_LOGI(TAG, "Calling lte_connect()");
    if (lte_connect() != LTE_CONNECTED_SUCCESSFULLY) {
      ESP_LOGW(TAG, "Skipping this fetch attempt. Retrying in 20 seconds.");
      next_delay_ms = SECONDS(20);
      goto cleanup;
    }

    // update the local time over ntp
    ESP_LOGI(TAG, "Calling update_time()");
    update_time();

    // actually fetch the schedule from ALIM
    ESP_LOGI(TAG, "Calling fetch_schedule_from_alim()");
    fetch_schedule_from_alim(ALIM_AUTHORIZATION_HEADER_DEV,
                             json_from_alim_buffer, CONFIG_ALIM_RESPONSE_BUFFER_SIZE);

    // print the response just for debugging
    ESP_LOGI(TAG, "Pulled JSON from ALIM. The raw response follows:");
    printf("%s\n", json_from_alim_buffer);

    scheduler_load_from_json_to_nvs(json_from_alim_buffer);
    scheduler_unload_nvs_into_ram();

  cleanup:
    // put modem back to sleep again
    esp_modem_set_mode(get_dce(), ESP_MODEM_MODE_COMMAND);
    modem_wakeup_or_sleep(false);

    // disable the wdt again so it doesn't get mad due to the vTaskDelay call
    esp_task_wdt_delete(nullptr);

    // rerun the task again later
    ESP_LOGI(TAG, "Task standing by for %llu seconds",
             (unsigned long long)(next_delay_ms / 1000));
    vTaskDelay(pdMS_TO_TICKS(next_delay_ms));
  }
}