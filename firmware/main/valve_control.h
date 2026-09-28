#ifndef ARIDLINK_GPIO_H
#define ARIDLINK_GPIO_H
#include <stdint.h>

typedef struct {
  uint32_t gpio_pin;
  bool current_state;
  bool desired_state;
} ValveStruct_T;

typedef enum {
  VALVE_CONTROL_OK,
  VALVE_CONTROL_ERR_GPIO,
  VALVE_CONTROL_ERR_ID_OUT_OF_BOUNDS
} ValveControl_Status_T;

ValveControl_Status_T valve_control_init(void);
ValveControl_Status_T valve_control_set_desired_state(const int valve, const bool state);
ValveControl_Status_T valve_control_commit_states(void);

#endif // ARIDLINK_GPIO_H