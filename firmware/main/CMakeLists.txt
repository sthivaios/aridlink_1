set(srcs
        "main.c"
        "scheduler.c"
        "lte.c"
        "fetch_task.c"
        "alim.c"
)

if(CONFIG_MEMLOG_TASK_ENABLED)
    list(APPEND srcs "memlog.c")
endif()

idf_component_register(SRCS ${srcs}
        INCLUDE_DIRS ".")

target_add_binary_data(${COMPONENT_TARGET} "../certs/root_ca.pem" TEXT)
target_add_binary_data(${COMPONENT_TARGET} "../certs/device_cert.pem" TEXT)
target_add_binary_data(${COMPONENT_TARGET} "../certs/device_key.pem" TEXT)