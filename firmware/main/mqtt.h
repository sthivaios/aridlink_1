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

#ifndef ARIDLINK_MQTT_H
#define ARIDLINK_MQTT_H

#include "mqtt_client.h"
#include "esp_log.h"
#include "esp_netif.h"
#include "esp_system.h"
#include "sdkconfig.h"
#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include "esp_crt_bundle.h"
#include "shadow.h"

extern EventGroupHandle_t mqtt_event_group;

#define MQTT_CONNECTED_BIT BIT0

extern char shadow_buffer[16384];

esp_mqtt_client_handle_t mqtt_app_start(void);

#endif // ARIDLINK_MQTT_H
