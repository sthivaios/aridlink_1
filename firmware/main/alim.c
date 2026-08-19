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

#include "alim.h"

static const char *TAG = "http_json";

esp_err_t fetch_schedule_from_alim(const char *auth_header, char *out_buf,
                     size_t out_buf_size) {
  if (out_buf == NULL || out_buf_size == 0)
    return ESP_ERR_INVALID_ARG;

  // always hand back a valid (possibly empty) string, so callers never parse
  // stale or uninitialized data if anything below fails
  out_buf[0] = '\0';

  const esp_http_client_config_t config = {
      .url = "https://alim-development-server.twinknet.uk/api/schedule",
      .method = HTTP_METHOD_GET,
      .timeout_ms = 10000,
      .crt_bundle_attach = esp_crt_bundle_attach
  };

  esp_http_client_handle_t client = esp_http_client_init(&config);
  if (!client)
    return ESP_FAIL;

  esp_http_client_set_header(client, "Authorization", auth_header);

  esp_err_t err = esp_http_client_open(client, 0);
  if (err != ESP_OK) {
    ESP_LOGE(TAG, "http client open failed: %s", esp_err_to_name(err));
    esp_http_client_cleanup(client);
    return err;
  }

  esp_http_client_fetch_headers(client);
  int status = esp_http_client_get_status_code(client);

  int total = 0;
  while (total < (int)out_buf_size - 1) {
    int r =
        esp_http_client_read(client, out_buf + total, out_buf_size - 1 - total);
    if (r <= 0)
      break;
    total += r;
  }
  out_buf[total] = '\0';

  esp_http_client_close(client);
  esp_http_client_cleanup(client);

  ESP_LOGI(TAG, "status=%d, got %d bytes", status, total);
  return (status == 200) ? ESP_OK : ESP_FAIL;
}