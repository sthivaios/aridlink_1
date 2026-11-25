idf_component_register(SRCS "lte.c"
                    INCLUDE_DIRS "include"
                    PRIV_REQUIRES esp_modem esp_driver_gpio aridlink_common)
