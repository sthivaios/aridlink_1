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

#ifndef ARIDLINK_SHADOWS_H
#define ARIDLINK_SHADOWS_H

#include "mqtt_client.h"

#define SHADOW_ACCEPTED_TOPIC "$aws/things/aridlink1_dev/shadow/get/accepted"
#define SHADOW_REJECTED_TOPIC "$aws/things/aridlink1_dev/shadow/get/rejected"

#define SHADOW_GET_ACCEPTED_BIT BIT0
#define SHADOW_GET_REJECTED_BIT BIT1
#define SHADOW_INITED_BIT BIT2

extern EventGroupHandle_t shadow_event_group;

void shadow_init(esp_mqtt_client_handle_t client);
void shadow_get(esp_mqtt_client_handle_t client);
void set_shadow_buffer(const char *data, int len);

#endif // ARIDLINK_SHADOWS_H
