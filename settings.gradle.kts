rootProject.name = "moa-calendar"

include(":backend-core")
include(":backend-api")

project(":backend-core").projectDir = file("backend/core")
project(":backend-api").projectDir = file("backend/api")