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

#ifndef ARIDLINK_SCHEDULER_H
#define ARIDLINK_SCHEDULER_H
#include "cJSON.h"
#include <time.h>
#include "esp_sleep.h"
#include "nvs.h"
#include <stdio.h>

void scheduler_load_from_json_to_nvs(const char *json);
time_t scheduler_parse_entry(cJSON *item, time_t now, bool tomorrow);
int scheduler_schedule_next_irrigation(uint32_t *sleep_duration_ms);

#endif // ARIDLINK_SCHEDULER_H
