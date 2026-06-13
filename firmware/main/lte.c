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

#include "lte.h"
#include "driver/gpio.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_modem_api.h"
#include "esp_netif.h"
#include "fetch_task.h"
#include "freertos/event_groups.h"

#define MAX_MODEM_CONTACT_ATTEMPTS 5

static const char *TAG = "lte";
static EventGroupHandle_t s_event_group;
static const int GOT_IP_BIT = BIT0;

esp_modem_dce_t *dce;

esp_modem_dce_t *get_dce() { return dce; }

static void on_ip_event(void *arg, esp_event_base_t base, int32_t event_id,
                        void *data) {
  if (event_id == IP_EVENT_PPP_GOT_IP) {
    ip_event_got_ip_t *event = (ip_event_got_ip_t *)data;
    ESP_LOGI(TAG, "Got IP: " IPSTR, IP2STR(&event->ip_info.ip));
    xEventGroupSetBits(s_event_group, GOT_IP_BIT);
  }
}

// set parameter to true to wake the modem up or false to put modem to sleep
void modem_wakeup_or_sleep(const bool wakeup) {
  if (wakeup) {
    gpio_set_level(GPIO_NUM_17, 1);
  }
  static const char *SUB_TAG = "modem_power_control";
  gpio_set_direction(GPIO_NUM_4, GPIO_MODE_OUTPUT);
  gpio_set_level(GPIO_NUM_4, 1);
  if (wakeup) {
    ESP_LOGI(SUB_TAG, "Stand by while the modem wakes up...");
  } else {
    ESP_LOGI(SUB_TAG, "Stand by while the modem goes to sleep...");
  }
  vTaskDelay(pdMS_TO_TICKS(wakeup ? 2000 : 6500));
  gpio_set_level(GPIO_NUM_4, 0);
  vTaskDelay(pdMS_TO_TICKS(wakeup ? 9000 : 3500));
  if (wakeup) {
    ESP_LOGI(SUB_TAG, "The modem should now be awake.");
  } else {
    gpio_set_level(GPIO_NUM_17, 0);
    ESP_LOGI(SUB_TAG, "The modem should now be eeping.");
  }
}

void lte_init(void) {
  ESP_LOGI(TAG, "Hello from inside the lte_connect() function");

  ESP_LOGI(TAG, "Created event group");
  s_event_group = xEventGroupCreate();

  ESP_LOGI(TAG, "Setup configs");
  esp_netif_config_t netif_cfg = ESP_NETIF_DEFAULT_PPP();

  ESP_LOGI(TAG, "Create network interface");
  esp_netif_t *netif = esp_netif_new(&netif_cfg);

  ESP_LOGI(TAG, "Setup DTE config");
  esp_modem_dte_config_t dte_config = ESP_MODEM_DTE_DEFAULT_CONFIG();
  dte_config.uart_config.tx_io_num = 16;
  dte_config.uart_config.rx_io_num = 15;
  dte_config.uart_config.baud_rate = 115200;

  ESP_LOGI(TAG, "Create DCE config");
  esp_modem_dce_config_t dce_config = ESP_MODEM_DCE_DEFAULT_CONFIG("internet");

  ESP_LOGI(TAG, "Register event handler");
  esp_event_handler_register(IP_EVENT, ESP_EVENT_ANY_ID, on_ip_event, NULL);

  ESP_LOGI(TAG, "Create new modem object");
  dce =
      esp_modem_new_dev(ESP_MODEM_DCE_SIM7600, &dte_config, &dce_config, netif);
}

LTE_Connect_Status_t lte_connect(void) {
  xEventGroupClearBits(s_event_group, GOT_IP_BIT);

  ESP_LOGI(TAG, "Create IMEI char buffer");
  char imei[32];

  ESP_LOGI(TAG, "Attempting to connect to the modem...");
  int modem_contact_attempts = 0;
  while (esp_modem_get_imei(dce, imei) == ESP_FAIL) {
    if (modem_contact_attempts > MAX_MODEM_CONTACT_ATTEMPTS) {
      ESP_LOGE(TAG, "Failed to contact the modem!");
      return LTE_MODEM_NO_CONTACT;
    }
    modem_contact_attempts++;
    vTaskDelay(1000);
  }
  ESP_LOGI(TAG, "IMEI: %s", imei);

  int rssi, ber;
  if (esp_modem_get_signal_quality(dce, &rssi, &ber) != ESP_OK) {
    ESP_LOGE(TAG, "Could not get LTE signal integrity!");
    return LTE_MODEM_NO_RSSI;
  }
  ESP_LOGI(TAG, "RSSI=%d BER=%d", rssi, ber);

  if (esp_modem_set_mode(dce, ESP_MODEM_MODE_DATA) != ESP_OK) {
    ESP_LOGE(TAG, "Could not set modem mode!");
    return LTE_MODEM_COULDNT_SET_MODE;
  }

  ESP_LOGI(TAG, "Waiting for IP...");
  const EventBits_t bits = xEventGroupWaitBits(
      s_event_group, GOT_IP_BIT, pdFALSE, pdFALSE, pdMS_TO_TICKS(SECONDS(10)));
  if (bits & GOT_IP_BIT) {
    ESP_LOGI(TAG, "IP received successfully!");
  } else {
    ESP_LOGE(TAG, "Timed out waiting for IP");
    return LTE_MODEM_COULDNT_GET_IP;
  }

  ESP_LOGI(TAG, "LTE connected!");
  return LTE_CONNECTED_SUCCESSFULLY;
}