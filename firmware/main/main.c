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
 * along with AridLink 1 Firmware. If not, see <https://www.gnu.org/licenses/>.
 */

#include "esp_event.h"
#include "esp_log.h"
#include "esp_netif.h"
#include "esp_netif_sntp.h"
#include "esp_task_wdt.h"
#include "mqtt.h"
#include "nvs_flash.h"
#include "scheduler.h"
#include "shadow.h"
#include "wifi.h"

static const char *TAG = "main_pro_max";

BaseType_t ntp_task_handle;

void app_main(void) {
  ESP_LOGI(TAG, "[APP] Startup..");
  ESP_LOGI(TAG, "[APP] Free memory: %" PRIu32 " bytes",
           esp_get_free_heap_size());
  ESP_LOGI(TAG, "[APP] IDF version: %s", esp_get_idf_version());

  esp_log_level_set("*", ESP_LOG_INFO);
  esp_log_level_set("esp-tls", ESP_LOG_VERBOSE);
  esp_log_level_set("mqtt_client", ESP_LOG_VERBOSE);
  esp_log_level_set("mqtt_example", ESP_LOG_VERBOSE);
  esp_log_level_set("transport_base", ESP_LOG_VERBOSE);
  esp_log_level_set("transport", ESP_LOG_VERBOSE);
  esp_log_level_set("outbox", ESP_LOG_VERBOSE);

  const esp_task_wdt_config_t wdt_config = {
      .timeout_ms = 15000, // 15 seconds
      .idle_core_mask = 0,
      .trigger_panic = true,
  };
  esp_task_wdt_reconfigure(&wdt_config);
  esp_task_wdt_add(nullptr); // NULL = current task (main task)

  // Initialize NVS
  esp_err_t ret = nvs_flash_init();
  if (ret == ESP_ERR_NVS_NO_FREE_PAGES ||
      ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
    ESP_ERROR_CHECK(nvs_flash_erase());
    ret = nvs_flash_init();
  }
  ESP_ERROR_CHECK(ret);

  // init wifi
  wifi_init_sta();

  setenv("TZ", "UTC", 1);
  tzset();

  esp_sntp_config_t config = ESP_NETIF_SNTP_DEFAULT_CONFIG("gr.pool.ntp.org");
  esp_netif_sntp_init(&config);

  if (esp_netif_sntp_sync_wait(pdMS_TO_TICKS(10000)) != ESP_OK) {
    ESP_LOGE(TAG, "Failed to update system time within 10s timeout");
  } else {
    ESP_LOGI(TAG, "System time updated from gr.pool.ntp.org!");
  }

  // mqtt
  const esp_mqtt_client_handle_t client = mqtt_app_start();

  xEventGroupWaitBits(mqtt_event_group, MQTT_CONNECTED_BIT, pdFALSE, pdFALSE,
                      portMAX_DELAY);
  ESP_LOGI(TAG, "NOW CALLING shadow_init()");
  shadow_init(client);

  xEventGroupWaitBits(shadow_event_group,
                      SHADOW_SUBSCRIBED_TO_ACCEPTED_TOPIC_BIT |
                          SHADOW_SUBSCRIBED_TO_REJECTED_TOPIC_BIT,
                      pdFALSE, pdFALSE, portMAX_DELAY);
  ESP_LOGI(TAG, "NOW CALLING shadow_get()");
  shadow_get(client);

  uint32_t sleep_duration_s;

  const int result = scheduler_schedule_next_irrigation(&sleep_duration_s);
  ESP_LOGI(TAG, "Scheduler result: %d, sleep duration: %lu", result, sleep_duration_s);

  if (result == 1) {
    ESP_LOGW(TAG, "ENTERING DEEP SLEEP FOR: %ds", sleep_duration_s);
    esp_deep_sleep((sleep_duration_s) * 1000000ULL);
  }
}
