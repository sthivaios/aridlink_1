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

#include "scheduler.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "driver/gpio.h"
#include "esp_log.h"
#include "nvs.h"

static const char *TAG = "valve_scheduler";
volatile static bool schedule_changed = false;

volatile static Irrigation_Window_t parsed_schedule[64];
volatile static int parsed_schedule_length = 0;

/**
 * Parses an AWS IoT shadow JSON string, and stores the schedule as a JSON
 * string into NVS.
 *
 * @param json The JSON sting of the entire device shadow
 * @returns LOAD_JSON_TO_NVS_SUCCESS if writing the new schedule to NVS
 * succeeded, LOAD_JSON_TO_NVS_PARSING_FAILED if cJSON failed to parse the AWS
 * shadow, LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED if writing the new schedule to
 * NVS failed.
 */
Load_JSON_To_NVS_Status_t scheduler_load_from_json_to_nvs(const char *json) {
  // buffer for current schedule
  char current_schedule[4096];
  size_t size = 4096;

  // parse json to only keep the desired.schedule section
  cJSON *root = cJSON_Parse(json);
  if (root == NULL) {
    return LOAD_JSON_TO_NVS_PARSING_FAILED;
  }
  cJSON *state = cJSON_GetObjectItem(root, "state");
  if (state == NULL) {
    return LOAD_JSON_TO_NVS_PARSING_FAILED;
  }
  cJSON *desired = cJSON_GetObjectItem(state, "desired");
  if (desired == NULL) {
    return LOAD_JSON_TO_NVS_PARSING_FAILED;
  }
  cJSON *schedule = cJSON_GetObjectItem(desired, "schedule");
  if (schedule == NULL) {
    return LOAD_JSON_TO_NVS_PARSING_FAILED;
  }
  char *schedule_string = cJSON_Print(schedule);
  if (schedule_string == NULL) {
    return LOAD_JSON_TO_NVS_PARSING_FAILED;
  }

  // nvs handle
  nvs_handle_t handle;

  // open nvs session
  if (nvs_open("aridlink_sched", NVS_READWRITE, &handle) != ESP_OK) {
    return LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED;
  }

  // get the old schedule from nvs
  if (nvs_get_str(handle, "current_sched", current_schedule, &size) != ESP_OK) {
    return LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED;
  };

  // write the new schedule to nvs
  if (nvs_set_str(handle, "current_sched", schedule_string) != ESP_OK) {
    return LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED;
  }

  // commit changes to nvs
  if (nvs_commit(handle) != ESP_OK) {
    return LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED;
  }

  // close nvs session
  nvs_close(handle);

  // check if the schedule changed, and if it did, set the flag so the scheduler knows
  if (strcmp(schedule_string, current_schedule) != 0) {
    schedule_changed = true;
  }

  // free up json stuff
  cJSON_free((void *)schedule_string);
  cJSON_Delete((cJSON *)root);

  return LOAD_JSON_TO_NVS_SUCCESS;
}


/**
 * Parses a JSON schedule string from the NVS and stores it as an array of structs in RAM.
 *
 * @returns UNLOAD_SCHEDULE_INTO_RAM_SUCCESS if loading into ram succeeded,
 *          UNLOAD_SCHEDULE_INTO_RAM_NVS_FAILED if some NVS action such as reading failed,
 *          UNLOAD_SCHEDULE_INTO_RAM_PARSING_FAILED if cJSON failed to parse the string,
 *          UNLOAD_SCHEDULE_INTO_RAM_TIME_PARSING_FAILED if parsing the time strings like "06:00" failed.
 */
Unload_Schedule_Into_RAM_Status_t scheduler_unload_nvs_into_ram() {
  ESP_LOGI(TAG, "Loading schedule from NVS into RAM...");

  // initialize nvs variables and buffers and handles and stuff
  char current_schedule_json[4096];
  size_t size = 4096;
  nvs_handle_t handle;

  // open nvs and grab schedule json string
  if (nvs_open("aridlink_sched", NVS_READWRITE, &handle) != ESP_OK) {
    ESP_LOGE(TAG, "Cannot open session with NVS!");
    return UNLOAD_SCHEDULE_INTO_RAM_NVS_FAILED;
  };
  if (nvs_get_str(handle, "current_sched", current_schedule_json, &size) != ESP_OK) {
    ESP_LOGE(TAG, "Cannot schedule from NVS!");
    return UNLOAD_SCHEDULE_INTO_RAM_NVS_FAILED;
  };

  // get root array and length
  cJSON *root = cJSON_Parse(current_schedule_json);
  if (root == NULL) {
    return UNLOAD_SCHEDULE_INTO_RAM_PARSING_FAILED;
  }
  const int array_length = cJSON_GetArraySize(root);

  parsed_schedule_length = 0;

  // iterate through the array
  for (int i = 0; i < array_length; i++) {

    // grab object from array
    cJSON *item = cJSON_GetArrayItem(root, i);

    // skip to next object if its null
    if (item == NULL) {
      continue;
    }

    // parse time and skip to next object if it cant
    cJSON *start_time = cJSON_GetObjectItem(item, "start");
    if (start_time == NULL) {
      continue;
    }

    // parse time and skip to next object if it cant
    cJSON *duration_seconds = cJSON_GetObjectItem(item, "duration_s");
    if (duration_seconds == NULL) {
      continue;
    }

    char *end;
    int start_hours = (int)strtol(start_time->valuestring, &end, 10);
    if (end == start_time->valuestring || *end != ':') {
      ESP_LOGE(TAG, "Failed to parse hours!");
      return UNLOAD_SCHEDULE_INTO_RAM_TIME_PARSING_FAILED;
    }

    int start_minutes = (int)strtol(end + 1, &end, 10);
    if (*end != '\0') {
      ESP_LOGE(TAG, "Failed to parse minutes!");
      return UNLOAD_SCHEDULE_INTO_RAM_TIME_PARSING_FAILED;
    }

    const Irrigation_Window_t irrigation_window = {
        .duration_s = duration_seconds->valueint,
        .start_hour = start_hours,
        .start_minute = start_minutes,
    };

    parsed_schedule[parsed_schedule_length] = irrigation_window;
    parsed_schedule_length++;
  }

  if (schedule_changed) {
    ESP_LOGW(TAG, "UPDATED SCHEDULE FOLLOWS:");
    ESP_LOGW(TAG, "==================================================");
    for (int i = 0; i < parsed_schedule_length; i++) {
      const Irrigation_Window_t irrigation_window = parsed_schedule[i];
      ESP_LOGW(TAG, "%d) Starts at %02d:%02d, and lasts for %d seconds", i,
               irrigation_window.start_hour, irrigation_window.start_minute,
               irrigation_window.duration_s);
    }
  }

  // reset schedule changed flag since it was handled here
  schedule_changed = false;

  cJSON_Delete((cJSON *)root);

  return UNLOAD_SCHEDULE_INTO_RAM_SUCCESS;
}

/**
 * Parses an irrigation window struct into a UNIX timestamp.
 *
 * @param irrigation_window The irrigation window struct
 * @param now The current UNIX timestamp
 * @returns Returns a UNIX timestamp as time_t.
 */
static time_t parse_into_timestamp(const Irrigation_Window_t irrigation_window,
                                   const time_t now) {
  struct tm t;
  localtime_r(&now, &t);

  t.tm_hour = irrigation_window.start_hour;
  t.tm_min = irrigation_window.start_minute;
  t.tm_sec = 0;

  return mktime(&t);
}

/**
 * The irrigation scheduler RTOS task.
 *
 * @param pvParameters Task parameters
 */
void irrigation_scheduler(void *pvParameters) {

  static bool previous_valve_state = false;
  static bool valve_state = false;

  // attempt to unload into ram three times
  int attempts_to_unload = 0;
  while (scheduler_unload_nvs_into_ram() != ESP_OK) {
    attempts_to_unload++;
    if (attempts_to_unload > 3) {
      abort();
    }
  }

  // ReSharper disable once CppDFAEndlessLoop
  for (;;) {

    valve_state = false;

    if (schedule_changed) {
      // attempt to unload into ram three times
      ESP_LOGI(TAG, "Schedule change detected!");
      attempts_to_unload = 0;
      while (scheduler_unload_nvs_into_ram() != ESP_OK) {
        attempts_to_unload++;
        if (attempts_to_unload > 3) {
          abort();
        }
      }
    }

    // get current time
    time_t now;
    time(&now);

    for (int i = 0; i < parsed_schedule_length; i++) {
      const Irrigation_Window_t irrigation_window = parsed_schedule[i];
      const time_t irrigation_timestamp =
          parse_into_timestamp(irrigation_window, now);

      if (now >= irrigation_timestamp &&
          now < (irrigation_timestamp + irrigation_window.duration_s)) {
        valve_state = true;
        break;
      }
    }

    if (valve_state != previous_valve_state) {
      gpio_set_level(VALVE_GPIO, valve_state);
      previous_valve_state = valve_state;
      if (valve_state) {
        ESP_LOGI(TAG, "====== The valve is now OPEN. ======");
      } else {
        ESP_LOGI(TAG, "====== The valve is now CLOSED. ======");
      }
    }

    // cooldown for half a second before scheduling again
    vTaskDelay(pdMS_TO_TICKS(500));

  }
}