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
#include "fetch_task.h"
#include "mqtt.h"
#include "scheduler.h"

EventGroupHandle_t shadow_event_group;

static const char *TAG = "device_shadow_handler";

/**
 * Creates the RTOS event group for shadow-related stuff, and subscribes to the
 * two shadow AWS topics.
 *
 * Should be called before shadow_get().
 *
 * @param client The MQTT client handle used for subscribing to topics
 * @return SHADOW_INIT_SUCCESS on success,
 *         SHADOW_INIT_FAILED_TO_SUB_TO_ACCEPTED if the accepted topic
 * subscription fails, SHADOW_INIT_FAILED_TO_SUB_TO_REJECTED if the rejected
 * topic subscription fails
 */
Shadow_Init_Status_t shadow_init(esp_mqtt_client_handle_t client) {
  shadow_event_group = xEventGroupCreate();

  if (esp_mqtt_client_subscribe(client, SHADOW_ACCEPTED_TOPIC, 0) < 0) {
    ESP_LOGE(TAG, "Failed to subscribe to the accepted topic!");
    return SHADOW_INIT_FAILED_TO_SUB_TO_ACCEPTED;
  }
  ESP_LOGI(TAG, "Successfully subscribed to the accepted topic!");

  if (esp_mqtt_client_subscribe(client, SHADOW_REJECTED_TOPIC, 0) < 0) {
    ESP_LOGE(TAG, "Failed to subscribe to the rejected topic!");
    return SHADOW_INIT_FAILED_TO_SUB_TO_REJECTED;
  }
  ESP_LOGI(TAG, "Successfully subscribed to the rejected topic!");

  return SHADOW_INIT_SUCCESS;
}

/**
 * Requests the device shadow from AWS IoT, and then stores it to NVS.
 *
 * @param client The MQTT client handle used for publishing the request message
 * @return SHADOW_INIT_SUCCESS on success,
 *         SHADOW_INIT_FAILED_TO_SUB_TO_ACCEPTED if the accepted topic
 * subscription fails, SHADOW_INIT_FAILED_TO_SUB_TO_REJECTED if the rejected
 * topic subscription fails
 */
Shadow_Get_Status_t shadow_get(esp_mqtt_client_handle_t client) {
  if (esp_mqtt_client_publish(client, "$aws/things/aridlink1_dev/shadow/get", "{}", 2, 1, 0) < 0) {
   ESP_LOGE(TAG, "Failed to publish the shadow get request!");
   return SHADOW_GET_FAILED_TO_PUBLISH_GET_REQUEST;
  }
  ESP_LOGI(TAG, "Successfully published the shadow get request! Waiting for reply...");

  const EventBits_t bits = xEventGroupWaitBits(shadow_event_group, SHADOW_GET_ACCEPTED_BIT, pdFALSE,
                      pdFALSE, pdMS_TO_TICKS(SECONDS(10)));
  if (bits & SHADOW_GET_ACCEPTED_BIT) {
    ESP_LOGI(TAG, "Shadow reply received successfully!");
  } else {
    ESP_LOGE(TAG, "Timed out waiting for shadow reply!");
    return SHADOW_GET_TIMED_OUT_WAITING_FOR_REPLY;
  }

  // shadow_buffer now contains the shadow
  ESP_LOGI(TAG, "Calling ");
  if (scheduler_load_from_json_to_nvs(shadow_buffer) != LOAD_JSON_TO_NVS_SUCCESS) {
    return SHADOW_GET_FAILED_TO_NVS;
  };

  return SHADOW_GET_SUCCESS;
}