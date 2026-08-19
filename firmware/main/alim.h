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

#ifndef ARIDLINK_ALIM_H
#define ARIDLINK_ALIM_H

// includes
#include "esp_crt_bundle.h"
#include "esp_err.h"
#include "esp_http_client.h"
#include "esp_log.h"

// yes this is a development authorization header i'll remove this very soon
#define ALIM_AUTHORIZATION_HEADER_DEV "Basic MzUxNDQwMTc0NTEzNzMyOmY3YjkzMzVjNDVjYzgyNWJhZDgyNGY2MmNlNmNmNzQ3ZjY2NzkyNjUyNzU0NDEzYzU4MjVhYmQ2N2Y3MWM5N2I5YzhiZmM0YzhhZThhZWEwNzk3Y2FmNjhlZGNkMDJmODc5Y2I2NzY0YWM2OTk4OThmOThiMWRiMWNhNGU2YTA5"

// function definitions
esp_err_t fetch_schedule_from_alim(const char *auth_header, char *out_buf,
                     size_t out_buf_size);

#endif // ARIDLINK_ALIM_H