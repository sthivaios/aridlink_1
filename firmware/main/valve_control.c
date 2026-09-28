#include "valve_control.h"

#include "driver/gpio.h"
#include "esp_log.h"


static const char* TAG = "valve_control";

static ValveStruct_T valve_pins[4] = {
    {.gpio_pin = GPIO_NUM_26, .current_state = false, .desired_state = false},
    {.gpio_pin = GPIO_NUM_27, .current_state = false, .desired_state = false},
    {.gpio_pin = GPIO_NUM_28, .current_state = false, .desired_state = false},
    {.gpio_pin = GPIO_NUM_29, .current_state = false, .desired_state = false},
};
#define VALVE_COUNT (sizeof(valve_pins) / sizeof(valve_pins[0]))

ValveControl_Status_T valve_control_init(void) {
  // set all gpio directions to out
  for (int i = 0; i < VALVE_COUNT; i++) {
    if (gpio_set_direction(valve_pins[i].gpio_pin, GPIO_MODE_OUTPUT) != ESP_OK) {
      return VALVE_CONTROL_ERR_GPIO;
    };
  }
  // pull all gpio pins low
  for (int i = 0; i < VALVE_COUNT; i++) {
    if (gpio_set_level(valve_pins[i].gpio_pin, 0)) {
      return VALVE_CONTROL_ERR_GPIO;
    };
  }
  return VALVE_CONTROL_OK;
}

ValveControl_Status_T valve_control_set_desired_state(const int valve, const bool state) {
  if (valve < 1 || valve > VALVE_COUNT) {
    return VALVE_CONTROL_ERR_ID_OUT_OF_BOUNDS;
  }
  valve_pins[valve-1].desired_state = state;
  return VALVE_CONTROL_OK;
}

ValveControl_Status_T valve_control_commit_states(void) {
  ValveControl_Status_T status = VALVE_CONTROL_OK;

  for (int i = 0; i < VALVE_COUNT; i++) {
    if (valve_pins[i].desired_state != valve_pins[i].current_state) {
      if (gpio_set_level(valve_pins[i].gpio_pin, valve_pins[i].desired_state) == ESP_OK) {
        ESP_LOGI(TAG, "Valve %d's state has change from %d to %d", i+1, valve_pins[i].current_state, valve_pins[i].desired_state);
        valve_pins[i].current_state = valve_pins[i].desired_state;
      } else {
        status = VALVE_CONTROL_ERR_GPIO;
      }
    }
  }

  return status;
}