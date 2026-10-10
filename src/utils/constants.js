export const UserRoleEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
}

export const AvailableUserRole = Object.values(UserRoleEnum)// it will return array of values of enumerable own properties

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progess",
    DONE: "done"
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum)