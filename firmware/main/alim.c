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

static const char *TAG = "ALIM_TASK";

esp_err_t fetch_schedule_from_alim(const char *auth_header, char *out_buf,
                                   size_t out_buf_size) {
  // check if the arguments are invalid
  if (out_buf == NULL || out_buf_size == 0)
    return ESP_ERR_INVALID_ARG;

  // always return a valid empty string, so the caller never parses an
  // uninitialized buffer
  out_buf[0] = '\0';

  // the esp_http_client configuration
  const esp_http_client_config_t config = {
      .url = "https://alim-development-server.twinknet.uk/api/schedule",
      .method = HTTP_METHOD_GET,
      .timeout_ms = 10000,
      .crt_bundle_attach = esp_crt_bundle_attach};

  // init the client and the handle
  const esp_http_client_handle_t client = esp_http_client_init(&config);
  if (!client)
    return ESP_FAIL;

  // set the auth header
  esp_http_client_set_header(client, "Authorization", auth_header);

  // open the client
  const esp_err_t err = esp_http_client_open(client, 0);

  // check if it errored
  if (err != ESP_OK) {
    ESP_LOGE(TAG, "http client open failed: %s", esp_err_to_name(err));
    esp_http_client_cleanup(client);
    return err;
  }

  // read response headers and status code
  esp_http_client_fetch_headers(client);
  const unsigned int status = esp_http_client_get_status_code(client);

  // read the response body into the buffer
  int total = 0;
  while (total < (int)out_buf_size - 1) {
    int r =
        esp_http_client_read(client, out_buf + total, out_buf_size - 1 - total);
    if (r <= 0)
      break;
    total += r;
  }
  out_buf[total] = '\0';

  // close the client and clean everything up
  esp_http_client_close(client);
  esp_http_client_clear_response_buffer(client);
  esp_http_client_cleanup(client);

  // log whether it worked and return OK or FAIL
  ESP_LOGI(TAG, "status=%d, got %d bytes", status, total);
  return (status == 200) ? ESP_OK : ESP_FAIL;
}