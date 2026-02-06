package com.moa.core.domain.schedule

enum class ScheduleCategory(val label: String, val emoji: String) {
    APPOINTMENT("약속", "📅"),
    ANNIVERSARY("기념일", "🎂"),
    WORK("업무", "💼"),
    HOSPITAL("병원", "🏥"),
    TRAVEL("여행", "✈️"),
    ETC("기타", "📦"),
}
