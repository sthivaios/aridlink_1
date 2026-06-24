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

#ifndef ARIDLINK_LTE_H
#define ARIDLINK_LTE_H
#include "esp_modem_c_api_types.h"

typedef enum {
  LTE_CONNECTED_SUCCESSFULLY,
  LTE_MODEM_NO_CONTACT,
  LTE_MODEM_NO_RSSI,
  LTE_MODEM_COULDNT_SET_MODE,
  LTE_MODEM_COULDNT_GET_IP
} LTE_Connect_Status_t;

esp_modem_dce_t * get_dce();
LTE_Connect_Status_t lte_connect(void);
void modem_wakeup_or_sleep(bool wakeup);
void lte_init(void);

#endif // ARIDLINK_LTE_H
