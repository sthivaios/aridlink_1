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

#define VALVE_GPIO 10

#include "cJSON.h"
#include <time.h>

typedef struct {
  int start_hour;
  int start_minute;
  uint32_t duration_s;
} Irrigation_Window_t;

typedef enum {
  LOAD_JSON_TO_NVS_SUCCESS,
  LOAD_JSON_TO_NVS_PARSING_FAILED,
  LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED,
  LOAD_JSON_TO_NVS_OUT_OF_MEMORY
} Load_JSON_To_NVS_Status_t;
Load_JSON_To_NVS_Status_t scheduler_load_from_json_to_nvs(const char *json);


typedef enum {
  UNLOAD_SCHEDULE_INTO_RAM_SUCCESS,
  UNLOAD_SCHEDULE_INTO_RAM_NVS_FAILED,
  UNLOAD_SCHEDULE_INTO_RAM_PARSING_FAILED,
  UNLOAD_SCHEDULE_INTO_RAM_TIME_PARSING_FAILED,
  UNLOAD_SCHEDULE_INTO_RAM_OUT_OF_MEMORY
} Unload_Schedule_Into_RAM_Status_t;
Unload_Schedule_Into_RAM_Status_t scheduler_unload_nvs_into_ram();


time_t scheduler_parse_entry(cJSON *item, time_t now, bool tomorrow);
void scheduler_get_next_action( void * pvParameters );
void set_schedule_changed(bool value);

void irrigation_scheduler(void *pvParameters);

#endif // ARIDLINK_SCHEDULER_H
