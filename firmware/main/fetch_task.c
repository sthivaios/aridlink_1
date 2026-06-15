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

    ESP_LOGW(TAG, "Initializing MQTT... (free heap: %lu)", esp_get_free_heap_size());

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

    // start a new mqtt client
    ESP_LOGI(TAG, "Initializing MQTT shit...");
    const esp_mqtt_client_handle_t client = mqtt_app_start();

    // wait for the client to actually connect
    xEventGroupWaitBits(mqtt_event_group, MQTT_CONNECTED_BIT, pdFALSE, pdFALSE,
                        portMAX_DELAY);

    // initialize shadow stuff
    ESP_LOGI(TAG, "Calling shadow_init()");
    shadow_init(client);

    // wait for the mqtt client to actually subscribe to the shadow topics
    xEventGroupWaitBits(shadow_event_group,
                        SHADOW_SUBSCRIBED_TO_ACCEPTED_TOPIC_BIT |
                            SHADOW_SUBSCRIBED_TO_REJECTED_TOPIC_BIT,
                        pdFALSE, pdFALSE, portMAX_DELAY);

    // actually fetch the shadow
    ESP_LOGI(TAG, "Calling shadow_get()");
    shadow_get(client);

    scheduler_unload_nvs_into_ram();

    // stop/delete mqtt client
    ESP_LOGI(TAG, "Making the MQTT client explode");
    esp_mqtt_client_disconnect(client);
    esp_mqtt_client_stop(client);
    esp_mqtt_client_destroy(client);

cleanup_no_client:
    // make modem sleepy sleep
    esp_modem_set_mode(get_dce(), ESP_MODEM_MODE_COMMAND);
    modem_wakeup_or_sleep(false);

    // rerun later
    esp_task_wdt_delete(nullptr);
    ESP_LOGI(TAG, "Task standing by for %llu seconds", (unsigned long long)(next_delay_ms / 1000));
    vTaskDelay(pdMS_TO_TICKS(next_delay_ms));
  }
}