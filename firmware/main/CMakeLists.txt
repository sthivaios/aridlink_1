set(srcs
        "main.c"
        "scheduler.c"
        "lte.c"
        "fetch_task.c"
        "alim.c"
        "valve_control.c"
)

if(CONFIG_MEMLOG_TASK_ENABLED)
    list(APPEND srcs "memlog.c")
endif()

idf_component_register(SRCS ${srcs}
        INCLUDE_DIRS ".")