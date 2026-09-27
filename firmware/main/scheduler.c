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

#include <tgmath.h>

// flag to indicate if the schedule on alim is different from the local one
volatile static bool schedule_changed = false;

// mutex for the global local schedule that is loaded into memory
static SemaphoreHandle_t schedule_mutex;

// the actual global local schedule in ram
volatile static Irrigation_Window_t global_parsed_schedule[64];

// the length of the parsed schedule in ram
volatile static int parsed_schedule_length = 0;

// size for buffers holding schedule version strings
static size_t schedule_version_size = 64;

// size for buffers holding alim json response strings
static size_t alim_response_buffer_size = CONFIG_ALIM_RESPONSE_BUFFER_SIZE;


// small func to create the schedule mutex - called from app_main()
void schedule_mutex_init(void) {
  schedule_mutex = xSemaphoreCreateMutex();
  configASSERT(schedule_mutex != NULL);
}

static volatile bool current_valve_states[4] = {false, false, false, false};
static volatile bool desired_valve_states[4] = {false, false, false, false};
const static bool valve_pins[4] = {GPIO_NUM_26, GPIO_NUM_27, GPIO_NUM_28, GPIO_NUM_29};

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
  static const char *TASK_TAG = "json_parser_into_nvs";

  ESP_LOGI(TASK_TAG, "Hello from scheduler_load_from_json_to_nvs!");

  Load_JSON_To_NVS_Status_t return_value = LOAD_JSON_TO_NVS_SUCCESS;

  // buffer for current schedule
  char schedule_string[CONFIG_ALIM_RESPONSE_BUFFER_SIZE];

  // buffer for the version string of the old schedule - this is retrieved from
  // NVS
  char old_schedule_version[schedule_version_size];

  // root cJSON object
  cJSON *root = cJSON_Parse(json);

  // schedule version from json response - this is defined up here so that the
  // `cleanup:` label doesnt whine about it being uninitialized so i init it to
  // null here but the actual value is a little later here
  char *schedule_version = NULL;

  // flag for whether nvs opened so that cleanup knows to close it + the nvs
  // handle!
  bool nvs_opened = false;
  nvs_handle_t handle;

  // explode if the root cjson object wasn't inited properly
  if (root == NULL) {
    return_value = LOAD_JSON_TO_NVS_PARSING_FAILED;
    goto cleanup;
  }

  // get the schedule version from the json response - stores it in
  // `schedule_version` which is later checked against the one from nvs
  const cJSON *schedule_version_object =
      cJSON_GetObjectItem(root, "schedule_version");
  schedule_version = cJSON_PrintUnformatted(schedule_version_object);

  // get the actual schedule json item
  cJSON *schedule = cJSON_GetObjectItem(root, "schedule");
  if (schedule == NULL) {
    return_value = LOAD_JSON_TO_NVS_PARSING_FAILED;
    goto cleanup;
  }

  // print the json as a string into `schedule_string` (we store this in NVS and
  // then parse it in another func)
  if (!cJSON_PrintPreallocated(schedule, schedule_string,
                               CONFIG_ALIM_RESPONSE_BUFFER_SIZE, false)) {
    return_value = LOAD_JSON_TO_NVS_PARSING_FAILED;
    goto cleanup;
  }

  // open nvs session
  if (nvs_open("aridlink_sched", NVS_READWRITE, &handle) != ESP_OK) {
    return_value = LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED;
    goto cleanup;
  }

  // mark nvs as opened so the cleanup stuff knows to close it
  nvs_opened = true;

  // get the old schedule version string from nvs
  if (nvs_get_str(handle, "sched_version", old_schedule_version,
                  &schedule_version_size) != ESP_OK) {
    return_value = LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED;
    goto cleanup;
  };

  // write the new schedule version string to nvs
  if (nvs_set_str(handle, "sched_version", schedule_version) != ESP_OK) {
    return_value = LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED;
  }

  // write the new schedule to nvs
  if (nvs_set_str(handle, "current_sched", schedule_string) != ESP_OK) {
    return_value = LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED;
    goto cleanup;
  }

  // commit changes to nvs
  if (nvs_commit(handle) != ESP_OK) {
    return_value = LOAD_JSON_TO_NVS_WRITE_TO_NVS_FAILED;
    goto cleanup;
  }

  ESP_LOGI(TASK_TAG, "Checking if the schedule has changed...");
  ESP_LOGI(TASK_TAG, "Old schedule version string: %s", old_schedule_version);
  ESP_LOGI(TASK_TAG, "New schedule version string: %s", schedule_version);

  // check if the schedule changed, and if it did, set the flag so the scheduler
  // knows
  const int strcmp_value = strcmp(old_schedule_version, schedule_version);
  if (strcmp_value != 0) {
    ESP_LOGW(TASK_TAG, "A change has been detected in the schedule!");
    schedule_changed = true;
  } else {
    ESP_LOGI(TASK_TAG, "The schedule has not changed. Ignoring.");
  }

cleanup:
  if (nvs_opened) {
    nvs_close(handle);
  }

  // free up json stuff
  cJSON_free(schedule_version);
  cJSON_Delete(root);

  return return_value;
}

/**
 * Parses a JSON schedule string from the NVS and stores it as an array of
 * structs in RAM.
 *
 * @returns UNLOAD_SCHEDULE_INTO_RAM_SUCCESS if loading into ram succeeded,
 *          UNLOAD_SCHEDULE_INTO_RAM_NVS_FAILED if some NVS action such as
 * reading failed, UNLOAD_SCHEDULE_INTO_RAM_PARSING_FAILED if cJSON failed to
 * parse the string, UNLOAD_SCHEDULE_INTO_RAM_TIME_PARSING_FAILED if parsing the
 * time strings like "06:00" failed.
 */
Unload_Schedule_Into_RAM_Status_t scheduler_unload_nvs_into_ram() {
  static const char *TASK_TAG = "schedule_parser";

  ESP_LOGI(
      TASK_TAG,
      "This function was probably called because there has been a change in "
      "the schedule. Will now attempt to load the schedule into memory...");

  // initialize nvs variables and buffers and handles and stuff
  char current_schedule_json[CONFIG_ALIM_RESPONSE_BUFFER_SIZE];

  // initialize local irrigation window buffer
  Irrigation_Window_t local_buf[64];
  int head_in_array = 0;

  // nvs handle
  nvs_handle_t handle;

  // root cJSON object
  cJSON *root = NULL;

  // flag so that cleanup knows to clean nvs if it opened successfully
  bool nvs_opened = false;

  // the return value. instead of returning directly, in this function i change
  // this return value and then use `goto cleanup` which returns the value but
  // also makes sure the other cleanup stuff is also done
  Unload_Schedule_Into_RAM_Status_t return_value =
      UNLOAD_SCHEDULE_INTO_RAM_SUCCESS;

  // attempt to open nvs session
  if (nvs_open("aridlink_sched", NVS_READWRITE, &handle) != ESP_OK) {
    ESP_LOGE(TASK_TAG, "Cannot open session with NVS!");
    return_value = UNLOAD_SCHEDULE_INTO_RAM_NVS_FAILED;
    goto cleanup;
  };

  // mark nvs as opened so the cleanup code knows to close it
  nvs_opened = true;

  // get schedule json string from nvs
  if (nvs_get_str(handle, "current_sched", current_schedule_json,
                  &alim_response_buffer_size) != ESP_OK) {
    ESP_LOGE(TASK_TAG, "Cannot load schedule from NVS!");
    return_value = UNLOAD_SCHEDULE_INTO_RAM_NVS_FAILED;
    goto cleanup;
  };

  // get root array and length
  root = cJSON_Parse(current_schedule_json);
  if (root == NULL) {
    return_value = UNLOAD_SCHEDULE_INTO_RAM_PARSING_FAILED;
    goto cleanup;
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
    cJSON *start_time = cJSON_GetArrayItem(item, 0);
    if (start_time == NULL) {
      continue;
    }

    // parse duration and skip to next object if it cant
    cJSON *duration_seconds = cJSON_GetArrayItem(item, 1);
    if (duration_seconds == NULL) {
      continue;
    }

    // parse valve and skip to next object if it cant
    cJSON *valve_id = cJSON_GetArrayItem(item, 2);
    if (valve_id == NULL) {
      continue;
    }

    const Irrigation_Window_t irrigation_window = {
        .duration_s = duration_seconds->valueint,
        .start_time = start_time->valueint,
        .valve_id = valve_id->valueint,
    };

    // store the parsed schedule window into the schedule array
    local_buf[head_in_array] = irrigation_window;
    head_in_array++;
  }

  // attempt to store the parsed schedule into the global buffer
  // we try to grab the mutex first.
  int attempts = 0;
  for (;;) {
    if (xSemaphoreTake(schedule_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
      memcpy((void *)global_parsed_schedule, local_buf,
             sizeof(Irrigation_Window_t) * head_in_array);
      xSemaphoreGive(schedule_mutex);
      break;
    } else {
      attempts++;
      if (attempts > 6) {
        return_value = UNLOAD_SCHEDULE_INTO_RAM_FAILED_TO_TAKE_MUTEX;
        goto cleanup;
      }
      vTaskDelay(pdMS_TO_TICKS(100));
    }
  }

  // reset schedule changed flag since it was handled here
  schedule_changed = false;

  // TODO: remove this when testing is over
  // this just prints the schedule from alim for testing while im still building alim
  /*if (schedule_changed) {
    ESP_LOGW(TASK_TAG, "UPDATED SCHEDULE FROM ALIM FOLLOWS:");
    ESP_LOGW(TASK_TAG, "==================================================");
    for (int i = 0; i < head_in_array; i++) {
      const Irrigation_Window_t irrigation_window = global_parsed_schedule[i];
      ESP_LOGW(TASK_TAG,
               "%d) Starts at %03d, and lasts for %d seconds, on valve %d", i,
               irrigation_window.start_time, irrigation_window.duration_s,
               irrigation_window.valve_id);
    }
  }*/

cleanup:
  // delete the json root object
  cJSON_Delete((cJSON *)root);

  // close nvs if it opened
  if (nvs_opened) {
    nvs_close(handle);
  }

  return return_value;
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

  t.tm_hour = irrigation_window.start_time / 60;
  t.tm_min = irrigation_window.start_time % 60;
  t.tm_sec = 0;

  return mktime(&t);
}

/**
 * The irrigation scheduler RTOS task.
 *
 * @param pvParameters Task parameters
 */
void irrigation_scheduler(void *pvParameters) {

  static const char *TASK_TAG = "irrigation_scheduler_task";

  // attempt to unload into ram three times
  int attempts_to_unload = 0;
  while (scheduler_unload_nvs_into_ram() != ESP_OK) {
    attempts_to_unload++;
    if (attempts_to_unload > 3) {
      ESP_LOGE(
          TASK_TAG,
          "FATAL ERROR: COULD NOT UNLOAD SCHEDULE FROM NVS! HARD RESET...");
      abort();
    }
  }

  // ReSharper disable once CppDFAEndlessLoop
  for (;;) {
    // clear valve states
    for (int i = 0; i < 4; i++) {
      desired_valve_states[i] = false;
    }

    // ESP_LOGW(TASK_TAG, "CHECKING IN THE IRRIGATION SCHEDULER WHETHER THE CHANGED FLAG IS SET");
    if (schedule_changed) {
      // attempt to unload into ram three times
      attempts_to_unload = 0;
      while (scheduler_unload_nvs_into_ram() != ESP_OK) {
        attempts_to_unload++;
        if (attempts_to_unload > 3) {
          ESP_LOGE(
              TASK_TAG,
              "FATAL ERROR: COULD NOT UNLOAD SCHEDULE FROM NVS! HARD RESET...");
          abort();
        }
      }
      ESP_LOGW(TASK_TAG, "Updated schedule loaded into memory successfully!");
    }

    // get current time
    time_t now;
    time(&now);

    for (int i = 0; i < parsed_schedule_length; i++) {
      const Irrigation_Window_t irrigation_window = global_parsed_schedule[i];
      const time_t irrigation_timestamp =
          parse_into_timestamp(irrigation_window, now);

      if (now >= irrigation_timestamp &&
          now < (irrigation_timestamp + irrigation_window.duration_s)) {
        desired_valve_states[irrigation_window.valve_id] = true;
      }
    }

    for (int i = 0; i < 4; i++) {
      gpio_set_level(valve_pins[i], desired_valve_states[i]);
    }

    for (int i = 0; i < 4; i++) {
      if (current_valve_states[i] != desired_valve_states[i]) {
        ESP_LOGI(TASK_TAG, "Valve %d state changed from %d to %d", i,
                 current_valve_states[i], desired_valve_states[i]);
      }
    }
    memcpy((void *)current_valve_states, (void *)desired_valve_states, sizeof(bool) * 4);

    // cooldown for half a second before scheduling again
    vTaskDelay(pdMS_TO_TICKS(500));
  }
}
