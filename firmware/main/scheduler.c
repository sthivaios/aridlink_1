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

#include "esp_log.h"

static const char *TAG = "SCHEDULER";

void scheduler_load_from_json_to_nvs(const char *json) {
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

  printf("%s\r\n", schedule_string);

  nvs_handle_t handle;
  nvs_open("aridlink_sched", NVS_READWRITE, &handle);

  nvs_set_str(handle, "current_sched", schedule_string);

  nvs_commit(handle);
  nvs_close(handle);

  cJSON_free((void *)schedule_string);
  cJSON_Delete((cJSON *)root);
}

time_t scheduler_parse_entry(cJSON *item, const time_t now, bool tomorrow) {
  const char *start_time_string = cJSON_GetStringValue(item);
  int start_hours;
  int start_minutes;
  struct tm *current_time_breakdown = gmtime(&now);
  sscanf(start_time_string, "%d:%d", &start_hours, &start_minutes);

  struct tm irrigation_time = *current_time_breakdown;
  irrigation_time.tm_hour = start_hours;
  irrigation_time.tm_min = start_minutes;
  irrigation_time.tm_sec = 0;
  if (tomorrow) {
    irrigation_time.tm_mday = irrigation_time.tm_mday + 1;
  }

  const time_t event_timestamp = mktime(&irrigation_time);

  return event_timestamp;
}

int scheduler_schedule_next_irrigation(uint32_t *sleep_duration_s) {
  char current_schedule[4096];
  size_t size = 4096;
  nvs_handle_t handle;

  // nvs_open("aridlink_sched", NVS_READWRITE, &handle);
  // nvs_get_str(handle, "current_sched", current_schedule, &size);

  esp_err_t err = nvs_open("aridlink_sched", NVS_READWRITE, &handle);
  ESP_LOGI(TAG, "NVS open: %s", esp_err_to_name(err));
  err = nvs_get_str(handle, "current_sched", current_schedule, &size);
  ESP_LOGI(TAG, "NVS get: %s", esp_err_to_name(err));
  ESP_LOGI(TAG, "Schedule string: %s", current_schedule);

  cJSON *root = cJSON_Parse(current_schedule);
  if (root == NULL) {
    return 0;
  }
  const int array_length = cJSON_GetArraySize(root);

  time_t now;
  time(&now);
  ESP_LOGI(TAG, "Current unix timestamp: %lld", (long long)now);

  for (int i = 0; i < array_length; i++) {
    cJSON *item = cJSON_GetArrayItem(root, i);
    if (item == NULL) {
      continue;
    }
    cJSON *start_time = cJSON_GetObjectItem(item, "start");
    if (start_time == NULL) {
      continue;
    }
    const time_t event_timestamp = scheduler_parse_entry(start_time, now, false);

    if (event_timestamp > now) {
      *sleep_duration_s = event_timestamp - now;
      nvs_close(handle);
      cJSON_Delete(root);
      return 1;
    }
  }

  cJSON *item = cJSON_GetArrayItem(root, 0);
  if (item == NULL) {
    return 0;
  }
  cJSON *start_time = cJSON_GetObjectItem(item, "start");
  if (start_time == NULL) {
    return 0;
  }
  const time_t event_timestamp = scheduler_parse_entry(start_time, now, true);

  *sleep_duration_s = event_timestamp - now;
  nvs_close(handle);
  cJSON_Delete(root);
  return 1;
}