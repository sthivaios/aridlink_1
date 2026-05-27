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

#include "shadow.h"

#include "esp_log.h"
#include "mqtt.h"
#include "scheduler.h"

EventGroupHandle_t shadow_event_group;

static const char *TAG = "shadow_handler";

void set_shadow_buffer(const char *data, int len) {
  snprintf(shadow_buffer, sizeof(shadow_buffer), "%.*s", len, data);
}

void shadow_init(esp_mqtt_client_handle_t client) {
  shadow_event_group = xEventGroupCreate();
  ESP_LOGI(TAG, "CREATED EVENT GROUP");
  esp_mqtt_client_subscribe(client, SHADOW_ACCEPTED_TOPIC, 0);
  ESP_LOGI(TAG, "SUBSCRIBED TO ACCEPTED TOPIC");
  esp_mqtt_client_subscribe(client, SHADOW_REJECTED_TOPIC, 0);
  ESP_LOGI(TAG, "SUBSCRIBED TO REJECTED TOPIC");
}

void shadow_get(esp_mqtt_client_handle_t client) {
  esp_mqtt_client_publish(client, "$aws/things/aridlink1_dev/shadow/get", "{}", 2, 0, 0);
  ESP_LOGI(TAG, "PUBLISHED SHADOW GET REQUEST - WAITING FOR RESPONSE");
  xEventGroupWaitBits(shadow_event_group, SHADOW_GET_ACCEPTED_BIT, pdFALSE, pdFALSE, portMAX_DELAY);
  // shadow_buffer now contains the shadow
  printf("%s\r\n", shadow_buffer);
  ESP_LOGI(TAG, "Calling scheduler");
  scheduler_load_from_json_to_nvs(shadow_buffer);
}