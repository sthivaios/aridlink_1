idf_component_register(SRCS "./main.c" "wifi.c" "mqtt.c" "shadow.c"
                    INCLUDE_DIRS ".")

target_add_binary_data(${COMPONENT_TARGET} "../certs/root_ca.pem" TEXT)
target_add_binary_data(${COMPONENT_TARGET} "../certs/device_cert.pem" TEXT)
target_add_binary_data(${COMPONENT_TARGET} "../certs/device_key.pem" TEXT)