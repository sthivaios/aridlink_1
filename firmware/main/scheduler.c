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

// called from shadow.c and loads the json response into nvs
void scheduler_load_from_json_to_nvs(const char *json) {
  char current_schedule[4096];
  size_t size = 4096;

  cJSON *root = cJSON_Parse(json);
  if (root == NULL) {
    return;
  }
  cJSON *state = cJSON_GetObjectItem(root, "state");
  if (state == NULL) {
    return;
  }
  cJSON *desired = cJSON_GetObjectItem(state, "desired");
  if (desired == NULL) {
    return;
  }
  cJSON *schedule = cJSON_GetObjectItem(desired, "schedule");
  if (schedule == NULL) {
    return;
  }
  char *schedule_string = cJSON_Print(schedule);
  if (schedule_string == NULL) {
    return;
  }

  nvs_handle_t handle;
  nvs_open("aridlink_sched", NVS_READWRITE, &handle);

  nvs_get_str(handle, "current_sched", current_schedule, &size);

  if (strcmp(schedule_string, current_schedule) == 0) {
    schedule_changed = true;
  }

  nvs_set_str(handle, "current_sched", schedule_string);

  nvs_commit(handle);
  nvs_close(handle);

  cJSON_free((void *)schedule_string);
  cJSON_Delete((cJSON *)root);
}

// loads the schedule from nvs into ram as an array of structs so it can be
// processed by the scheduler task
void scheduler_unload_nvs_into_ram() {
  ESP_LOGI(TAG, "Loading schedule from NVS into RAM...");

  // initialize nvs variables and buffers and handles and stuff
  char current_schedule_json[4096];
  size_t size = 4096;
  nvs_handle_t handle;

  // open nvs and grab schedule json string
  if (nvs_open("aridlink_sched", NVS_READWRITE, &handle) != ESP_OK) {
    ESP_LOGE(TAG,
             "FATAL ERROR: Cannot open session with NVS! Will hard-reset.");
    abort();
  };
  if (nvs_get_str(handle, "current_sched", current_schedule_json, &size) !=
      ESP_OK) {
    ESP_LOGE(TAG, "FATAL ERROR: Cannot schedule from NVS! Will hard-reset.");
    abort();
  };

  // get root array and length
  cJSON *root = cJSON_Parse(current_schedule_json);
  if (root == NULL) {
    return;
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

    int start_hours;
    int start_minutes;
    sscanf(start_time->valuestring, "%d:%d", &start_hours, &start_minutes);

    const Irrigation_Window_t irrigation_window = {
        .duration_s = duration_seconds->valueint,
        .start_hour = start_hours,
        .start_minute = start_minutes,
    };

    parsed_schedule[parsed_schedule_length] = irrigation_window;
    parsed_schedule_length++;
  }

  ESP_LOGW(TAG, "UPDATED SCHEDULE FOLLOWS:");
  ESP_LOGW(TAG, "==================================================");
  for (int i = 0; i < parsed_schedule_length; i++) {
    const Irrigation_Window_t irrigation_window = parsed_schedule[i];
    ESP_LOGW(TAG, "%d) Starts at %02d:%02d, and lasts for %d seconds", i,
             irrigation_window.start_hour, irrigation_window.start_minute,
             irrigation_window.duration_s);
  }

  schedule_changed = false;
}

// --------------------------------------------

// parses an irrigation window struct, and returns a unix timestamp (seconds!)
static time_t parse_into_timestamp(const Irrigation_Window_t irrigation_window,
                                   const time_t now) {
  struct tm t;
  localtime_r(&now, &t);

  t.tm_hour = irrigation_window.start_hour;
  t.tm_min = irrigation_window.start_minute;
  t.tm_sec = 0;

  return mktime(&t);
}

void irrigation_scheduler(void *pvParameters) {

  static bool valve_state = false;
  scheduler_unload_nvs_into_ram();

  for (;;) {

    if (schedule_changed) {
      ESP_LOGI(TAG, "Schedule change detected!");
      scheduler_unload_nvs_into_ram();
    }

    time_t now;
    time(&now);

    ESP_LOGI(TAG, "Parsing schedule...");
    for (int i = 0; i < parsed_schedule_length; i++) {
      const Irrigation_Window_t irrigation_window = parsed_schedule[i];
      const time_t irrigation_timestamp =
          parse_into_timestamp(irrigation_window, now);

      if (now >= irrigation_timestamp &&
          now < (irrigation_timestamp + irrigation_window.duration_s)) {
        valve_state = true;
      } else {
        valve_state = false;
      }
    }

    gpio_set_level(VALVE_GPIO, valve_state);

    ESP_LOGI(TAG, "Holding for 1 second...");
    vTaskDelay(pdMS_TO_TICKS(1000));

  }
}